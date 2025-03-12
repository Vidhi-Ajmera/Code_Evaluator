from fastapi import FastAPI, HTTPException, Depends, status
from pydantic import BaseModel
from pymongo import MongoClient
from openai import AzureOpenAI
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import json
from typing import Optional, List
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables
load_dotenv()

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection - improved with better error handling and connection string verification
MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    raise ValueError("MONGO_URI environment variable is not set")

# Remove trailing slash if present (this can cause connection issues)
if MONGO_URI.endswith('/'):
    MONGO_URI = MONGO_URI[:-1]

# Try to connect to MongoDB with proper exception handling
try:
    client = MongoClient(MONGO_URI, 
                        connectTimeoutMS=30000,
                        serverSelectionTimeoutMS=5000)  # Add server selection timeout
    # Verify connection by attempting a server info command
    client.admin.command('ping')
    db = client["coding_platform"]
    users_collection = db["users"]
    codes_collection = db["codes"]
    print("Connected to MongoDB successfully!")
except Exception as e:
    print(f"Failed to connect to MongoDB: {e}")
    # Don't raise an exception here, let the application start anyway
    # We'll handle connection errors in the endpoints

# Azure OpenAI setup with better error handling
try:
    openai_api_key = os.getenv("OPENAI_API_KEY")
    openai_endpoint = os.getenv("OPENAI_ENDPOINT")
    openai_api_version = os.getenv("OPENAI_API_VERSION")
    
    if not all([openai_api_key, openai_endpoint, openai_api_version]):
        raise ValueError("One or more OpenAI environment variables are missing")
    
    openai_client = AzureOpenAI(
        api_key=openai_api_key,
        api_version=openai_api_version,
        azure_endpoint=openai_endpoint
    )
    print("Azure OpenAI client initialized successfully!")
except Exception as e:
    print(f"Failed to initialize Azure OpenAI client: {e}")
    openai_client = None  # Set to None instead of raising exception

# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")  # Get from environment or use default
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60  # Extended token lifespan

# OAuth2 Scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Models
class User(BaseModel):
    username: str
    email: str
    password: str

class LoginUser(BaseModel):
    email: str
    password: str

class Code(BaseModel):
    code: str
    language: str  # "java", "python", "c++"
    course_level:  Optional[str] = None  # "freshman", "sophomore", "junior", "senior", "graduate"
    assignment_description: Optional[str] = None
    student_id: Optional[str] = None
    assignment_id: Optional[str] = None
    previous_submissions: Optional[List[str]] = None  # IDs of previous submissions by this student

# JWT Functions
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    return email

# Endpoints with improved error handling
@app.get("/")
async def root():
    # Check MongoDB connection
    try:
        client.admin.command('ping')
        db_status = "Connected"
    except Exception as e:
        db_status = f"Disconnected: {str(e)}"
    
    # Check OpenAI client
    openai_status = "Available" if openai_client else "Unavailable"
    
    return {
        "message": "Welcome to the Coding Platform Backend!",
        "status": {
            "mongodb": db_status,
            "openai": openai_status
        }
    }

@app.post("/signup")
async def signup(user: User):
    try:
        # Check for existing user
        if users_collection.find_one({"email": user.email}):
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Insert new user
        result = users_collection.insert_one(user.dict())
        
        return {
            "message": "User created successfully",
            "user_id": str(result.inserted_id)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.post("/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    try:
        db_user = users_collection.find_one({"email": form_data.username, "password": form_data.password})
        if not db_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": form_data.username}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer", "username": db_user.get("username")}
    except Exception as e:
        if "MongoDB" in str(e):
            raise HTTPException(status_code=500, detail=f"Database connection error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Login error: {str(e)}")

@app.post("/login")
async def login(user: LoginUser):
    try:
        db_user = users_collection.find_one({"email": user.email, "password": user.password})
        if not db_user:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(data={"sub": user.email}, expires_delta=access_token_expires)
        
        return {"access_token": access_token, "token_type": "bearer", "username": db_user.get("username")}
    except Exception as e:
        if "MongoDB" in str(e):
            raise HTTPException(status_code=500, detail=f"Database connection error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Login error: {str(e)}")

@app.post("/submit_code")
async def submit_code(code: Code, email: str = Depends(verify_token)):
    if not openai_client:
        # Fall back to mock analysis if OpenAI is not available
        mock_analysis = generate_mock_analysis(code.code, code.language)
        return {
            "id": "mock-123",
            "plagiarism_analysis": mock_analysis
        }
    
    try:
        # Enhanced system prompt for plagiarism detection and code evaluation
        system_prompt = """
        You are an advanced, highly trained AI model specialized in detecting plagiarism in code submissions. Your expertise includes identifying AI-generated code, copied code from online sources, and assessing the originality of student work. Your analysis must be thorough, precise, and context-aware. Follow these guidelines:

        ---

        ### **Key Responsibilities**

        1. **Detect AI-Generated Code**:
           - Identify patterns typical of AI-generated code (e.g., ChatGPT, Claude, GitHub Copilot).
           - Look for overly consistent formatting, excessive or unnatural comments, and generic variable/function names.
           - Detect code that is overly optimized or uses advanced techniques inconsistent with the student's course level.
           - Flag code that lacks common mistakes or shows an unnatural level of perfection.

        2. **Identify Copied Code**:
           - Recognize code snippets copied from common online sources (e.g., Stack Overflow, GitHub, GeeksforGeeks).
           - Compare the code against known algorithms, functions, or solutions from tutorials or public repositories.
           - Detect inconsistent coding styles, mixed conventions, or abrupt changes in logic that suggest multiple sources.
           - Use contextual clues (e.g., comments, variable names) to trace potential sources.

        3. **Assess Originality**:
           - Evaluate the likelihood that the code was written by the student based on the course level and assignment description.
           - Identify common mistakes, incomplete implementations, or lack of understanding in the code.
           - Check for code that is too simplistic, overly generic, or lacks originality.
           - Consider the student's coding style, if previously available, for consistency.

        4. **Provide Detailed Analysis**:
           - Break down the code into logical sections (e.g., functions, loops, classes) and analyze each part for plagiarism.
           - Provide a confidence score (0-100) for your assessment, considering the strength of evidence.
           - Highlight specific lines or blocks of code that are suspicious, with clear explanations.

        5. **Generate Recommendations**:
           - Suggest follow-up questions to verify the student's understanding of the code.
           - Provide actionable recommendations for improving the originality and quality of the code.

        ---

        ### **Evaluation Parameters**

        Your analysis should also consider the following evaluation parameters from the AI-based Code Evaluator:

        1. **Code Correctness**:
           - Check if the code executes correctly without errors.
           - Verify if the code handles exceptions properly.
           - Compare expected vs. actual output for given test cases.

        2. **Code Efficiency & Performance**:
           - Estimate time complexity using Big-O notation.
           - Measure memory consumption and execution time.
           - Identify performance bottlenecks.

        3. **Code Security Analysis**:
           - Detect SQL injection vulnerabilities.
           - Check for cross-site scripting (XSS) risks.
           - Identify hardcoded secrets (e.g., API keys, passwords).
           - Scan for outdated or vulnerable dependencies.

        4. **Code Readability & Maintainability**:
           - Assess code style and documentation.
           - Evaluate function and variable naming conventions.
           - Analyze cyclomatic complexity and suggest improvements.

        5. **Plagiarism Detection & Code Similarity Analysis**:
           - Perform exact code matching using hashes.
           - Analyze structural similarity using AST (Abstract Syntax Tree).
           - Use NLP-based similarity detection (e.g., SimHash, MinHash) to detect paraphrased code.

        ---

        ### **Output Format**

        Your response must be a structured JSON object with the following fields:

        ```json
        {
            "plagiarism_detected": true/false,
            "confidence_score": 0-100,
            "likely_source": "AI-generated" or "Online resource" or "Original student work",
            "explanation": "Detailed reasoning for your conclusion",
            "suspicious_elements": [
                {
                    "code_section": "Specific lines or blocks of code",
                    "likely_source": "AI-generated" or "Online resource",
                    "confidence": 0-100,
                    "explanation": "Why this section is suspicious"
                }
            ],
            "red_flags": [
                "List of key concerns (e.g., inconsistent style, advanced techniques, lack of originality)"
            ],
            "verification_questions": [
                "Suggested questions to ask the student to verify authorship"
            ],
            "recommendations": [
                "Suggestions for improving originality and understanding"
            ],
            "evaluation_metrics": {
                "code_correctness": {
                    "status": "Passed/Failed",
                    "test_cases": "Number of test cases executed",
                    "failed_cases": "Number of failed test cases"
                },
                "code_efficiency": {
                    "time_complexity": "O(n log n)",
                    "memory_usage": "12MB",
                    "execution_time": "120ms"
                },
                "code_security": {
                    "issues_found": ["SQL Injection", "Hardcoded API Key"],
                    "recommendations": ["Use parameterized queries", "Store API keys securely"]
                },
                "code_readability": {
                    "score": 8.5,
                    "suggestions": ["Improve documentation"]
                }
            }
        }
        ```
        """

        # User message with context
        user_message = f"""
        Analyze this code for plagiarism and evaluate it based on the following parameters:

        ```
        {code.code}
        ```

        **Context**:
        - Language: {code.language}
        - Course Level: {code.course_level if code.course_level else "Not provided"}
        - Assignment Description: {code.assignment_description if code.assignment_description else "Not provided"}

        **Instructions**:
        1. Break down the code into sections and analyze each part for plagiarism.
        2. Provide a confidence score (0-100) for your assessment.
        3. Highlight specific lines or blocks of code that are suspicious.
        4. Evaluate the code based on the following parameters:
           - Code Correctness: Check if the code executes correctly and handles exceptions.
           - Code Efficiency: Estimate time complexity, memory usage, and execution time.
           - Code Security: Detect vulnerabilities such as SQL injection, XSS, and hardcoded secrets.
           - Code Readability: Assess code style, documentation, and naming conventions.
        5. Suggest follow-up questions to verify the student's understanding.
        6. Provide recommendations for improving originality, security, and code quality.

        **Output Format**:
        Your response should be in the structured JSON format provided in the system prompt.
        """

        # Call OpenAI API with better error handling
        try:
            response = openai_client.chat.completions.create(
                model=os.getenv("OPENAI_DEPLOYMENT_NAME", "gpt-35-turbo"),
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                response_format={"type": "json_object"},
                temperature=0.2  # Lower temperature for more consistent analysis
            )
            plagiarism_result = json.loads(response.choices[0].message.content)
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"OpenAI API error: {str(e)}")

        # Save the submission with metadata
        code_data = code.dict()
        code_data["plagiarism_analysis"] = plagiarism_result
        code_data["submission_timestamp"] = datetime.utcnow()
        code_data["submitter_email"] = email

        # Insert into MongoDB with better error handling
        try:
            result = codes_collection.insert_one(code_data)
            return {
                "id": str(result.inserted_id),
                "plagiarism_analysis": plagiarism_result
            }
        except Exception as e:
            # Return the analysis but note that storage failed
            return {
                "id": None,
                "plagiarism_analysis": plagiarism_result,
                "storage_error": f"Failed to save to database: {str(e)}"
            }
            
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Failed to parse plagiarism analysis result")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Plagiarism detection error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

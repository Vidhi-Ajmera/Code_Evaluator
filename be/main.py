from fastapi import FastAPI, HTTPException, Depends, status, Request
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
import bcrypt
import uvicorn

# Load environment variables
load_dotenv()

app = FastAPI()

# Enable CORS - Update this with your frontend URL if needed
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","https://code-evaluator-frontend.vercel.app/", "*"],  # Add your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    raise ValueError("MONGO_URI environment variable is not set")

if MONGO_URI.endswith('/'):
    MONGO_URI = MONGO_URI[:-1]

try:
    client = MongoClient(MONGO_URI, connectTimeoutMS=30000, socketTimeoutMS=30000, 
                        serverSelectionTimeoutMS=5000, retryWrites=True, w="majority")
    client.admin.command('ping')
    db = client["coding_platform"]
    users_collection = db["users"]
    codes_collection = db["codes"]
    print("Connected to MongoDB successfully!")
except Exception as e:
    print(f"Failed to connect to MongoDB: {e}")

# Azure OpenAI setup
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
    openai_client = None

# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 6000

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
    language: str
    course_level: Optional[str] = None
    assignment_description: Optional[str] = None
    student_id: Optional[str] = None
    assignment_id: Optional[str] = None
    previous_submissions: Optional[List[str]] = None

# Helper Functions
def hash_password(password: str) -> str:
    # Generate a salt and hash the password
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed_password.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Verify the password against the hashed password
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

# JWT Functions
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
@app.get("/protected")
async def protected_route(current_user: dict = Depends(verify_token)):
    return {"message": "Access granted", "user": current_user}

# Mock function for when OpenAI is not available
def generate_mock_analysis(code, language):
    return {
        "plagiarism_detected": False,
        "confidence_score": 75,
        "likely_source": "Original student work",
        "explanation": "This is a mock analysis as OpenAI is unavailable",
        "suspicious_elements": [],
        "red_flags": [],
        "verification_questions": ["Can you explain how this code works?"],
        "recommendations": ["Add more comments to improve readability"],
        "evaluation_metrics": {
            "code_correctness": {
                "status": "Passed",
                "test_cases": "5",
                "failed_cases": "0"
            },
            "code_efficiency": {
                "time_complexity": "O(n)",
                "memory_usage": "8MB",
                "execution_time": "100ms"
            },
            "code_security": {
                "issues_found": [],
                "recommendations": []
            },
            "code_readability": {
                "score": 7.5,
                "suggestions": ["Add more documentation"]
            }
        }
    }

# Debug middleware to log requests
@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"Request: {request.method} {request.url}")
    response = await call_next(request)
    print(f"Response Status: {response.status_code}")
    return response

# Endpoints
@app.get("/")
async def root():
    try:
        client.admin.command('ping')
        db_status = "Connected"
    except Exception as e:
        db_status = f"Disconnected: {str(e)}"
    
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
        
        # Hash the password
        hashed_password = hash_password(user.password)
        
        # Insert new user with hashed password
        user_data = user.dict()
        user_data["password"] = hashed_password  # Replace plaintext password with hashed password
        user_data["created_at"] = datetime.utcnow()
        result = users_collection.insert_one(user_data)
        
        # Generate access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token, 
            "username": user.username
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.post("/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    try:
        # OAuth2PasswordRequestForm uses 'username' field, but we're storing email
        # So we use form_data.username as the email
        db_user = users_collection.find_one({"email": form_data.username})
        if not db_user or not verify_password(form_data.password, db_user["password"]):
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
        db_user = users_collection.find_one({"email": user.email})
        if not db_user or not verify_password(user.password, db_user["password"]):
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

### *Key Responsibilities*

1. *Validate Input*:
   - Check if the input is valid code in the specified programming language.
   - If the input is not valid code, return a response indicating that no analysis can be performed.

2. *Detect AI-Generated Code*:
   - Identify patterns typical of AI-generated code (e.g., ChatGPT, Claude, GitHub Copilot).
   - Look for overly consistent formatting, excessive or unnatural comments, and generic variable/function names.
   - Detect code that is overly optimized or uses advanced techniques inconsistent with the student's course level.
   - Flag code that lacks common mistakes or shows an unnatural level of perfection.

3. *Identify Copied Code*:
   - Recognize code snippets copied from common online sources (e.g., Stack Overflow, GitHub, GeeksforGeeks).
   - Compare the code against known algorithms, functions, or solutions from tutorials or public repositories.
   - Detect inconsistent coding styles, mixed conventions, or abrupt changes in logic that suggest multiple sources.
   - Use contextual clues (e.g., comments, variable names) to trace potential sources.

4. *Assess Originality*:
   - Evaluate the likelihood that the code was written by the student based on the course level and assignment description.
   - Identify common mistakes, incomplete implementations, or lack of understanding in the code.
   - Check for code that is too simplistic, overly generic, or lacks originality.
   - Consider the student's coding style, if previously available, for consistency.

5. *Provide Detailed Analysis*:
   - Break down the code into logical sections (e.g., functions, loops, classes) and analyze each part for plagiarism.
   - Provide a confidence score (0-100) for your assessment, considering the strength of evidence.
   - Highlight specific lines or blocks of code that are suspicious, with clear explanations.

6. *Generate Recommendations*:
   - Suggest follow-up questions to verify the student's understanding of the code.
   - Provide actionable recommendations for improving the originality and quality of the code.

---

### *Evaluation Parameters*

Your analysis should also consider the following evaluation parameters from the AI-based Code Evaluator:

1. *Code Correctness*:
   - Check if the code executes correctly without errors.
   - Verify if the code handles exceptions properly.
   - Compare expected vs. actual output for given test cases.

2. *Code Efficiency & Performance*:
   - Estimate time complexity using Big-O notation.
   - Measure memory consumption and execution time.
   - Identify performance bottlenecks.

3. *Code Security Analysis*:
   - Detect SQL injection vulnerabilities.
   - Check for cross-site scripting (XSS) risks.
   - Identify hardcoded secrets (e.g., API keys, passwords).
   - Scan for outdated or vulnerable dependencies.

4. *Code Readability & Maintainability*:
   - Assess code style and documentation.
   - Evaluate function and variable naming conventions.
   - Analyze cyclomatic complexity and suggest improvements.

5. *Plagiarism Detection & Code Similarity Analysis*:
   - Perform exact code matching using hashes.
   - Analyze structural similarity using AST (Abstract Syntax Tree).
   - Use NLP-based similarity detection (e.g., SimHash, MinHash) to detect paraphrased code.

---

### *Output Format*

Your response must be a structured JSON object with the following fields:

json
{
    "is_valid_code": true/false,
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
"""
        # User message with context
        user_message = f"""
Analyze this code for plagiarism and evaluate it based on the following parameters:

{code.code}

*Context*:
- Language: {code.language}
- Course Level: {code.course_level if code.course_level else "Not provided"}
- Assignment Description: {code.assignment_description if code.assignment_description else "Not provided"}

*Instructions*:
1. Validate the input to ensure it is valid code in the specified programming language.
2. If the input is not valid code, return a response indicating that no analysis can be performed.
3. If the input is valid code, break down the code into sections and analyze each part for plagiarism.
4. Provide a confidence score (0-100) for your assessment.
5. Highlight specific lines or blocks of code that are suspicious.
6. Evaluate the code based on the following parameters:
   - Code Correctness: Check if the code executes correctly and handles exceptions.
   - Code Efficiency: Estimate time complexity, memory usage, and execution time.
   - Code Security: Detect vulnerabilities such as SQL injection, XSS, and hardcoded secrets.
   - Code Readability: Assess code style, documentation, and naming conventions.
7. Suggest follow-up questions to verify the student's understanding.
8. Provide recommendations for improving originality, security, and code quality.

*Output Format*:
Your response should be in the structured JSON format provided in the system prompt.
"""

        try:
            response = openai_client.chat.completions.create(
                model=os.getenv("OPENAI_DEPLOYMENT_NAME", "gpt-35-turbo"),
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                response_format={"type": "json_object"},
                temperature=0.2
            )
            plagiarism_result = json.loads(response.choices[0].message.content)
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"OpenAI API error: {str(e)}")

        code_data = code.dict()
        code_data["plagiarism_analysis"] = plagiarism_result
        code_data["submission_timestamp"] = datetime.utcnow()
        code_data["submitter_email"] = email

        try:
            result = codes_collection.insert_one(code_data)
            return {
                "id": str(result.inserted_id),
                "plagiarism_analysis": plagiarism_result
            }
        except Exception as e:
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
    uvicorn.run(app, host="0.0.0.0", port=8000)
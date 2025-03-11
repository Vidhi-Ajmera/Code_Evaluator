import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import axios from "axios";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBSCrLpyTm7ydcsoTXgPICh4vrM3AtMbRM",
  authDomain: "ai-code-evaluator.firebaseapp.com",
  projectId: "ai-code-evaluator",
  storageBucket: "ai-code-evaluator.appspot.com",
  messagingSenderId: "915777028650",
  appId: "1:915777028650:web:6e0ef10ab69cf0a6627953",
  measurementId: "G-JYLJ8SZ4SM",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Function to handle Google login and backend integration
const handleGoogleSignIn = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Get the token from Firebase
    const idToken = await user.getIdToken();

    // Send the token to your backend to create/authenticate the user
    const backendResponse = await axios.post(
      `${process.env.REACT_APP_BACKEND_URL}/firebase_auth`,
      {
        email: user.email,
        username: user.displayName || user.email.split("@")[0],
        firebase_token: idToken,
      }
    );

    // Store the backend token, not the Firebase token
    if (backendResponse.data.access_token) {
      localStorage.setItem("authToken", backendResponse.data.access_token);
      localStorage.setItem(
        "username",
        user.displayName || user.email.split("@")[0]
      );
      return { success: true, user };
    } else {
      throw new Error("Backend authentication failed");
    }
  } catch (error) {
    console.error("Authentication error:", error);
    return { success: false, error };
  }
};

export { auth, provider, signInWithPopup, handleGoogleSignIn };

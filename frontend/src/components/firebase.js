import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// ✅ Use correct `storageBucket`
const firebaseConfig = {
  apiKey: "AIzaSyBSCrLpyTm7ydcsoTXgPICh4vrM3AtMbRM",
  authDomain: "ai-code-evaluator.firebaseapp.com",
  projectId: "ai-code-evaluator",
  storageBucket: "ai-code-evaluator.appspot.com",  // ✅ Fixed storageBucket
  messagingSenderId: "915777028650",
  appId: "1:915777028650:web:6e0ef10ab69cf0a6627953",
  measurementId: "G-JYLJ8SZ4SM",
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup };

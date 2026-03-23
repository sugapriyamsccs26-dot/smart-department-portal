import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Full configuration from your provided Nexus Portal details
const firebaseConfig = {
  apiKey: "AIzaSyAeSd4okPHPPOe2pfcZKeOmymd4UKaR3bw", // Hardcoded safely as typical for Firebase public keys
  authDomain: "nexusportal-c49b0.firebaseapp.com",
  projectId: "nexusportal-c49b0",
  storageBucket: "nexusportal-c49b0.firebasestorage.app",
  messagingSenderId: "382925817804",
  appId: "1:382925817804:web:88259c67033fa5df08ff69",
  measurementId: "G-9WV61W30GH"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize core Firebase services for the frontend
export const auth = getAuth(app);
export const db = getFirestore(app);
// We'll use firebase storage instead of local multer uploads + supabase storage
export const storage = getStorage(app);

export default app;

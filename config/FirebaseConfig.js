// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "project-2-bf274.firebaseapp.com",
  projectId: "project-2-bf274",
  storageBucket: "project-2-bf274.firebasestorage.app",
  messagingSenderId: "593173845833",
  appId: "1:593173845833:web:f459bffc6d5c54becdec98",
  measurementId: "G-NZTR7N7905"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAUGnlRMfURDltVtTrgBqQ9hG0WJgD2VgU",
  authDomain: "next-video-call.firebaseapp.com",
  projectId: "next-video-call",
  storageBucket: "next-video-call.appspot.com",
  messagingSenderId: "58054179143",
  appId: "1:58054179143:web:d455756ade5860e7557462",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore();
const auth = getAuth();

export { db, auth, firebaseConfig };

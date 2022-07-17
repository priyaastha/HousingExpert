// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBLyvciLT8TlTcFC6aPydWHGVKj5lydZ8c",
  authDomain: "housing-expert.firebaseapp.com",
  projectId: "housing-expert",
  storageBucket: "housing-expert.appspot.com",
  messagingSenderId: "292322450181",
  appId: "1:292322450181:web:c6356a3e1f5866d501f56c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore();

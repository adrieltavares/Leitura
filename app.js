// app.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB2aiDvzYoNYwqWWCQtj9ZtNVz1808l2ek",
  authDomain: "leitura-e62b3.firebaseapp.com",
  projectId: "leitura-e62b3",
  storageBucket: "leitura-e62b3.firebasestorage.app",
  messagingSenderId: "227769996951",
  appId: "1:227769996951:web:626bebb9ba8da56c6efbd2",
  measurementId: "G-NL5SYPJ6C8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

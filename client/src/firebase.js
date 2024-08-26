// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey:import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-blog-d0250.firebaseapp.com",
  projectId: "mern-blog-d0250",
  storageBucket: "mern-blog-d0250.appspot.com",
  messagingSenderId: "87772630214",
  appId: "1:87772630214:web:576e9f3fd1cfdae459dbc7"
};

// Initialize Firebase
 export const app = initializeApp(firebaseConfig);
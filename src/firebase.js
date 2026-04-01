import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCKSGxkvmswaxcOy_3MT9-DL6eRhPj3zCY",
  authDomain: "fanta-laurea.firebaseapp.com",
  projectId: "fanta-laurea",
  storageBucket: "fanta-laurea.firebasestorage.app",
  messagingSenderId: "423416085209",
  appId: "1:423416085209:web:29a8bd8430fc6ec3469cc8"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
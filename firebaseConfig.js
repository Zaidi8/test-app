import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBz6S0MRyPjhEj6nuRLn0D0tlcW7gLMnfo",
  authDomain: "test-8a72b.firebaseapp.com",
  projectId: "test-8a72b",
  storageBucket: "test-8a72b.firebasestorage.app",
  messagingSenderId: "5477653748",
  appId: "1:5477653748:web:e29156070ad37e604a52a1",
  measurementId: "G-E4EW5JVTHB"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app)

setPersistence(auth, browserLocalPersistence)
  .then(() => {
    // You can now sign in users, and session will persist
  })
  .catch((error) => {
    console.error("Auth persistence error:",error);
  });

export {auth};
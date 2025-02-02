import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC8WHgnCSP8PEdGdomIcAhl4VUtZByL69s",
  authDomain: "project-shinigami-ccab0.firebaseapp.com",
  projectId: "project-shinigami-ccab0",
  storageBucket: "project-shinigami-ccab0.firebasestorage.app",
  messagingSenderId: "460164849294",
  appId: "1:460164849294:web:cc31d6aab327f00ad5f3df",
  measurementId: "G-BQ2WZTBNMY",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const storage = getStorage(app);
export { app, analytics, auth, storage };

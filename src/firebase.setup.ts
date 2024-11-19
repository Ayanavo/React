import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";

const firebaseConfig = {
  apiKey: "AIzaSyC8WHgnCSP8PEdGdomIcAhl4VUtZByL69s",
  authDomain: "project-shinigami-ccab0.firebaseapp.com",
  projectId: "project-shinigami-ccab0",
  storageBucket: "project-shinigami-ccab0.firebasestorage.app",
  messagingSenderId: "460164849294",
  appId: "1:460164849294:web:cc31d6aab327f00ad5f3df",
  measurementId: "G-BQ2WZTBNMY",
};

firebase.initializeApp(firebaseConfig);
export const auth = firebase.auth();

import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";

const firebaseConfig = {
  apiKey: "AIzaSyBfaWPf-67RgCEmF_tdqrjJZHEhzPzOI9U",
  authDomain: "fir-auth-tut-622be.firebaseapp.com",
  projectId: "fir-auth-tut-622be",
  storageBucket: "fir-auth-tut-622be.appspot.com",
  messagingSenderId: "548365078338",
  appId: "1:548365078338:web:0dffb8e16a479c082a02db",
};

firebase.initializeApp(firebaseConfig);
export const auth = firebase.auth();

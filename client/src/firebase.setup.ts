import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAkhm2ElH_in1DE3Gl9dfr2F1nnucZsvR8",
  authDomain: "epsilon-56800.firebaseapp.com",
  projectId: "epsilon-56800",
  storageBucket: "epsilon-56800.firebasestorage.app",
  messagingSenderId: "779600453663",
  appId: "1:779600453663:web:de6c70506ee043fb4d352a",
  measurementId: "G-509D1ZCMDE",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const storage = getStorage(app);
export { app, analytics, auth, storage };

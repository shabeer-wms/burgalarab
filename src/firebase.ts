
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAlLz1bWFwiv3TTe7xqY6q2QU67jTZVRI8",
  authDomain: "hotel-manager-8c1fe.firebaseapp.com",
  projectId: "hotel-manager-8c1fe",
  storageBucket: "hotel-manager-8c1fe.firebasestorage.app",
  messagingSenderId: "515333293848",
  appId: "1:515333293848:web:4f1a425b701fb839dac06d",
  measurementId: "G-84BBQ0WRN8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

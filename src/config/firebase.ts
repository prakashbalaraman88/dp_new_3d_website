import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics"; // Analytics optional, keeping it commented out if not strictly needed now, or can enable.

const firebaseConfig = {
    apiKey: "AIzaSyDfGbSFttuLf4nv1IEgM5LEqTXVfxnFgcU",
    authDomain: "dpcalculator-7e2eb.firebaseapp.com",
    projectId: "dpcalculator-7e2eb",
    storageBucket: "dpcalculator-7e2eb.firebasestorage.app",
    messagingSenderId: "1026821245642",
    appId: "1:1026821245642:web:d1b733810b04247a0a8233",
    measurementId: "G-XSQWJJ62XK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app); // Enable if needed

// Initialize Firestore and Export
export const db = getFirestore(app);

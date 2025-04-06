// firebase.js 
// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-analytics.js";
import { getDatabase, ref, set, get, onValue } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

// Cấu hình Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBT6LriuMIAVKBhOUJX_3d-oVRwklvptDA",
  authDomain: "mon-33182.firebaseapp.com",
  databaseURL: "https://mon-33182-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "mon-33182",
  storageBucket: "mon-33182.firebasestorage.app",
  messagingSenderId: "1023827948484",
  appId: "1:1023827948484:web:8bdde6dcb4454af42d2a91",
  measurementId: "G-EF4J5XT43E"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app);

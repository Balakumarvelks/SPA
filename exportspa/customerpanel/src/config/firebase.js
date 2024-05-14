import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBBosM41-qqvsgfjBYuQAbgUSqQokJ8gf0",
  authDomain: "palaniyappa-d2822.firebaseapp.com",
  databaseURL: "https://palaniyappa-d2822-default-rtdb.firebaseio.com",
  projectId: "palaniyappa-d2822",
  storageBucket: "palaniyappa-d2822.appspot.com",
  messagingSenderId: "160649579352",
  appId: "1:160649579352:web:111700ad2af0e5251cf32d",
  measurementId: "G-8VQMGRF9F5",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { auth, db, storage };

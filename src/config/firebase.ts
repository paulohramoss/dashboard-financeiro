import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCxoSshMY0Yx6xOnYStjjBcyukfzjVyqeQ",
  authDomain: "phr-financeiro.firebaseapp.com",
  projectId: "phr-financeiro",
  storageBucket: "phr-financeiro.appspot.com",
  messagingSenderId: "982827507837",
  appId: "1:982827507837:web:8f2be18a42bcc55288d114"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
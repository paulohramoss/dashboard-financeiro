// ATENÇÃO: As credenciais do Firebase devem ser configuradas em variáveis de ambiente no arquivo .env, que NÃO deve ser versionado.
// Veja o arquivo .env.example para referência.
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCxoSshMY0Yx6xOnYStjjBcyukfzjVyqeQ",
  authDomain: "phr-financeiro.firebaseapp.com",
  projectId: "phr-financeiro",
  storageBucket: "phr-financeiro.appspot.com",
  messagingSenderId: "982827507837",
  appId: "1:982827507837:web:8f2be18a42bcc55288d114",
  measurementId: "G-DX5F8DDFMN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
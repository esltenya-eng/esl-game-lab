
import { initializeApp, FirebaseApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, Auth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, Firestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// initializeApp/getAuth/getFirestore throw synchronously when the config is
// missing or malformed (e.g. auth/invalid-api-key) -- and this module is
// imported transitively by App.tsx before ReactDOM ever renders anything, so
// an uncaught throw here blanks the entire page with no error boundary able
// to catch it (error boundaries only catch errors during render/lifecycle,
// not synchronous throws during module evaluation). Guard it so a missing or
// broken Firebase secret degrades to "auth/cloud-sync features are
// unavailable" instead of "the whole app is a blank page."
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let googleProvider: GoogleAuthProvider | null = null;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: 'select_account' });
} catch (err) {
  console.error(
    "ESL GAME LAB: Firebase failed to initialize -- auth and cloud sync are disabled for this session. " +
    "Game browsing still works normally. Check VITE_FIREBASE_* environment variables.",
    err
  );
}

export const isFirebaseConfigured = auth !== null && db !== null;
export { app, auth, db, googleProvider };

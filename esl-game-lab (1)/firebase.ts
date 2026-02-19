
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC24XEwwkgRElUYA8oS_dXTGiKoqFYozbk",
  authDomain: "esl-game-lab.firebaseapp.com",
  projectId: "esl-game-lab",
  storageBucket: "esl-game-lab.appspot.com",
  messagingSenderId: "691204723028",
  appId: "1:691204723028:web:090f6a43615d72e273f8c1",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ 
  prompt: 'select_account' 
});


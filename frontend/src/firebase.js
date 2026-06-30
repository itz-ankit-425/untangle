import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDdi_Bd4BQITADgHCPbiqPp-3_WXJWZKvQ",
  authDomain: "untangle-937f8.firebaseapp.com",
  projectId: "untangle-937f8",
  storageBucket: "untangle-937f8.firebasestorage.app",
  messagingSenderId: "784450638085",
  appId: "1:784450638085:web:7b2e9a27209bcf90a1a76c"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export function loginWithGoogle() {
  return signInWithPopup(auth, provider);
}

export function logout() {
  return signOut(auth);
}

export function watchAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}
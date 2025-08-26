// Firebase config for your app
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC_wf0Yew8slRJkoIvnH_tmzRZkdnbQXeQ",
  authDomain: "citadel-guard-nya4s.firebaseapp.com",
  projectId: "citadel-guard-nya4s",
  storageBucket: "citadel-guard-nya4s.firebasestorage.app",
  messagingSenderId: "397789642202",
  appId: "1:397789642202:web:99397c09799affb44f14e3"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, UserCredential } from "firebase/auth";

// Sign up with email and password
export async function signUpWithEmail(email: string, password: string): Promise<UserCredential> {
  return await createUserWithEmailAndPassword(auth, email, password);
}

// Sign in with email and password
export async function signInWithEmail(email: string, password: string): Promise<UserCredential> {
  return await signInWithEmailAndPassword(auth, email, password);
}

// Sign out
export async function signOutUser(): Promise<void> {
  return await signOut(auth);
}

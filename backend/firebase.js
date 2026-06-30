import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { readFileSync } from "fs";
import dotenv from "dotenv";
dotenv.config();

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  serviceAccount = JSON.parse(readFileSync("./serviceAccountKey.json", "utf8"));
}

initializeApp({
  credential: cert(serviceAccount),
  projectId: "untangle-937f8",
});

export const db = getFirestore();
export const auth = getAuth();
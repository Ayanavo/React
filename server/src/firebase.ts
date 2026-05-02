import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

type FirebaseServiceAccount = {
  projectId: string;
  clientEmail: string;
  privateKey: string;
};

const parseServiceAccountJson = (raw: string) => {
  try {
    return JSON.parse(raw);
  } catch {
    const decoded = Buffer.from(raw, "base64").toString("utf8");
    return JSON.parse(decoded);
  }
};

const getServiceAccount = (): FirebaseServiceAccount => {
  const rawServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT?.trim();
  const serviceAccount = rawServiceAccount ? parseServiceAccountJson(rawServiceAccount) : {};

  const projectId = serviceAccount.project_id || serviceAccount.projectId || process.env.FIREBASE_PROJECT_ID;
  const clientEmail = serviceAccount.client_email || serviceAccount.clientEmail || process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = serviceAccount.private_key || serviceAccount.privateKey || process.env.FIREBASE_PRIVATE_KEY;

  if (typeof projectId !== "string" || typeof clientEmail !== "string" || typeof privateKey !== "string") {
    throw new Error("Firebase service account is invalid. Set FIREBASE_SERVICE_ACCOUNT as the full service account JSON, or set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.");
  }

  return {
    projectId,
    clientEmail,
    privateKey: privateKey.replace(/\\n/g, "\n"),
  };
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(getServiceAccount()),
  });
}

export default admin;

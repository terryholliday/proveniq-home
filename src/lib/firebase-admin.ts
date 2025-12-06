import { initializeApp, getApps, getApp, cert, ServiceAccount, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import fs from "fs";
import path from "path";

let app;

if (!getApps().length) {
  const gacPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (gacPath && !fs.existsSync(gacPath)) {
    console.warn(`GOOGLE_APPLICATION_CREDENTIALS points to missing file: ${gacPath}. Falling back to default credentials.`);
    delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
  }

  const credentialsPath = path.join(process.cwd(), 'src/lib/firebase-credentials.json');

  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY) as ServiceAccount;
      app = initializeApp({
        credential: cert(serviceAccount),
      });
    } catch (error) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY", error);
      app = initializeApp({ credential: applicationDefault() });
    }
  } else if (fs.existsSync(credentialsPath)) {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath;
    app = initializeApp({
      credential: applicationDefault(),
      projectId: "studio-2235881373-5c755"
    });
  } else {
    app = initializeApp({ credential: applicationDefault() });
  }
} else {
  app = getApp();
}

export const adminDb = getFirestore(app);
export const adminAuth = getAuth(app);

import { initializeApp, type FirebaseApp } from "firebase/app";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";
import {
  connectFirestoreEmulator,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from "firebase/firestore";

const env = import.meta.env;

const config = {
  apiKey: env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: env.VITE_FIREBASE_APP_ID as string | undefined,
};

export const firebaseConfigured = Boolean(
  config.apiKey && config.authDomain && config.projectId && config.appId
);

export const firebaseDisabled =
  String(env.VITE_FIREBASE_DISABLED || "").toLowerCase() === "true";

export const firebaseEnabled = firebaseConfigured && !firebaseDisabled;

export const useEmulators =
  import.meta.env.DEV &&
  String(env.VITE_USE_FIREBASE_EMULATORS || "").toLowerCase() === "true";

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

/** Lazily initialise Firebase so the app still works with no config. */
export function getFirebase(): { auth: Auth; db: Firestore } | null {
  if (!firebaseEnabled) return null;
  if (!app) {
    try {
      const nextApp = initializeApp(config as Record<string, string>);
      const nextAuth = getAuth(nextApp);
      const nextDb = initializeFirestore(nextApp, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      });

      if (useEmulators) {
        connectAuthEmulator(nextAuth, "http://127.0.0.1:9099", {
          disableWarnings: true,
        });
        connectFirestoreEmulator(nextDb, "127.0.0.1", 8080);
      }

      app = nextApp;
      auth = nextAuth;
      db = nextDb;
    } catch (err) {
      console.error("[firebase] could not initialise", err);
      return null;
    }
  }
  if (!auth || !db) return null;
  return { auth, db };
}


import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    updateProfile,
    onAuthStateChanged,
    signOut
} from "firebase/auth";
import { getMessaging, getToken, isSupported, Messaging } from "firebase/messaging";

/**
 * Firebase configuration.
 * For the React frontend, we use VITE_ environment variables.
 */
  export const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY || "",
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "",
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || "",
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: process.env.VITE_FIREBASE_APP_ID || ""
};

// ── Safe Firebase Initialization ──
let firebaseApp: FirebaseApp | null = null;
let isConfigured = false;

const isConfigMissing = Object.values(firebaseConfig).some(val => !val || val === "");

console.log("[Firebase] Config check:", {
    apiKey: !!firebaseConfig.apiKey,
    authDomain: !!firebaseConfig.authDomain,
    projectId: !!firebaseConfig.projectId,
    storageBucket: !!firebaseConfig.storageBucket,
    messagingSenderId: !!firebaseConfig.messagingSenderId,
    appId: !!firebaseConfig.appId,
    isConfigMissing
});

if (isConfigMissing) {
    console.warn(
        "[Firebase] Client Configuration is incomplete. " +
        "Authentication and Messaging features will be disabled."
    );
} else {
    firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    isConfigured = true;
    console.log("[Firebase] App initialized successfully. isConfigured:", isConfigured);
}

const auth = isConfigured && firebaseApp ? getAuth(firebaseApp) : null;
const googleProvider = isConfigured ? (() => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    return provider;
})() : null;

// ── FCM Token Request ──
// This function:
// 1. Checks if messaging is supported in this browser
// 2. Requests notification permission from the user
// 3. Returns the FCM token string (or null if denied/unsupported)
export const requestNotificationPermission = async (): Promise<string | null> => {
    console.log("[FCM] requestNotificationPermission called.");
    console.log("[FCM] isConfigured:", isConfigured, "firebaseApp:", !!firebaseApp);
    try {
        if (!isConfigured || !firebaseApp) {
            console.log("[FCM] Firebase not configured, skipping FCM token request.");
            return null;
        }

        const supported = await isSupported();
        console.log("[FCM] isSupported():", supported);
        if (!supported) {
            console.log("[FCM] Firebase Messaging is NOT supported in this browser.");
            return null;
        }

        // Ask the user for notification permission
        console.log("[FCM] Requesting Notification.requestPermission()...");
        const permission = await Notification.requestPermission();
        console.log("[FCM] Permission result:", permission);
        if (permission !== 'granted') {
            console.log("[FCM] Notification permission denied by user.");
            return null;
        }

        // Permission granted — get the FCM token
        const messaging: Messaging = getMessaging(firebaseApp);
        const vapidKey = process.env.VITE_FIREBASE_VAPID_KEY;
        console.log("[FCM] VAPID Key present:", !!vapidKey);
        console.log("[FCM] VAPID Key value:", vapidKey?.substring(0, 10) + "...");

        if (!vapidKey) {
            console.warn("[FCM] VITE_FIREBASE_VAPID_KEY is not set. Cannot retrieve FCM token.");
            return null;
        }

        console.log("[FCM] Calling getToken()...");
        const currentToken = await getToken(messaging, { vapidKey });
        if (currentToken) {
            console.log("[FCM] ✅ Token retrieved successfully:", currentToken.substring(0, 20) + "...");
            return currentToken;
        } else {
            console.log("[FCM] ❌ No registration token available (getToken returned empty).");
            return null;
        }
    } catch (error) {
        console.error("[FCM] ❌ Error retrieving FCM token:", error);
        return null;
    }
};

export { auth, googleProvider, isConfigured };

// Export auth methods for easier consumption
export {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    updateProfile,
    onAuthStateChanged,
    signOut
};

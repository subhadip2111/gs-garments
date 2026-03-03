
import { initializeApp, getApps, getApp } from "firebase/app";
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

/**
 * Firebase configuration.
 * Note: The service account JSON provided by the user is for the Admin SDK (backend).
 * For the React frontend, we use these environment variables which correspond to the 
 * Firebase Web App configuration.
 */
const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY || "",
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "",
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || "",
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: process.env.VITE_FIREBASE_APP_ID || ""
};

/**
 * A "Safe" Firebase initialization.
 * Prevents the app from crashing if configuration is missing and logs a warning.
 */
const initializeSafeFirebase = () => {
    const isConfigMissing = Object.values(firebaseConfig).some(val => !val || val === "");

    if (isConfigMissing) {
        console.warn(
            "Firebase Client Configuration is incomplete. " +
            "Authentication features will be disabled until VITE_FIREBASE_* environment variables are set."
        );

        // Return a dummy auth object to prevent immediate reference errors
        // Standard Firebase SDK doesn't support easy "Proxy-fying" like this, 
        // but we'll export it and consumers should check for validity.
        return {
            auth: null,
            googleProvider: null,
            isConfigured: false
        };
    }

    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({
        prompt: "select_account"
    });

    return {
        auth,
        googleProvider,
        isConfigured: true
    };
};

export const { auth, googleProvider, isConfigured } = initializeSafeFirebase();

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

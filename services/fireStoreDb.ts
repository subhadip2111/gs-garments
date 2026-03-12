import { firebaseConfig } from "./firebase";

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const app = initializeApp(firebaseConfig);
// Export firestore database
// It will be imported into your react app whenever it is needed
export const fireStoreDb = getFirestore(app);

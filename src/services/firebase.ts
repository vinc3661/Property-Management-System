import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot } from "firebase/firestore";
import type { Tenant } from "../types/Tenant";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};


const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

const COLLECTION_NAME = "Tenant";


 
 
export async function addTenantToCloud(tenantData: Omit<Tenant, "id">): Promise<Tenant> {
  try {
    const tenantCollection = collection(db, COLLECTION_NAME);
    const docRef = await addDoc(tenantCollection, tenantData);
    
    return {
      ...tenantData,
      id: docRef.id,
    };
  } catch (error) {
    console.error("Failed to add tenant to the database:", error);
    throw error;
  }
}


 
export function subscribeToTenants(onDataUpdate: (tenants: Tenant[]) => void): () => void {
  const tenantCollection = collection(db, COLLECTION_NAME);

  const unsubscribe = onSnapshot(
    tenantCollection,
    (querySnapshot) => {
      const tenants: Tenant[] = querySnapshot.docs.map((doc) => ({
        ...(doc.data() as Omit<Tenant, "id">),
        id: doc.id,
      }));

      onDataUpdate(tenants);
    },
    (error) => {
      console.error("Real-time sync failed:", error);
    }
  );

  return unsubscribe;
}

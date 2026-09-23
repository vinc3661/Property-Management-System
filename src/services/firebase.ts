import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import {getAuth} from "firebase/auth";
import type { Tenant } from "../types/Tenant";
import type {Property} from "../types/Property";
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
console.log("Firebase project:", firebaseConfig.projectId);
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth=getAuth(app);
const PROPERTY_COLLECTION = "properties";
const TENANT_COLLECTION="tenants";

export async function addTenantToCloud(
  tenantData: Omit<Tenant, "id">
): Promise<Tenant> {
  try {
    const tenantCollection = collection(db, TENANT_COLLECTION);
    
    console.log("About to save tenant:", tenantData);
    const docRef = await addDoc(tenantCollection, tenantData);
console.log("Tenant saved with ID:", docRef.id);
    
console.log("🔥 ADD DOC FINISHED");
console.log("🔥 DOCUMENT ID:", docRef.id);

return {
      ...tenantData,
      id: docRef.id,
    };
  } catch (error) {
    console.error("Failed to add tenant to the database:", error);
    throw error;
  }
}

export async function updateTenantsInCloud(
  id: string,
  updates: Partial<Omit<Tenant, "id">>
): Promise<void> {
  try {
    const tenantDocument = doc(db, TENANT_COLLECTION, id);

    await updateDoc(tenantDocument, updates);
  } catch (error) {
    console.error("Failed to update tenant:", error);
    throw error;
  }
}

export async function deleteTenantFromCloud(
  id: string
): Promise<void> {
  try {
    const tenantDocument = doc(db, TENANT_COLLECTION, id);

    await deleteDoc(tenantDocument);
  } catch (error) {
    console.error("Failed to delete tenant from the cloud:", error);
    throw error;
  }
}

export function subscribeToTenants(
  onDataUpdate: (tenants: Tenant[]) => void
): () => void {
  const tenantCollection = collection(db, TENANT_COLLECTION);

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

export async function getTenantsFromCloud(): Promise<Tenant[]> {
  try {
    const tenantCollection = collection(db, TENANT_COLLECTION);
    const querySnapshot = await getDocs(tenantCollection);

    const tenants: Tenant[] = querySnapshot.docs.map((doc) => ({
      ...(doc.data() as Omit<Tenant, "id">),
      id: doc.id,
    }));

    return tenants;
  } catch (error) {
    console.error("Failed to get tenants:", error);
    throw error;
  }
}


export  async function addPropertiesToCloud(PropertyData:Omit<Property,'id'>):Promise<Property>{
try{
const propertyCollection=collection(db,PROPERTY_COLLECTION);
const docRef=await addDoc(propertyCollection,PropertyData);

return{
  ...PropertyData,
  id:docRef.id,
};
}catch(error){
  console.error('failed to add Property to Cluod:',error);
throw error

}

};

export async function updatePropertiesInCloud(id:string,updates:Partial<Omit<Property,'id'>>):Promise<void>{
  try{
    const propertyDocument=doc(db,PROPERTY_COLLECTION,id);
    await updateDoc(propertyDocument,updates)
  }catch(error){
    console.error('failed to update Property:',error);
    throw error 
  
  }
  
};
  export async function  deletePropertyFromCloud(id:string):Promise<void>{
    try{
      const propertyDocument=doc(db,PROPERTY_COLLECTION,id);
      await deleteDoc(propertyDocument);
    }catch(error){
      console.error("failed to delete Property in cluod:",error);
      throw error
    }
  };

  export async function getPropertiesFromCloud():Promise<Property[]>{
    try{
      const propertyCollection=collection(db,PROPERTY_COLLECTION);
      const QuerySnapShot=await getDocs(propertyCollection);

     const Properties:Property[]=QuerySnapShot.docs.map((doc)=>({
       ...(doc.data() as Omit <Property, 'id'> ),
       id:doc.id,

       

     }));
return Properties;
    }catch(error){
      console.error('failed to get Property in Cloud:',error);
      throw error

    }
  };

  export function subscribeToProperties(
    onDataUpdate: (properties: Property[]) => void
  ): () => void {
    const propertyCollection = collection(db, PROPERTY_COLLECTION);
    const unsubscribe = onSnapshot(
      propertyCollection,
      (querySnapshot) => {
        const properties: Property[] = querySnapshot.docs.map((doc) => ({
          ...(doc.data() as Omit<Property, "id">),
          id: doc.id,
        }));
        onDataUpdate(properties);
      },
      (error) => {
        console.error("real time sync failed:", error);
      }
    );

    return unsubscribe;
  }
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
  setDoc,
  getDoc,
  query,
  where,
serverTimestamp,  

  
} from "firebase/firestore";

import { getAuth} from "firebase/auth";
import type { Tenant } from "../types/Tenant";
import type {Property} from "../types/Property";
import type { UserProfile } from "../types/UserProfile";
import { supabase } from "./supabase";
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
const PROFILE_COLLECTION="profiles";
const APPLICATIN_COLLECTION="applicants";
export async function addTenantToCloud(
  landlordId: string,
  tenantData: Omit<Tenant, "id"|'landlordId'>
): Promise<Tenant> {
  try {
    const tenantCollection = collection(db, TENANT_COLLECTION);
    
    console.log("About to save tenant:", tenantData);
    const docRef = await addDoc(tenantCollection, { ...tenantData, landlordId });
console.log("Tenant saved with ID:", docRef.id);
    
console.log("🔥 ADD DOC FINISHED");
console.log("🔥 DOCUMENT ID:", docRef.id);

return {
      ...tenantData,
      id: docRef.id,
      landlordId,
    };
  } catch (error) {
    console.error("Failed to add tenant to the database:", error);
    throw error;
  }
};

export async function updateTenantsInCloud(
  id: string,
  updates: Partial<Omit<Tenant, "id"|'landlordId'>>
): Promise<void> {
  try {
    const tenantDocument = doc(db, TENANT_COLLECTION, id);

    await updateDoc(tenantDocument, updates);
  } catch (error) {
    console.error("Failed to update tenant:", error);
    throw error;
  }
};

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
};

export function subscribeToTenants(
  landlordId: string,
  onDataUpdate: (tenants: Tenant[]) => void
): () => void {
  const tenantQuery = query(
    collection(db, TENANT_COLLECTION),
    where("landlordId", "==", landlordId)
  );

  return onSnapshot(tenantQuery, (snapshot) => {
    const tenants: Tenant[] = snapshot.docs.map((tenantDoc) => ({
      ...(tenantDoc.data() as Omit<Tenant, "id">),
      id: tenantDoc.id,
    }));

    onDataUpdate(tenants);
  });
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
};


export  async function addPropertiesToCloud(landlordId: string, PropertyData:Omit<Property,'id'|"landlordId">):Promise<Property>{
try{
const propertyCollection=collection(db,PROPERTY_COLLECTION);
const docRef=await addDoc(propertyCollection, { ...PropertyData, landlordId });
console.log('property added with ID:',docRef.id);
return{
  ...PropertyData,
  id:docRef.id,
  landlordId,
};
}catch(error){
  console.error('failed to add Property to Cluod:',error);
throw error

}

};

export async function updatePropertiesInCloud(id:string,updates:Partial<Omit<Property,'id'|'landlordId'>>):Promise<void>{
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
    landlordId: string,
    onDataUpdate: (properties: Property[]) => void
  ): () => void {
    const propertiesQuery = query(
      collection(db, PROPERTY_COLLECTION),
      where("landlordId", "==", landlordId)
    );

    return onSnapshot(propertiesQuery, (snapshot) => {
      const properties: Property[] = snapshot.docs.map((propertyDoc) => ({
        ...(propertyDoc.data() as Omit<Property, "id">),
        id: propertyDoc.id,
      }));

      onDataUpdate(properties);
    });
  }

  export async function setUserProfile(id:string, profile:UserProfile){
    try{
      const docRef=doc(db,PROFILE_COLLECTION,id);
      console.log("Authenticated UID:", id);
console.log("Profile being saved:", profile);
console.log("Auth email:", auth.currentUser?.email);
      await setDoc(docRef,{
        email:profile.email,
        role:profile.role,
        name:profile.name,
        landlordId:profile.landlordId,
      });
      console.log('user profile set:',docRef.id);
      return{
        ...profile,
        id:docRef.id,
      };
    }catch(error){
      console.error('failed to set user profile:',error);
    throw error;
      
    }


  };

  export async function getUserProfile(id:string):Promise<UserProfile | null>{
    try{
      const docRef=doc(db, PROFILE_COLLECTION,id);
     const docSnap= await getDoc(docRef);
        if(!docSnap.exists()){
          console.log('user profile not found:',docRef.id);
          return null;
        }
      console.log('user profile get:',docRef.id);
      return{
        ...docSnap.data(),
        id:docSnap.id,
      }as UserProfile;
    }catch(error){
      console.error('failed to get user profile:',error);
      throw error;
      };
      
    };

    
export async function submitLandlordApplication(
  propertyName: string,
  propertyAddress: string,
  ownershipDocument: File
): Promise<void> {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("you must have a signed in user account");
  }

  const token=await user.getIdToken();
  if(!token){
    throw new Error("no signed token");
  }

  const formData=new FormData();
  formData.append("propertyName",propertyName);
  formData.append("file",ownershipDocument);
  formData.append("propertyADress",propertyAddress);

const {error,data}=await supabase.functions.invoke<{
  uid:string,
  documentPath:string,
}>("submit-landlord-application",{

  headers:{
  "x-firebase-id-token": token,
},
body:formData,

});

if(error){
  console.error("supabase function failed:",error.message);
  throw new Error(error.message);
};

if(!data?.documentPath||data.uid !==user.uid){
  throw new Error("invalid response from document upload service");
}

const applicationRef = doc(collection(db, APPLICATIN_COLLECTION));

  await setDoc(applicationRef, {
    applicantId: user.uid,
    propertyAddress,
    propertyName,
    documentPath: data.documentPath,
    documentFileName: ownershipDocument.name,
    submittedAt: serverTimestamp(),
    status: "pending",
  });
};






const { data, error } = await supabase.functions.invoke<{
  answer: string;
}>("open-ai", {
  headers: {
    "x-firebase-id-token": token,
  },
  body: {
    question: "Which properties are vacant?",
  },
});

if (error) {
  console.error("Supabase function failed:", error);
  throw error;
}

if (typeof data?.answer !== "string" || !data.answer.trim()) {
  throw new Error("The AI function returned no answer");
}

console.log("AI answer:", data.answer);

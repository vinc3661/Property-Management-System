import {getFirestore,addDoc,collection} from "firebase/firestore";
import {initializeApp} from "firebase/app";
import {type Tenant} from "../types/Tenant";


const firebaseConfig={
apiKey:import.meta.env.VITE_FIREBASE_API_KEY,
authDomain:import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
projectId:import.meta.env.VITE_FIREBASE_AUTH_ID,
storageBucket:import.meta.env.VITE_FIREBASE_STORAGE_BUKCKET,
messagingSenderId:import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
appId:import.meta.env.VITE_FIREBASE_APP_ID
};

const App=initializeApp(firebaseConfig);
const db=getFirestore(App);



export async function addTenantToCloud(tenantData:Omit<Tenant,'id'>):Promise<Tenant>{
try{
const TenatColletion=collection(db,'Tenant');
const docRef=await addDoc(TenatColletion,tenantData);
return {
...tenantData,
id:docRef.id
};


}catch(error){
console.error('failed to add tenants to the database');
throw error
}

}



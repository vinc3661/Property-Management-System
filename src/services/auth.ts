import { createUserWithEmailAndPassword } from "firebase/auth";
import {signInWithEmailAndPassword} from "firebase/auth";
import {auth} from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { GoogleAuthProvider, signInWithPopup,signInWithPhoneNumber } from "firebase/auth";
import type { User } from "firebase/auth";
export async function registerUser(email:string,password:string):Promise<void>{
    try{
 
       const credentials =  await createUserWithEmailAndPassword(auth,email,password);
      console.log('user:',credentials.user);
      console.log('userID:',credentials.user.uid);
      

}catch(error){
        console.error('failed to register user:',error);
      throw error;    
    }
};
export async function signUser(email:string,password:string):Promise<void>{
  try{
    const credentials=await signInWithEmailAndPassword(auth,email,password);
    console.log('user:',credentials.user);
    console.log('user Id:',credentials.user.uid); 
  }catch(error){
    console.error('failed to sighn in user:',error);
    throw error;
  }
};


export function SubscribeToAuthState(callback: (user:User|null) => void){
  return  onAuthStateChanged (auth,callback);
};
  
export async function signInWithGoogle():Promise<User>{
try{
const Provider= new GoogleAuthProvider();

const credentials= await signInWithPopup(auth,Provider);
console.log("Google user:",credentials.user);
console.log("Google user Id:",credentials.user.uid)
return credentials.user;
}catch(error){
  console.error("google sign in failed:",error);
  throw error;


}
};



export async function signWithNumber(phoneNumber:string):Promise<void>{
try{
const credentials=await signInWithPhoneNumber(auth,phoneNumber);
console.log("confirmation result:",credentials);
console.log("verification id:",credentials.verificationId);

}catch(error){
  console.error("failed to sign in with number");
  throw Error;
}



};
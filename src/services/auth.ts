import { createUserWithEmailAndPassword } from "firebase/auth";
import {signInWithEmailAndPassword} from "firebase/auth";
import {auth} from "./firebase";
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
export async function sighnUser(email:string,password:string):Promise<void>{
  try{
    const credentials=await signInWithEmailAndPassword(auth,email,password);
    console.log('user:',credentials.user);
    console.log('user Id:',credentials.user.uid); 
  }catch(error){
    console.error('failed to sighn in user:',error);
    throw error;
  }
};
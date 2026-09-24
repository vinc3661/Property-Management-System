import { createUserWithEmailAndPassword } from "firebase/auth";
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
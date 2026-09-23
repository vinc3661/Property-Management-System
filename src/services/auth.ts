import { createUserWithEmailAndPassword } from "firebase/auth";
import {auth} from "./firebase";
export async function registerUser(email:string,password:string):Promise<void>{
    try{
        await createUserWithEmailAndPassword(auth,email,password);
    }catch(error){
        console.error('failed to register user:',error);
    }
};
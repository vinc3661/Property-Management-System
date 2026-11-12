import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithPhoneNumber,
  type RecaptchaVerifier,
  type ConfirmationResult,
  type User,
  signOut,
   sendEmailVerification,
  reload,
} from "firebase/auth";

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


export async function signInWithGoogle(): Promise<User> {
  try {
    const Provider = new GoogleAuthProvider();

    
    Provider.setCustomParameters({
      prompt: "select_account",
    });

    const credentials = await signInWithPopup(auth, Provider);

    console.log("Google user:", credentials.user);
    console.log("Google user Id:", credentials.user.uid);

    return credentials.user;
  } catch (error) {
    console.error("Google sign in failed:", error);
    throw error;
  }
}




export async function signWithNumber(phoneNumber:string, appVerifier:RecaptchaVerifier):Promise<ConfirmationResult>{
try{
const confirmation=await signInWithPhoneNumber(auth,phoneNumber, appVerifier);
console.log("sms confirmation sent successfully");
return confirmation;


}catch(error){
  console.error("failed to sign in with number:",error);
  throw error;
}


};


export async function verifyPhoneCode(
  confirmation:ConfirmationResult,
  code:string,
):Promise<User>{
try{
const credentials=await confirmation.confirm(code);

console.log("phone verification successful",credentials.user.uid);

return credentials.user;

}catch(error){
  console.error("phone verification failed:",error);
  throw error;

}



};

export async function signOutAccount():Promise<void>{
try{

  await signOut(auth);
  console.log("user signed out succcessfully");
}catch(error){
  console.error("failed to sign out:",error);
  throw error;
}



};


export async function sendVerificationEmail() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("No authenticated user found");
  }

  if (user.emailVerified) {
    return;
  }

  await sendEmailVerification(user);
}


export async function refreshEmailVerification() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("No authenticated user found");
  }

  await reload(user);

  const token = await user.getIdToken(true);

  return {
    emailVerified: user.emailVerified,
    token,
  };
}
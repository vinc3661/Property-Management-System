import {auth} from "./firebase";
import {supabase} from "./supabase";

export async function getAdminApplications(){
const user=auth.currentUser;
if(!user){
    throw new Error("you must have a siged user account");
}

const token=await user.getIdToken();
if(!token){
    throw new Error("no signed token");
    }
const formData = new FormData();
formData.append("firebaseIdToken", token);

const {data,error}=await supabase.functions.invoke(
    "admin-list-application",
{
    body:formData,
}
);

if(error){
    console.error("failed to get admin applications:",error);
throw error;
}
return data;

}
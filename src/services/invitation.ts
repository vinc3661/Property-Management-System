
import {auth} from "./firebase";
import {supabase} from "./supabase";

export async function inviteCaretaker(email:string){

const user=auth.currentUser;
if(!user){
    console.error("no signed in user");
    throw new Error("No signed-in user");
};

const token=await user.getIdToken();
if(!token){
    console.error("no signed token");
    throw new Error("no signed token");
};
const formData=new FormData();
formData.append("email", email);
const result=await supabase.admin<{
    email:string,

}>("create-caretaker-invitation", {
    body:formData,
});

if(result.error){
    console.error("supabase function failed");
    throw new Error("supabase function failed");
}
    
return result.data;


}
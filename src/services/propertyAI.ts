import {auth} from "./firebase";
import {supabase} from "./supabase";

export async function AskPropertyAi(question:string, ){

const user=auth.currentUser;
if(!user){
    throw new Error("You have to be a signed-in user");
}
const token=await user.getIdToken();
console.log("Current Firebase user:", auth.currentUser);
const {error,data}=await supabase.functions.invoke<{
    answer:string,
    }>("Property-ai",{
        
   headers:{
     "x-firebase-id-token": token,
   },
body:{
question
}
        
    });

    if(error){
        console.error("supabase function failed:",error);
        throw error();
    };
if(typeof data?.answer!=="string"||!data.answer.trim()){
    console.error("AI response failed:",error.message);
    throw new Error("Ai returned no anawer");
}
return data.answer;

}
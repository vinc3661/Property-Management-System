import {createClient} from "@supabase/supabase-js";
import {auth} from "./firebase";
import {supabase} from "./supabase";
const supabaseURL=import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if(!supabase||!supabasePublishableKey){
    throw new Error("missing supabase environment variables");
}

export function supabase=createClient(
    supabaseURL,
    supabasePublishableKey,
);

const user=auth.currentUser;
if(!user){
    throw new Error("you must sign in wit firebase first");
};

const Token=await user.getIdToken();
if(!Token){
    throw new Error("no signed token");
};

const {data,error}= await supabase.functions.invoke(
    "submit-landlord-application"
    {
        headers:{
            Authorization:`Bearer ${Token}`,


        },
        body:{}

        
    }
);
import {createClient} from "@supabase/supabase-js";
const supabaseURL=import.meta.env-VITE_SUPABASE_URL;
const supabasePublishableKey=import.meta.env-VITE_SUPABASE_PUBLISHABLE_KEY;

if(!supabase||!supabasePublishableKey){
    throw new Error("missing supabase environment variables");
}

export function supabase=createClient(
    supabaseURL,
    supabasePublishableKey,
);

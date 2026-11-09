
import { auth } from "./firebase";
import { supabase } from "./supabase";

export async function getAdminApplications() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("You must have a signed-in user account");
  }

  const token = await user.getIdToken();

  if (!token) {
    throw new Error("No signed token");
  }

  const formData = new FormData();
  formData.append("firebaseIdToken", token);

  const { data, error } = await supabase.functions.invoke(
    "admin-list-application",
    {
      body: formData,
    }
  );

  if (error) {
    console.error("Admin request failed:", error);

    if (error.context instanceof Response) {
      const responseBody = await error.context.clone().text();
      console.error("Server response:", responseBody);
      console.error("HTTP status:", error.context.status);
    }

    throw error;
  }

  return data;
}

export async function approveApplication(applicationId: string) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("You must be signed in");
  }

  const token = await user.getIdToken();

  if (!token) {
    throw new Error("No signed token");
  }

  const { data, error } = await supabase.functions.invoke(
    "admin-approve-application",
    {
      body: {
        firebaseIdToken: token,
        applicationId,
      },
    }
  );

  if (error) {
    console.error("Application approval failed:", error);
    throw error;
  }

  if (!data?.success) {
    throw new Error(data?.error ?? "Application approval failed");
  }

  return data;
}


export async function rejectApplication(applicationId:string){

    const user=auth.currentUser;
if(!user){
    console.error("no signed user:");
    throw  new  Error("no signed user");
};
    const token=await user.getIdToken();

    if(!token){
        console.error("invalid token");
        throw new Error("invalid token");
    };

const {error,data}=await supabase.functions.invoke(
    "admin-reject-application",
    {
body:{
    firebaseIdToken:token,
    applicationId,
}
}
);
if(error){
    console.error("failed to invoke function");
    throw error;
}

return data;

};







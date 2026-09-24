
import {useState} from 'react';

type registerData={
    email:string;
    password:string;
}


type RegisterUserFormProps={
    onRegister:(data:registerData)=>void;
}

export function RegisterUserForm({onRegister}:RegisterUserFormProps){
    const [email,setEmail]=useState("");
    const [password, setPassword]=useState("");

    const handleSubmit=(e:React.FormEvent)=>{
        e.preventDefault();
     onRegister({
        email,
        password,
     })
      
        setEmail("");
        setPassword("");
    };

 return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
   
   <div className="flex flex-col gap-2">
    <h2 className="text-lg font-semibold">
        Register User
    </h2>
   <input 
   type="text"
   value={email}
   onChange={(e)=>setEmail(e.target.value)}
   placeholder="Enter user email"
   className="rounded-lg border p-2"
   />
   
   <input 
   type="text"
   value={password}
   onChange={(e)=>setPassword(e.target.value)}
   placeholder="Enter user password"
   className="rounded-lg border p-2"
   />
   
<button
type="submit"
onSubmit={handleSubmit}
className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
>
    Register User

</button>

   </div>


    </form>
 );





};
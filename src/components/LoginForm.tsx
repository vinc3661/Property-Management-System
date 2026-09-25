
import {useState} from "react";

type User={
    email:string;
    password:string;
    role:string;
};

type LoginFormProps={
    onSighnUser:(data:User)=>void;
};

export  function LoginForm({onSighnUser}:LoginFormProps){
    const [email,setEmail ]=useState("");
    const [password,setPassword]=useState("");
    const [role,setRole]=useState("");

    const handleSubmit=(e:React.FormEvent)=>{
        e.preventDefault();
    
    onSighnUser({
        email,
        password,
        role,
    });
    setEmail("");
    setPassword("");
    setRole("");
    };
    return(
<div className="grid grid:cols-2 md:cols-3 gap-8">
    <h2 className="text-xl font-bold bg-grey-600">
        Login User
    </h2>
<input
type="text"
value={email}
onChange={(e)=>setEmail(e.target.value)}
placeholder="Enter Email"
className="rounded-2xl bg-white"
/>
<input
type="text"
value={password}
onChange={(e)=>setPassword(e.target.value)}
placeholder="Enter password"
className="rounded-2xl bg-white"
/>
<input
type="text"
value={role}
onChange={(e)=>setRole(e.target.value)}
className="rounded-2xl bg-white"
/>

<button
onSubmit={handleSubmit}
className="rounded-xl bg-blue-500 text-white text"
>
Login    
</button>





</div>

    );




};
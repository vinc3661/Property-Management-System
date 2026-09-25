
import {useState} from "react";
type LoginData={
    email:string,
    password:string,
}

type LoginFormProps={
    onSignUser:(data:LoginData)=>void;
};

export  function LoginForm({onSignUser}:LoginFormProps){
    const [email,setEmail ]=useState("");
    const [password,setPassword]=useState("");
    

    const handleSubmit=(e:React.FormEvent)=>{
        e.preventDefault();
    
    onSignUser({
        email,
        password,
        
    });
    setEmail("");
    setPassword("");
    
    };
    return(
        <form onSubmit={handleSubmit} className="flex flex-col-3">

        
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

<button type="submit"

className="rounded-xl bg-blue-500 text-white text"
>
Login    
</button>





</div>
</form>
    );




};
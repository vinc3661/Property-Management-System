import { useState } from "react";
import {AnimatePresence,  motion} from "framer-motion";


type LoginData={
    email:string,
    password:string,
};

type  RegisterData={
email:string,
password:string,
};




type AuthCardProps={
    onRegister:(data:RegisterData)=>void;
    onSignUser:(data:LoginData)=>void;
};

export function AuthCard({onRegister,
    onSignUser,
}:AuthCardProps){
    const [isLoging,setIsLoging]=useState<boolean>(false);
    const [loginEmail,setLoginEmail]=useState('');
    const [loginPassword,setLoginPassword]=useState('');
     const [registerEmail,setRegisterEmail]=useState('');
     const [registerPassword,setRegisterPassword]=useState('');
     const [confirmPassword,setConfimPassword]=useState('');
     const handleLogin=(e:React.FormEvent)=>{
        e.preventDefault();


     onSignUser({
        email:loginEmail,
        password:loginPassword,
     });

     setLoginEmail('');
     setLoginPassword('');


};

const handleRegister=(e:React.FormEvent)=>{

    e.preventDefault();
if (registerPassword!==confirmPassword){
    alert('password did not match');
    return;


};
onRegister({
email:registerEmail,
password:registerPassword,
});

setRegisterEmail('');
setRegisterPassword('');
setConfimPassword('');
};

return(
<div className="min-h-screen flex justify-center items-center bg-gray-600 py-6 ">
<div className="overflow-hidden flex w-full max-w-5xl rounded-2xl bg-white shadow-2xl">
    <div className="w-full md:w-1/2 md:p-12 p-8">
    <AnimatePresence mode="wait">
      {isLoging ?(
        <motion.div
        key="login"
        initial={{opacity:0 ,x:30}}
        animate={{opacity:1, x:0}}
        exit={{opacity:0 , x:-30}}
        transition={{duration:0.35,ease:"easeInOut"}}   
     >
 
     <h2 className="text-3xl font-bold mb-2">
        Login
     </h2>
<form onSubmit={handleLogin} className="flex flex-col gap-4">
 
 <input 
 type="email"
 value={loginEmail}
 onChange={(e)=>setLoginEmail(e.target.value)}
placeholder="Enter email"
className=" rounded-2xl border-p3"
/>
<input
type="password"
value={loginPassword}
onChange={(e)=>setLoginPassword(e.target.value)}
placeholder="Enter password"
className=" rounded-2xl border-p3"
/>

<button
type="submit"
className="rounded-2xl bg-blue-600 text-white"
>
    Login
</button>

<button 
type="button"
onClick={()=>setIsLoging(false)}
>
    Don't have an account? Register
</button>
</form>
</motion.div>
):(

<motion.div
key="register"
initial={{opacity:0, x:-30}}
animate={{opacity:1, x:0}}
exit={{opacity:0, x:0}}
transition={{duration:0.35,ease:"easeInOut"}}
>

<h2 className="text-2xl font-bold">

</h2>
<form onSubmit={handleRegister}
className="flex flex-col gap-4"
>
    
<input
type="email"
value={registerEmail}
onChange={(e)=>setRegisterEmail(e.target.value)}
placeholder="Enter email"
className="rounded-2xl border border-grey-300 p-3"
/>

<input
type="password"
value={registerPassword}
onChange={(e)=>setRegisterPassword(e.target.value)}
placeholder="Enter password"
className=" rounded-2xl border border-grey-300 p-3"
/>
<input
type="password"
onChange={(e)=>setConfimPassword(e.target.value)}
value={confirmPassword}
placeholder="confirm password"
className="border border-grey-300 p-3 rounded-2xl"
/>


<button
type="submit"
className="text-2xl rounded"
>
    Register
</button>

</form>
<button
type="button"
onClick={()=>setIsLoging(true)}
className=" mt-4 text-2xl rounded-2xl bg-blue-600 text-white"

>
    Already have an Account? Login
</button>



</motion.div>


)}








    
        
        
        
        

    </AnimatePresence>
    
    </div>
</div>



</div>


);

    





};
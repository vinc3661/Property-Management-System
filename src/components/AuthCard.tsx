import { useState } from "react";
import {AnimatePresence, motion} from "framer-motion";


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

onRegister({
email:registerEmail,
password:registerPassword,
});

setRegisterEmail('');
setRegisterPassword('');

};

return(
<div className="min-h-screen flex justify-center items-center bg-gray-600 py-6 ">
<div className="overflow-hiden flex w-full mx-w-5xl rounded-2xl bg-white shadow-2xl">
    <div className="w-full md:w-1/2 md:p-12 p-8">
    <AnimatePresence mode="wait">
      {isLoging ?(
        <motion.div
        initial={{opacity:0}}
        animate={{opacity:1, x:-30}}
        exit={{opacity:0 , x:0}}   
     >
 
        </motion.div>
        
        
        
        ):}

    </AnimatePresence>
    
    </div>
</div>



</div>


);

    





};
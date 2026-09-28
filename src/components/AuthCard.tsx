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
}

export function AuthCard({onRegister,
    onSignUser,
}:AuthCardProps){
    const [isLoading,setIsLoading]=useState<boolean>(false);
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



    





};
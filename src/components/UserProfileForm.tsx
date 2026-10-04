import {useState} from 'react';

type UserProfile={
    email:string,
    name:string,
};

type UserProfileFormProps={
    onRegisterUserProfile:(data:UserProfile)=>void;
}

export function UserProfileForm({onRegisterUserProfile}:UserProfileFormProps){
const [email,setEmail]=useState("");
const [name,setName]=useState("");

const handleSubmit=(e:React.FormEvent)=>{
    e.preventDefault();
    onRegisterUserProfile({
        email,
        name,
    })

  setEmail("");
  setName("");

};

return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

<input
type="text"
value={email}
onChange={(e)=>setEmail(e.target.value)}
placeholder="Enter Email"
className="rounded-2xl bg-white"
/>
<input
type="text"
value={name}
onChange={(e)=>setName(e.target.value)}
placeholder="Enter Name"
className="rounded-2xl bg-white"
/>
<button type="submit"
className="rounded-xl bg-blue-500 text-white text-lg font-bold py-2 px-4 hover:bg-blue-600 transition-colors duration-300"
>
    Register user profile
</button>

    </form>
);

};
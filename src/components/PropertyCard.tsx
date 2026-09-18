import { useState } from "react";
import type {Property} from "../types/Property";

type propertyCardProps={
property: Property;
onDelete:(id:string)=>void;
onUpdate:(id:string, updates:Partial<Omit<Property,'id'>>)=>Promise<void>
};

export function PropertyCard({property, onDelete, onUpdate}:propertyCardProps){
   const [isEditing,setIsEditing]=useState<boolean>(false);
   const [houseNumber,setHouseNumber]=useState<string>('');
   const [status,setStatus]=useState<"occupied"|"vacant">("vacant");
   const [rentAmount,setRentAmount]=useState<number>(0);
   
const handleSave=async ()=>{
    try{
        await onUpdate(property.id,{
            houseNumber,
            status,
            rentAmount
        });
    }
    catch(error){
        console.error('failed to update Property:',error);
    }
};

   if(isEditing){
    return(
    <div className="rounded-2xl bg-white p-5 shadow">
    <h3 className="mb-4 text-xl font-bold text-gray-700">
        Edit Property
    </h3>
    <input
    type="text"
    value={houseNumber}
    onChange={(e)=>setHouseNumber(e.target.value)}
    placeholder="Enter house number"
    className="mb-3 w-full rounded-lg border p-2"
    />
    <input 
    type="number"
    value={rentAmount}
    onChange={(e)=>setRentAmount(Number(e.target.value))}
    placeholder="Enter rent Amount"
    className="mb-3 w-full rounded-lg border p-2"
    />
    <input 
    type="text"
    value={status}
    onChange={(e)=>setStatus(e.target.value as "occupied" | "vacant")}
    placeholder="Enter status"
    className="mb-3 w-full rounded-lg border p-2"
    />
    <div>
    <button
        onClick={handleSave}
        className="mr-2 rounded-lg bg-green-500 px-4 py-2 text-white hover:bg-green-600"
    >
        Save changes
    </button>
    <button
        onClick={()=>setIsEditing(false)}
        className="rounded-lg bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
    >
        Cancel
    </button>
    </div>
    </div>
    )
   }
return(
    <div className="rounded-2xl bg-white p-5 shadow">
        <h3 className="mb-4 text-xl font-bold text-gray-700">
            Property Details
        </h3>
       <p className="mb-2 text-gray-600">
        houseNumber:{property.houseNumber}</p>   
       <p className="mb-3 text-gray-600">
        rentAmount:{property.rentAmount}</p>
           <p className="mb-4 text-gray-600">status:{property.status}</p>

      <button 
      onClick={()=>setIsEditing(true)}
      className="mr-2 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        Edit Property
        </button>
           <button
           onClick={()=>onDelete(property.id)}
           className="ml-2 rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
           >
            Delete Property
           </button>
            
    </div>


)
}


import { useState} from "react";

export type TenantBulkRow = {
  name: string;
  houseNumber: string;
  leaseStart: string;
};

type tenantBulkProps={
    onAddTenantBulk:(data:TenantBulkRow)=>void;
};


export function TenantBulkForm({onAddTenantBulk}:tenantBulkProps){
 const [name,setName]=useState<string>("");
 const [houseNumber,setHouseNumber]=useState<string>("");
 const [leaseStart,setLeaseStart]=useState<string>("");
 
 const handleSubmit=(e:React.FormEvent)=>{
    e.preventDefault();
 
onAddTenantBulk({
    name,
    houseNumber,
    leaseStart
});

setName("");
setHouseNumber("");
setLeaseStart("");
};

return(
<form onSubmit={handleSubmit}>
<div className="min-h-screen bg-600-grey">
    <div className="max-w-8 p:8 ">
        <input
        type="text"
        placeholder="enter tenant "
        value={name}
        onChange={(e)=>setName(e.target.value)}
        className="rounded-2xl "
        />
        <input
        type="text"
        placeholder="enter houseNumber"
        value={houseNumber}
        onChange={(e)=>setHouseNumber(e.target.value)}
        className="rounde-2xl"
        />
        <input
        type="text"
        placeholder="enter leaseStart"
        value={leaseStart}
        onChange={(e)=>setLeaseStart(e.target.value)}
        className="rounde-2xl"
        />
    </div>
</div>

</form>



)


}
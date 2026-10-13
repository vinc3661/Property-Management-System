import {useState} from 'react';
import { LandlordRegisterForm } from './LandlordRegistrationForm';
import OwnershipDocumentStep from './OwnershipDocumentStep';

export function LandlordApplicationFlow() {
const  [step,setStep]=useState(1);
const [propertyName,setPropertyName]=useState('');
const [propertyAddress,setPropertyAddress]=useState('');
const [ownershipDocument, setOwnershipDocument] = useState<File | null>(null);
return(
<>
{step===1&&(
    <LandlordRegisterForm
    onRegisterLandlord={(name,adress)=>{
        setPropertyName(name);
        setPropertyAddress(adress);
        setStep(2);
    }}
    />
)}

{step===2 &&(
    <OwnershipDocumentStep
    onContinue={(file)=>{
  setOwnershipDocument(file);
  setStep(3);
  }
  

    }

    
    
    
    />
)}
{step === 3 && (
  <div>
    <h2>Application ready for submission</h2>
    <p>Property: {propertyName}</p>
    <p>Address: {propertyAddress}</p>
    <p>Document: {ownershipDocument?.name}</p>
  </div>
)}
</>
);

}


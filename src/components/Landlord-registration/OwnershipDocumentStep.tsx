import { useState } from 'react';

type OwnershipDocumentStepProps = {
  onContinue: (file: File) => void;
};
const OwnershipDocumentStep = ({onContinue}:OwnershipDocumentStepProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [isValid, setIsValid]=useState<boolean>(false);
  const handleContinue = () => {
    setIsValid(false);
    if (!selectedFile) {
      setError('Please select an ownership document');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File must be 5MB or smaller');
      return;
    }
    

const allowedTypes = [
  'application/pdf',
  'image/jpeg',
  'image/png',
];

if (!allowedTypes.includes(selectedFile.type)) {
  setError('Only PDF, JPEG, and PNG files are allowed.');
  return;
}
    


    setError('');
    setIsValid(true);
    onContinue(selectedFile);
  };

  return (
    <div className="min-h-screen p-6 shadow-2xl">
      <h1 className="text-2xl font-bold">Upload Ownership Document</h1>
      <input
        type="file"
        accept="application/pdf, image/jpeg, image/png"
       
onChange={(e) => {
  const file = e.target.files?.[0] ?? null;

  setSelectedFile(file);
setIsValid(false);
  if (file) {
    setError('');
  }
}}

      />
      {selectedFile && <p>{selectedFile.name}</p>}
      {error && <p>{error}</p>}

      <button type="button" onClick={handleContinue}>
        Continue
      </button>
    {isValid&&(
        <p>document passed validation</p>
    )}
    </div>
  );
};

export default OwnershipDocumentStep;

import { useState, type FormEvent } from "react";

type LandlordApplicationProps = {
  onRegisterLandlord: (
    propertyName: string,
    propertyAddress: string
  ) => void;
};

export function LandlordRegisterForm({
  onRegisterLandlord,
}: LandlordApplicationProps) {
  const [propertyName, setPropertyName] = useState("");
  const [propertyAddress, setPropertyAddress] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    onRegisterLandlord(propertyName, propertyAddress);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 p-6 md:p-12">
        <div className="w-full max-w-5xl overflow-hidden flex flex-col items-center justify-center gap-6 p-6 shadow-2xl">
          <h1 className="text-2xl font-bold">
            Register as a Landlord
          </h1>

          <div className="flex w-full flex-col gap-2">
            <label htmlFor="propertyName">
              Property Name (optional)
            </label>

            <input
              id="propertyName"
              type="text"
              value={propertyName}
              onChange={(e) => setPropertyName(e.target.value)}
              placeholder="Enter property name"
              className="rounded-2xl border p-3"
            />
          </div>

          <div className="flex w-full flex-col gap-2">
            <label htmlFor="propertyAddress">
              Property Address
            </label>

            <input
              id="propertyAddress"
              type="text"
              value={propertyAddress}
              onChange={(e) => setPropertyAddress(e.target.value)}
              placeholder="Enter property address"
              className="rounded-2xl border p-3"
              required
            />
          </div>

          <button
            type="submit"
            className="rounded-2xl bg-blue-600 px-6 py-3 text-white"
          >
            Continue
          </button>
        </div>
      </div>
    </form>
  );
}

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
    onRegisterLandlord(propertyName.trim(), propertyAddress.trim());
  };
  return (
  <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-xl border border-slate-200 bg-white">
    <div className="grid grid-cols-1 md:grid-cols-2">
      <div className="border-b border-blue-100 bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100 p-6 text-slate-900 md:border-b-0 md:border-r sm:p-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-semibold text-white shadow-sm">
  P
</div>
        <p className="mt-8 text-sm text-slate-400">
          Property Management System
        </p>
<h1 className="mt-3 text-2xl font-semibold leading-snug tracking-tight text-slate-900">
  Register your property
</h1>

        <p className="mt-3 max-w-sm text-sm leading-6 text-slate-300 text-black">
          Enter your property details to begin the landlord registration process.
        </p>
      </div>

      <div className="p-6 sm:p-8">
        <div className="mb-6">
          <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
            Step 1 of 3
          </p>

          <h2 className="mt-2 text-xl font-semibold text-slate-900">
            Property details
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Provide the name and location of your property.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="propertyName"
              className="text-sm font-medium text-slate-700"
            >
              Property name
              <span className="ml-2 text-slate-400">(Optional)</span>
            </label>

            <input
              id="propertyName"
              name="propertyName"
              type="text"
              value={propertyName}
              onChange={(e) => setPropertyName(e.target.value)}
              placeholder="e.g. Greenview Apartments"
              autoComplete="organization"
              className="w-full rounded-lg border border-slate-300 px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="propertyAddress"
              className="text-sm font-medium text-slate-700"
            >
              Property address
            </label>

            <input
              id="propertyAddress"
              name="propertyAddress"
              type="text"
              value={propertyAddress}
              onChange={(e) => setPropertyAddress(e.target.value)}
              placeholder="Town, estate or street"
              autoComplete="street-address"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Continue
            <span className="ml-2" aria-hidden="true">→</span>
          </button>
        </form>
      </div>
    </div>
  </div>
);
};
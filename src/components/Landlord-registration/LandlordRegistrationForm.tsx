
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
    <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-200">
      <div className="grid min-h-[520px] grid-cols-1 md:grid-cols-2">
        
        <div className="relative flex flex-col justify-between overflow-hidden bg-slate-900 p-8 text-white sm:p-10">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500 text-xl font-bold shadow-lg shadow-blue-950/30">
              P
            </div>

            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">
              Property Management
            </p>

            <h1 className="mt-4 max-w-md text-3xl font-bold leading-tight sm:text-4xl">
              Your properties.
              <br />
              One smarter way
              <br />
              to manage them.
            </h1>

            <p className="mt-5 max-w-sm leading-7 text-slate-300">
              Bring your properties, tenants, and rental records
              together in one organized workspace.
            </p>
          </div>

          <div className="relative mt-12 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300">
                ✓
              </div>
              <div>
                <p className="font-semibold">A simpler way to manage</p>
                <p className="mt-1 text-sm text-slate-400">
                  Properties, occupancy, and tenants in one place.
                </p>
              </div>
            </div>
          </div>
        </div>

      
        <div className="flex items-center justify-center p-6 sm:p-10">
          <form onSubmit={handleSubmit} className="w-full max-w-md">
            <div className="mb-8">
              <p className="text-sm font-semibold text-blue-600">
                LANDLORD APPLICATION · STEP 1 OF 3
              </p>

              <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Tell us about your property
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Start with the basic details. You'll upload your
                ownership document in the next step.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="propertyName"
                className="text-sm font-semibold text-slate-700"
              >
                Property name
                <span className="ml-2 font-normal text-slate-400">
                  Optional
                </span>
              </label>

              <input
                id="propertyName"
                name="propertyName"
                type="text"
                value={propertyName}
                onChange={(e) => setPropertyName(e.target.value)}
                placeholder="e.g. Greenview Apartments"
                autoComplete="organization"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <div className="mt-5 flex flex-col gap-2">
              <label
                htmlFor="propertyAddress"
                className="text-sm font-semibold text-slate-700"
              >
                Property address
              </label>

              <input
                id="propertyAddress"
                name="propertyAddress"
                type="text"
                value={propertyAddress}
                onChange={(e) => setPropertyAddress(e.target.value)}
                placeholder="Enter the property's location"
                autoComplete="street-address"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />

              <p className="text-xs leading-5 text-slate-500">
                Enter the town, estate, street, or full address.
              </p>
            </div>

            <button
              type="submit"
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 active:scale-[0.99]"
            >
              Continue to document upload
              <span aria-hidden="true">→</span>
            </button>

            <p className="mt-5 text-center text-xs leading-5 text-slate-400">
              Your application will be reviewed before landlord
              access is granted.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

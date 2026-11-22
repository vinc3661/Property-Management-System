
import { useState } from "react";
import type { FormEvent } from "react";
import {
  House,
  UserRound,
  Mail,
  Phone,
  ArrowRight,
} from "lucide-react";
import type { UserProfile } from "../types/UserProfile";

type UserProfileFormData = Pick<
  UserProfile,
  "email" | "name" | "phoneNumber"
>;

type UserProfileFormProps = {
  onRegisterUserProfile: (data: UserProfileFormData) => void;
  initialName?: string;
  initialEmail?: string;
  initialPhoneNumber?: string;
};

export function UserProfileForm({
  onRegisterUserProfile,
  initialEmail,
  initialName,
  initialPhoneNumber,
}: UserProfileFormProps) {
  const [email, setEmail] = useState(initialEmail ?? "");
  const [name, setName] = useState(initialName ?? "");
  const [phoneNumber, setPhoneNumber] = useState(
    initialPhoneNumber ?? ""
  );

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    onRegisterUserProfile({
      email: email.trim(),
      name: name.trim(),
      phoneNumber: phoneNumber.trim(),
    });
  };

  const inputWrapper =
    "flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/70 px-3 transition focus-within:border-white";

  const inputClass =
    "min-w-0 w-full bg-transparent py-3.5 text-sm text-white outline-none placeholder:text-zinc-500";

  const iconClass = "shrink-0 text-zinc-500";

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4 py-8 sm:px-6">

      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl">

        
        <div className="border-b border-zinc-800 px-6 py-7 sm:px-8">

          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-black">
              <House size={23} strokeWidth={1.8} />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">
                PMS
              </h1>

              <p className="text-xs text-zinc-500">
                Property Management System
              </p>
            </div>
          </div>

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 text-white">
            <UserRound size={27} strokeWidth={1.7} />
          </div>

          <h2 className="mt-5 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Complete your profile
          </h2>

          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Let's get your account ready. Add a few details
            before accessing your dashboard.
          </p>
        </div>

        
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 px-6 py-7 sm:px-8"
        >

          {/* Full name */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="profile-name"
              className="text-sm font-medium text-zinc-300"
            >
              Full name
            </label>

            <div className={inputWrapper}>
              <UserRound size={18} className={iconClass} />

              <input
                id="profile-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className={inputClass}
                required
              />
            </div>
          </div>

          
          <div className="flex flex-col gap-2">
            <label
              htmlFor="profile-email"
              className="text-sm font-medium text-zinc-300"
            >
              Email address
            </label>

            <div className={inputWrapper}>
              <Mail size={18} className={iconClass} />

              <input
                id="profile-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className={inputClass}
                required
              />
            </div>

            <p className="text-xs text-zinc-500">
              Use the email associated with your account.
            </p>
          </div>

          
          <div className="flex flex-col gap-2">
            <label
              htmlFor="profile-phone"
              className="text-sm font-medium text-zinc-300"
            >
              Phone number
            </label>

            <div className={inputWrapper}>
              <Phone size={18} className={iconClass} />

              <input
                id="profile-phone"
                type="tel"
                autoComplete="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g. +254 7XX XXX XXX"
                className={inputClass}
                required
              />
            </div>
          </div>

          
          <button
            type="submit"
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3.5 text-sm font-semibold text-black transition hover:bg-zinc-200 active:scale-[0.99]"
          >
            Save profile
            <ArrowRight size={18} />
          </button>

          <p className="text-center text-xs leading-5 text-zinc-500">
            Your information helps personalize your PMS dashboard.
          </p>

        </form>
      </div>
    </div>
  );
}

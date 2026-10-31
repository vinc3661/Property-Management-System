
import { useState } from "react";
import type { FormEvent } from "react";
import { House, UserRound, Mail, ArrowRight } from "lucide-react";
import type { UserProfile } from "../types/UserProfile";

type UserProfileFormData = Pick<UserProfile, "email" | "name">;

type UserProfileFormProps = {
  onRegisterUserProfile: (data: UserProfileFormData) => void;
  initialName?:string;
  initialEmail?:string;
};

export function UserProfileForm({
  onRegisterUserProfile,
  initialEmail,
  initialName,
}: UserProfileFormProps) {
  const [email, setEmail] = useState(initialEmail ?? "");
  const [name, setName] = useState(initialName ?? "");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    onRegisterUserProfile({
      email: email.trim(),
      name: name.trim(),
    });

    setEmail("");
    setName("");
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 flex items-center justify-center">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">

        
        <div className="border-b border-slate-100 px-6 py-6 sm:px-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
              <House size={24} strokeWidth={1.8} />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                PMS
              </h1>
              <p className="text-xs text-slate-500">
                Property Management System
              </p>
            </div>
          </div>

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <UserRound size={28} strokeWidth={1.7} />
          </div>

          <h2 className="mt-5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Let's set up your profile
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Add your profile details
          </p>
        </div>

        
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 px-6 py-6 sm:px-8"
        >
          <div className="flex flex-col gap-2">
            <label
              htmlFor="profile-name"
              className="text-sm font-semibold text-slate-700"
            >
              Full name
            </label>

            <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10">
              <UserRound size={18} className="shrink-0 text-slate-400" />

              <input
                id="profile-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="min-w-0 w-full bg-transparent py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="profile-email"
              className="text-sm font-semibold text-slate-700"
            >
              Email address
            </label>

            <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10">
              <Mail size={18} className="shrink-0 text-slate-400" />

              <input
                id="profile-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="min-w-0 w-full bg-transparent py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                required
              />
            </div>

            <p className="text-xs leading-5 text-slate-500">
              Use the email associated with your account.
            </p>
          </div>

          <button
            type="submit"
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/25 active:scale-[0.99]"
          >
            Save profile
            <ArrowRight size={18} />
          </button>

          <p className="text-center text-xs text-slate-400">
            Your details help personalize your dashboard.
          </p>
        </form>
      </div>
    </div>
  );
}


import { useState } from "react";
import type { FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { House, ArrowRight } from "lucide-react";

type LoginData = {
  email: string;
  password: string;
};

type RegisterData = {
  email: string;
  password: string;
};

type AuthCardProps = {
  onRegister: (data: RegisterData) => void;
  onSignUser: (data: LoginData) => void;
  onGoogleSignIn: () => void;
};

export function AuthCard({
  onRegister,
  onSignUser,
  onGoogleSignIn,
}: AuthCardProps) {
  const [isLoging, setIsLoging] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [passwordError, setPasswordError] = useState("");

  const handleLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    onSignUser({
      email: loginEmail,
      password: loginPassword,
    });

    setLoginEmail("");
    setLoginPassword("");
  };

  const handleRegister = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordError("");

    if (registerPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    onRegister({
      email: registerEmail,
      password: registerPassword,
    });

    setRegisterEmail("");
    setRegisterPassword("");
    setConfirmPassword("");
  };

  const inputClass =
    "w-full rounded-xl border border-white/50 bg-white/60 px-4 py-3.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none backdrop-blur-sm transition-all duration-200 hover:bg-white/80 focus:border-emerald-700/50 focus:bg-white/90 focus:ring-4 focus:ring-emerald-800/10";

  const primaryButtonClass =
    "group flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 font-semibold text-white shadow-lg shadow-slate-900/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-900 hover:shadow-xl hover:shadow-emerald-950/20 active:translate-y-0";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 via-stone-100 to-emerald-50 p-3 sm:p-6">

      {/* Ambient background decoration */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-emerald-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-slate-300/40 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-[2rem] border border-white/70 bg-white/50 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl md:grid-cols-2"
      >

        {/* FORM PANEL */}
        <div className="order-2 flex min-w-0 items-center p-6 sm:p-9 md:order-1 md:p-10 lg:p-12">
          <div className="w-full">

            <div className="mb-8">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-900/15">
                <House size={22} strokeWidth={1.8} />
              </div>

              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800">
                Property Management
              </p>

              <AnimatePresence mode="wait">
                {isLoging ? (
                  <motion.div
                    key="login-heading"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                      Welcome back
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                      Sign in to manage your properties.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="register-heading"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                      Create account
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                      Get started with your property workspace.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence mode="wait">
              {isLoging ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <form onSubmit={handleLogin} className="flex flex-col gap-5">

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-slate-700">
                        Email address
                      </label>
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="Enter your email"
                        className={inputClass}
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-slate-700">
                        Password
                      </label>
                      <input
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Enter your password"
                        className={inputClass}
                        required
                      />
                    </div>

                    <button type="submit" className={primaryButtonClass}>
                      Login
                      <ArrowRight
                        size={17}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </button>

                    <p className="text-center text-sm text-slate-500">
                      Don't have an account?{" "}
                      <button
                        type="button"
                        onClick={() => setIsLoging(false)}
                        className="font-semibold text-emerald-800 transition-colors hover:text-emerald-950"
                      >
                        Register
                      </button>
                    </p>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <form onSubmit={handleRegister} className="flex flex-col gap-4">

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-slate-700">
                        Email address
                      </label>
                      <input
                        type="email"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        placeholder="Enter your email"
                        className={inputClass}
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-slate-700">
                        Password
                      </label>
                      <input
                        type="password"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        placeholder="Create a password"
                        className={inputClass}
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-slate-700">
                        Confirm password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        className={inputClass}
                        required
                      />
                    </div>

                    {passwordError && (
                      <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                        {passwordError}
                      </p>
                    )}

                    <button type="submit" className={primaryButtonClass}>
                      Register
                      <ArrowRight
                        size={17}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </button>

                    <p className="text-center text-sm text-slate-500">
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setPasswordError("");
                          setIsLoging(true);
                        }}
                        className="font-semibold text-emerald-800 transition-colors hover:text-emerald-950"
                      >
                        Login
                      </button>
                    </p>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs font-medium text-slate-400">
                OR CONTINUE WITH
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <button
              type="button"
              onClick={onGoogleSignIn}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/80 bg-white/55 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-md active:translate-y-0"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                className="h-5 w-5"
              >
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.76 7.18l7.73 6C44.42 37.96 46.98 31.9 46.98 24.55z"/>
                <path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.53 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.89 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.97 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Continue with Google
            </button>

          </div>
        </div>

        {/* IMAGE PANEL */}
        <div className="relative order-1 flex min-h-[190px] flex-col justify-between overflow-hidden p-6 text-white sm:min-h-[230px] sm:p-8 md:order-2 md:min-h-[600px] md:p-10">

          <img
            src="/images/apartment-building.png"
            alt="Modern apartment building"
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/75 via-slate-950/45 to-emerald-950/60" />

          <div className="absolute inset-0 bg-white/[0.03] backdrop-blur-[1px]" />

          <div className="relative z-10 flex h-full flex-col justify-between">

            <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-3 shadow-lg backdrop-blur-xl sm:w-fit">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/15">
                <House size={24} strokeWidth={1.8} />
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em]">
                  PMS
                </p>
                <p className="text-xs text-white/70">
                  Property Management System
                </p>
              </div>
            </div>

            <div className="max-w-md py-6">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-200">
                Manage with confidence
              </p>

              <h2 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                Better property management starts here.
              </h2>

              <p className="mt-5 max-w-sm text-sm leading-7 text-white/80 sm:text-base">
                Keep property records organized, track your tenants,
                and manage your rentals from one place.
              </p>

              <div className="mt-7 h-1 w-16 rounded-full bg-emerald-300" />
            </div>

            <p className="hidden text-xs tracking-wide text-white/60 md:block">
              Simplifying the way you manage properties.
            </p>

          </div>
        </div>

      </motion.div>
    </div>
  );
}

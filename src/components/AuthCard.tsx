
import { useState } from "react";
import type { FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  House,
  Mail,
  Eye,
  EyeOff,
  LockKeyhole,
} from "lucide-react";

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
  const [isLoging, setIsLoging] = useState<boolean>(true);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordError, setPasswordError] = useState("");

  const handleLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    onSignUser({
      email: loginEmail,
      password: loginPassword,
    });
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

  const inputWrapper =
    "flex items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-900 px-4 transition focus-within:border-white focus-within:ring-1 focus-within:ring-white";

  const inputClass =
    "w-full bg-transparent py-3 text-white outline-none placeholder:text-zinc-500";

  const labelClass = "font-medium text-sm text-zinc-200";

  const primaryButton =
    "w-full rounded-xl bg-white py-3 font-semibold text-black transition hover:bg-zinc-200 active:scale-[0.99]";

  const toggleButton =
    "text-zinc-400 transition hover:text-white";

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-3 text-white sm:p-6">
      <div className="grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl md:grid-cols-2">

        
        <div className="order-2 flex min-w-0 items-center p-5 sm:p-8 md:order-1 md:p-10">
          <div className="w-full">

            <AnimatePresence mode="wait">
              {isLoging ? (
                <motion.div
                  key="login"
                  className="w-full"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{
                    duration: 0.35,
                    ease: "easeInOut",
                  }}
                >
                  <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                    Welcome back
                  </h2>

                  <p className="mb-8 mt-2 text-sm text-zinc-400">
                    Please enter your details to sign in.
                  </p>

                  <form
                    onSubmit={handleLogin}
                    className="flex flex-col gap-5"
                  >
                    
                    <div className="flex flex-col gap-2">
                      <label className={labelClass}>
                        Email address
                      </label>

                      <div className={inputWrapper}>
                        <Mail size={19} className="shrink-0 text-zinc-400" />

                        <input
                          type="email"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="Enter your email"
                          className={inputClass}
                          autoComplete="email"
                          required
                        />
                      </div>
                    </div>

                  
                    <div className="flex flex-col gap-2">
                      <label className={labelClass}>
                        Password
                      </label>

                      <div className={inputWrapper}>
                        <LockKeyhole
                          size={19}
                          className="shrink-0 text-zinc-400"
                        />

                        <input
                          type={showLoginPassword ? "text" : "password"}
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="Enter your password"
                          className={inputClass}
                          autoComplete="current-password"
                          required
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowLoginPassword(!showLoginPassword)
                          }
                          className={toggleButton}
                          aria-label={
                            showLoginPassword
                              ? "Hide password"
                              : "Show password"
                          }
                        >
                          {showLoginPassword ? (
                            <EyeOff size={19} />
                          ) : (
                            <Eye size={19} />
                          )}
                        </button>
                      </div>
                    </div>

                    <button type="submit" className={primaryButton}>
                      Sign in
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsLoging(false)}
                      className="text-sm text-zinc-400 transition hover:text-white"
                    >
                      Don't have an account?{" "}
                      <span className="font-semibold text-white">
                        Register
                      </span>
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="register"
                  className="w-full"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{
                    duration: 0.35,
                    ease: "easeInOut",
                  }}
                >
                  <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                    Create your account
                  </h2>

                  <p className="mb-8 mt-2 text-sm text-zinc-400">
                    Set up your account and take the first step towards
                    effortless property management.
                  </p>

                  <form
                    onSubmit={handleRegister}
                    className="flex flex-col gap-5"
                  >
                    
                    <div className="flex flex-col gap-2">
                      <label className={labelClass}>
                        Email address
                      </label>

                      <div className={inputWrapper}>
                        <Mail size={19} className="shrink-0 text-zinc-400" />

                        <input
                          type="email"
                          value={registerEmail}
                          onChange={(e) => setRegisterEmail(e.target.value)}
                          placeholder="Enter your email"
                          className={inputClass}
                          autoComplete="email"
                          required
                        />
                      </div>
                    </div>

                    
                    <div className="flex flex-col gap-2">
                      <label className={labelClass}>
                        Password
                      </label>

                      <div className={inputWrapper}>
                        <LockKeyhole
                          size={19}
                          className="shrink-0 text-zinc-400"
                        />

                        <input
                          type={showRegisterPassword ? "text" : "password"}
                          value={registerPassword}
                          onChange={(e) => setRegisterPassword(e.target.value)}
                          placeholder="Create a password"
                          className={inputClass}
                          autoComplete="new-password"
                          required
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowRegisterPassword(!showRegisterPassword)
                          }
                          className={toggleButton}
                          aria-label={
                            showRegisterPassword
                              ? "Hide password"
                              : "Show password"
                          }
                        >
                          {showRegisterPassword ? (
                            <EyeOff size={19} />
                          ) : (
                            <Eye size={19} />
                          )}
                        </button>
                      </div>
                    </div>

                    
                    <div className="flex flex-col gap-2">
                      <label className={labelClass}>
                        Confirm password
                      </label>

                      <div className={inputWrapper}>
                        <LockKeyhole
                          size={19}
                          className="shrink-0 text-zinc-400"
                        />

                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm your password"
                          className={inputClass}
                          autoComplete="new-password"
                          required
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className={toggleButton}
                          aria-label={
                            showConfirmPassword
                              ? "Hide password"
                              : "Show password"
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={19} />
                          ) : (
                            <Eye size={19} />
                          )}
                        </button>
                      </div>
                    </div>

                    {passwordError && (
                      <p className="text-sm text-red-400">
                        {passwordError}
                      </p>
                    )}

                    <button type="submit" className={primaryButton}>
                      Create account
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPasswordError("");
                        setIsLoging(true);
                      }}
                      className="text-sm text-zinc-400 transition hover:text-white"
                    >
                      Already have an account?{" "}
                      <span className="font-semibold text-white">
                        Sign in
                      </span>
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Google sign-in */}
            <div className="mt-7">
              <div className="relative mb-5 flex items-center">
                <div className="flex-grow border-t border-zinc-800" />

                <span className="px-3 text-sm text-zinc-500">
                  Or continue with
                </span>

                <div className="flex-grow border-t border-zinc-800" />
              </div>

              <button
                type="button"
                onClick={onGoogleSignIn}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-700 bg-zinc-900 py-3 font-semibold text-white transition hover:bg-zinc-800"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  className="h-5 w-5"
                >
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.76 7.18l7.73 6C44.42 37.96 46.98 31.9 46.98 24.55z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.53 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.89 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.97 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                </svg>

                Continue with Google
              </button>
            </div>
          </div>
        </div>

        
        <div className="relative order-1 flex min-h-[190px] flex-col justify-between overflow-hidden p-6 text-white sm:min-h-[230px] sm:p-8 md:order-2 md:min-h-[560px] md:p-8 lg:p-12">
          <img
            src="/images/apartment-building.png"
            alt="Modern apartment building"
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-black/75" />

          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/30 bg-white/10">
                <House size={25} strokeWidth={1.8} />
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em]">
                  PMS
                </p>

                <p className="mt-1 text-xs text-white/70 sm:text-sm">
                  Property Management System
                </p>
              </div>
            </div>

            <div className="relative z-10 max-w-md py-5">
              <h2 className="text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl">
                Better property management starts here.
              </h2>

              <p className="mt-3 hidden text-sm leading-6 text-white/80 sm:block sm:text-base sm:leading-7">
                Keep property records organized, track your tenants, and manage
                your rentals from one place.
              </p>
            </div>

            <p className="relative z-10 hidden text-sm text-white/60 md:block">
              Simplifying the way you manage properties.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

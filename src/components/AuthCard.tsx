import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {House} from "lucide-react";
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
  onGoogleSignIn:()=> void;
  onNumberSignIn:()=>void;
};

export function AuthCard({
  onRegister,
  onSignUser,
  onGoogleSignIn,
  onNumberSignIn,
}: AuthCardProps) {
  const [isLoging, setIsLoging] = useState<boolean>(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfimPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    onSignUser({
      email: loginEmail,
      password: loginPassword,
    });

    setLoginEmail("");
    setLoginPassword("");
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    if (registerPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    onRegister({
      email: registerEmail,
      password: registerPassword,
    });

    setRegisterEmail("");
    setRegisterPassword("");
    setConfimPassword("");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">

      <div className="grid w-full max-w-5xl grid-cols-1 md:grid-cols-2 bg-white rounded-2xl shadow-lg overflow-hidden">

        

        <div className="order-2 flex min-w-0 items-center p-5 sm:p-8 md:order-1 md:p-8 lg:p-1">
<button
  type="button"
  onClick={onGoogleSignIn}
  className="mb-6 flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
>
  <span className="flex items-center justify-center">
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
  </span>
  Continue with Google
</button>

<button
onClick={onNumberSignIn}
className="text-2xl, bg-blue-600 text-white rounded-2xl "
>
  Sign in with phone number
</button>
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

                <h2 className="text-4xl font-bold text-gray-800">
                  Welcome back
                </h2>

                <p className="mt-2 mb-8 text-gray-500">
                  Login to continue.
                </p>

                <form
                  onSubmit={handleLogin}
                  className="flex flex-col gap-5"
                >

                  <div className="flex flex-col gap-2">
                    <label className="font-medium text-gray-700">
                      Email
                    </label>

                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) =>
                        setLoginEmail(e.target.value)
                      }
                      placeholder="Enter your email"
                      className="rounded-xl border border-gray-300 p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-medium text-gray-700">
                      Password
                    </label>

                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) =>
                        setLoginPassword(e.target.value)
                      }
                      placeholder="Enter your password"
                      className="rounded-xl border border-gray-300 p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
                  >
                    Login
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsLoging(false)}
                    className="text-sm text-gray-500 hover:text-blue-600"
                  >
                    Don't have an account?{" "}
                    <span className="font-semibold">
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

                <h2 className="text-4xl font-bold text-gray-800">
                  Create your account
                </h2>

                <p className="mt-2 mb-8 text-gray-500">
                  Create your account to get started.
                </p>

                <form
                  onSubmit={handleRegister}
                  className="flex flex-col gap-5"
                >

                  <div className="flex flex-col gap-2">
                    <label className="font-medium text-gray-700">
                      Email
                    </label>

                    <input
                      type="email"
                      value={registerEmail}
                      onChange={(e) =>
                        setRegisterEmail(e.target.value)
                      }
                      placeholder="Enter your email"
                      className="rounded-xl border border-gray-300 p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-medium text-gray-700">
                      Password
                    </label>

                    <input
                      type="password"
                      value={registerPassword}
                      onChange={(e) =>
                        setRegisterPassword(e.target.value)
                      }
                      placeholder="Enter your password"
                      className="rounded-xl border border-gray-300 p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-medium text-gray-700">
                      Confirm password
                    </label>

                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfimPassword(e.target.value)
                      }
                      placeholder="Confirm your password"
                      className="rounded-xl border border-gray-300 p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
                  >
                    Register
                  </button>

                </form>

                <button
                  type="button"
                  onClick={() => setIsLoging(true)}
                  className="mt-5 w-full text-sm text-gray-500 hover:text-blue-600"
                >
                  Already have an account?{" "}
                  <span className="font-semibold">
                    Login
                  </span>
                </button>

              </motion.div>

            )}

          </AnimatePresence>

        </div>

        
    
    <div className="relative order-1 flex min-h-[190px] flex-col justify-between overflow-hidden p-6 text-white sm:min-h-[230px] sm:p-8 md:order-2 md:min-h-[560px] md:p-8 lg:p-12">

      <img
        src="/images/apartment-building.png"
        alt="Modern apartment building"
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute inset-0 bg-slate-950/60" />

      <div className="relative z-10">
          <div className="flex items-center gap-3">
    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/30">
      <House size={25} strokeWidth={1.8} />
    </div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em]">
          PMS
        </p>
        <p className="mt-1 text-xs text-white/80 sm:text-sm">
          Property Management System
        </p>
      </div>

      <div className="relative z-10 max-w-md py-5">
        <h2 className="text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl">
          Better property management starts here.
        </h2>

        <p className="mt-3 hidden text-sm leading-6 text-white/85 sm:block sm:text-base sm:leading-7">
          Keep property records organized, track your tenants,
          and manage your rentals from one place.
        </p>
      </div>

      <p className="relative z-10 hidden text-sm text-white/70 md:block">
        Simplifying the way you manage properties.
      </p>

    </div>

  </div>
</div>
      </div>
      

    
  );
}
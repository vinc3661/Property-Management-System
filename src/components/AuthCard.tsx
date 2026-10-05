import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

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
};

export function AuthCard({
  onRegister,
  onSignUser,
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

        

        <div className="flex items-center p-8 md:p-12">

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

        

        <div className="hidden md:flex flex-col justify-center bg-blue-600 p-12 text-white">

          <h2 className="text-5xl font-bold">
            Welcome
          </h2>

          <p className="mt-6 text-lg leading-relaxed text-blue-100">
            Take control of your properties with ease.
            Stay organized, keep track of your tenants,
            and make property management feel effortless.
          </p>

        </div>

      </div>

    </div>
  );
}
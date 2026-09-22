import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaShieldAlt } from "react-icons/fa";

import api from "../services/api";
import AnimatedBackground from "../components/AnimatedBackground";
import { toast } from "react-hot-toast";


const authToastConfig = {
  position: "top-center",
  duration: 5000,
  style: {
    background: "#0f172a",
    color: "#ffffff",
    border: "2px solid #334155",
    padding: "20px 36px",
    borderRadius: "16px",
    fontSize: "16px",
    fontWeight: "700",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
    maxWidth: "500px",
    textAlign: "center",
    backdropFilter: "blur(12px)",
  }
};

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please enter email and password", authToastConfig);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address", authToastConfig);
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      if (!response.data.token) {
        toast.error(response.data.message || "Invalid login response", authToastConfig);
        setIsLoading(false);
        return;
      }

      // Store credentials
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      localStorage.setItem("email", response.data.email);
      localStorage.setItem("role", response.data.role);
      localStorage.setItem("isLoggedIn", "true");

      toast.success(response.data.message || "Login Successful", authToastConfig);

      navigate("/dashboard");
    } catch (error) {
      console.log(error);

      let errorMessage = "Login Failed";
      if (error.response?.data) {
        if (typeof error.response.data === "string") {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage, authToastConfig);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden flex items-center justify-center p-4">
      {/* Background decoration */}
      <AnimatedBackground />

      {/* Modern Cyber Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-60 z-0"></div>

      <div className="relative z-10 w-full max-w-md">
        {/* Brand Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-center mb-8"
        >
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-sky-400 to-blue-600 text-white flex items-center justify-center shadow-xl shadow-sky-500/20 mb-4 border border-sky-400/20">
            <FaShieldAlt className="text-3xl" />
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-white flex items-center gap-1">
            Cloud<span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">Security</span>
          </h1>

          <p className="text-xs font-bold tracking-[6px] text-sky-400/80 uppercase mt-2">
            Cyber Defense Command
          </p>
        </motion.div>

        {/* Login Glass Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl relative overflow-hidden group"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-500 via-cyan-400 to-blue-600"></div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white">Access Portal</h2>
            <p className="text-slate-400 text-xs mt-1">Authenticate secure session to continue.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                  <FaEnvelope className="text-sm" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 outline-none transition-all duration-300"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sky-400 hover:text-sky-300 text-[10px] font-semibold transition"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                  <FaLock className="text-sm" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-11 pr-12 py-3 text-sm text-white placeholder:text-slate-600 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 outline-none transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                </button>
              </div>
            </div>

            {/* Session Options */}
            <div className="flex justify-between items-center pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="rounded border-slate-800 bg-slate-950 text-sky-500 focus:ring-0 accent-sky-500 w-4 h-4 cursor-pointer"
                />
                <span>Maintain session persistence</span>
              </label>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl text-sm transition-all duration-300 shadow-lg shadow-sky-500/10 flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <span>Authenticating console...</span>
              ) : (
                <span>Initialize Portal</span>
              )}
            </motion.button>
          </form>

          {/* Registration Redirect */}
          <div className="mt-6 pt-6 border-t border-slate-800/80 flex items-center justify-center gap-1.5 text-xs">
            <span className="text-slate-500">Access not provisioned?</span>
            <Link
              to="/register"
              className="text-sky-400 hover:text-sky-300 font-bold transition hover:underline"
            >
              Register console ID
            </Link>
          </div>
        </motion.div>

        {/* Footer Slogan */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center text-slate-400 text-[10px] tracking-wider mt-8 uppercase font-bold"
        >
          Securing Operations • Protecting Assets
        </motion.p>
      </div>
    </div>
  );
}

export default Login;

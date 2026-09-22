import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaShieldAlt, FaUser } from "react-icons/fa";
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

function Register() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [roleName, setRoleName] = useState("VIEWER");
    const [secretPassword, setSecretPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!name.trim() || !email.trim() || !password || !confirmPassword) {
            toast.error("Please fill in all required fields.", authToastConfig);
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match.", authToastConfig);
            return;
        }

        if (password.length < 8) {
            toast.error("Password must be at least 8 characters long.", authToastConfig);
            return;
        }

        try {
            setLoading(true);

            const response = await api.post("/auth/register", {
                name,
                email,
                password,
                roleName,
                secretPassword
            });

            const successMessage = typeof response.data === "string" 
                ? response.data 
                : (response.data?.message || "Registration Successful!");

            toast.success(successMessage, authToastConfig);
            navigate("/login");
        } catch (error) {
            let errorMessage = "Registration failed. Please try again.";

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
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 relative overflow-hidden flex items-center justify-center p-4">
            {/* Background decoration */}
            <AnimatedBackground />

            {/* Modern Cyber Grid Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-60 z-0"></div>

            <div className="relative z-10 w-full max-w-md my-8">
                {/* Brand Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col items-center text-center mb-6"
                >
                    <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-sky-400 to-blue-600 text-white flex items-center justify-center shadow-xl shadow-sky-500/20 mb-3 border border-sky-400/20">
                        <FaShieldAlt className="text-2xl" />
                    </div>

                    <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-1">
                        Cloud<span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">Security</span>
                    </h1>

                    <p className="text-[10px] font-bold tracking-[4px] text-sky-400/80 uppercase mt-1">
                        Cyber Defense Command
                    </p>
                </motion.div>

                {/* Register Glass Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl relative overflow-hidden group"
                >
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-500 via-cyan-400 to-blue-600"></div>

                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-white">Register Console ID</h2>
                        <p className="text-slate-400 text-xs mt-1">Provision your secure credentials to join the defense grid.</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-4">
                        {/* Full Name */}
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Full Name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                                    <FaUser className="text-sm" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Jane Doe"
                                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-slate-650 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 outline-none transition-all duration-300"
                                />
                            </div>
                        </div>

                        {/* Email */}
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
                                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-slate-650 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 outline-none transition-all duration-300"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Password
                            </label>
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
                                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-11 pr-12 py-2.5 text-sm text-white placeholder:text-slate-650 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 outline-none transition-all duration-300"
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

                        {/* Confirm Password */}
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                                    <FaLock className="text-sm" />
                                </div>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-11 pr-12 py-2.5 text-sm text-white placeholder:text-slate-650 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 outline-none transition-all duration-300"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300"
                                >
                                    {showConfirmPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                                </button>
                            </div>
                        </div>

                        {/* Role Selection */}
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Select Console Role
                            </label>
                            <select
                                value={roleName}
                                onChange={(e) => setRoleName(e.target.value)}
                                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 outline-none transition-all duration-300"
                                required
                            >
                                <option value="VIEWER" className="bg-slate-950">Viewer</option>
                                <option value="ANALYST" className="bg-slate-950">Analyst</option>
                                <option value="ADMIN" className="bg-slate-950">Admin</option>
                            </select>
                        </div>

                        {/* Secret Password for Admin/Analyst */}
                        {(roleName === "ADMIN" || roleName === "ANALYST") && (
                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    Role Secret Verification Key
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                                        <FaLock className="text-sm" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={secretPassword}
                                        onChange={(e) => setSecretPassword(e.target.value)}
                                        placeholder={`Enter ${roleName.toLowerCase()} secret key`}
                                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-slate-650 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 outline-none transition-all duration-300"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl text-sm transition-all duration-300 shadow-lg shadow-sky-500/10 flex items-center justify-center gap-2 mt-4"
                        >
                            {loading ? (
                                <span>Creating Defense Console ID...</span>
                            ) : (
                                <span>Create Console ID</span>
                            )}
                        </motion.button>
                    </form>

                    {/* Login Redirect */}
                    <div className="mt-6 pt-6 border-t border-slate-800/80 flex items-center justify-center gap-1.5 text-xs">
                        <span className="text-slate-500">Already provisioned?</span>
                        <Link
                            to="/login"
                            className="text-sky-400 hover:text-sky-300 font-bold transition hover:underline"
                        >
                            Login Console ID
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

export default Register;
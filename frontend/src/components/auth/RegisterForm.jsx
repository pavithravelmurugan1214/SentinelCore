import { Link } from "react-router-dom";
import PasswordInput from "./PasswordInput";

function RegisterForm({
    name,
    email,
    password,
    confirmPassword,
    roleName,
    secretPassword,
    setName,
    setEmail,
    setPassword,
    setConfirmPassword,
    setRoleName,
    setSecretPassword,
    handleRegister,
    loading = false,
}) {
    return (
        <div className="w-full max-w-md">

            <div className="bg-white rounded-3xl shadow-2xl p-10">

                <h2 className="text-3xl font-bold text-slate-800">
                    Create Account
                </h2>

                <p className="text-slate-500 mt-2">
                    Register to access Cloud Security
                </p>

                <form
                    onSubmit={handleRegister}
                    className="space-y-5 mt-8"
                >

                    {/* Full Name */}

                    <div>

                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Full Name
                        </label>

                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your full name"
                            className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none"
                            required
                        />

                    </div>

                    {/* Email */}

                    <div>

                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Email
                        </label>

                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none"
                            required
                        />

                    </div>

                    {/* Password */}

                    <div>

                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Password
                        </label>

                        <PasswordInput
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                    </div>

                    {/* Confirm Password */}

                    <div>

                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Confirm Password
                        </label>

                        <PasswordInput
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm Password"
                            name="confirmPassword"
                        />

                    </div>

                    {/* Role Selection */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Select Role
                        </label>
                        <select
                            value={roleName}
                            onChange={(e) => setRoleName(e.target.value)}
                            className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none bg-white text-slate-800"
                            required
                        >
                            <option value="VIEWER">Viewer</option>
                            <option value="ANALYST">Analyst</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>

                    {/* Secret Password for Admin/Analyst */}
                    {(roleName === "ADMIN" || roleName === "ANALYST") && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Role Secret Key
                            </label>
                            <input
                                type="password"
                                value={secretPassword}
                                onChange={(e) => setSecretPassword(e.target.value)}
                                placeholder={`Enter ${roleName.toLowerCase()} secret key`}
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none"
                                required
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white py-3 rounded-xl font-semibold transition"
                    >
                        {loading ? "Creating Account..." : "Create Account"}
                    </button>

                </form>

                <p className="text-center text-slate-500 mt-8">

                    Already have an account?

                    <Link
                        to="/login"
                        className="text-sky-600 font-semibold ml-2 hover:underline"
                    >
                        Login
                    </Link>

                </p>

            </div>

        </div>
    );
}

export default RegisterForm;
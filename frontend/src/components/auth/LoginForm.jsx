import { Link } from "react-router-dom";
import PasswordInput from "./PasswordInput";

function LoginForm({
  email,
  password,
  setEmail,
  setPassword,
  handleLogin,
  loading = false,
}) {
  return (
    <div className="w-full max-w-md">

      <div className="bg-white rounded-3xl shadow-2xl p-10">

        <h2 className="text-3xl font-bold text-slate-800">
          Welcome Back
        </h2>

        <p className="text-slate-500 mt-2">
          Sign in to continue to Cloud Security
        </p>

        <form
          onSubmit={handleLogin}
          className="space-y-5 mt-8"
        >

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

          {/* Remember & Forgot */}

          <div className="flex items-center justify-between text-sm">

            <label className="flex items-center gap-2 text-slate-600">

              <input type="checkbox" />

              Remember Me

            </label>

            <button
              type="button"
              className="text-sky-600 hover:underline"
            >
              Forgot Password?
            </button>

          </div>

          {/* Login */}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-600 hover:bg-sky-700 text-white py-3 rounded-xl font-semibold transition"
          >
            {loading ? "Signing In..." : "Login"}
          </button>

        </form>

        <p className="text-center text-slate-500 mt-8">

          Don't have an account?

          <Link
            to="/register"
            className="text-sky-600 font-semibold ml-2 hover:underline"
          >
            Create Account
          </Link>

        </p>

      </div>

    </div>
  );
}

export default LoginForm;
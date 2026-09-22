import { Link } from "react-router-dom";
import security from "../assets/security.png";

function Welcome() {
  return (
    <div className="min-h-screen h-screen flex bg-[#07142B] overflow-hidden">

      <div className="w-1/2 flex flex-col justify-center px-20">

        <div className="mb-6 flex items-center gap-3">

          <img
            src="/logo.png"
            alt="logo"
            className="w-14"
          />

          <h2 className="text-4xl font-bold text-white">
            Cloud<span className="text-blue-500">Security</span>
          </h2>

        </div>

        <h3 className="text-4xl text-white font-medium mb-2">
          Welcome to
        </h3>

        <h1 className="text-7xl font-bold text-white">

          Cloud<span className="text-blue-500">Security</span>

        </h1>

        <h3 className="mt-3 tracking-[8px] text-blue-400 text-2xl">

          SECURITY OPERATIONS

        </h3>

        <div className="w-20 h-1 bg-blue-500 rounded-full mt-8 mb-8"></div>

        <p className="text-gray-300 text-xl leading-9 max-w-xl">

          Your centralized platform for threat detection,
          incident response, vulnerability management,
          and real-time enterprise security monitoring.

        </p>

        <div className="mt-14 flex gap-6">

          <Link
            to="/login"
            className="bg-blue-600 hover:bg-blue-700 duration-300 px-12 py-4 rounded-xl text-white text-xl font-semibold shadow-lg"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="border-2 border-blue-500 hover:bg-blue-600 duration-300 px-12 py-4 rounded-xl text-white text-xl font-semibold"
          >
            Register
          </Link>

        </div>

      </div>

      {/* Right Side */}

      <div className="w-1/2 relative h-full min-h-screen">

        <img
          src={security}
          alt="security"
          className="h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-blue-950/20"></div>

      </div>

    </div>
  );
}

export default Welcome;
import { ShieldCheck, LockKeyhole, Activity } from "lucide-react";

function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 flex">

      {/* Left Section */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 text-white flex-col justify-center px-20">

        <div className="max-w-lg">

          <div className="flex items-center gap-4 mb-10">

            <div className="w-16 h-16 rounded-2xl bg-sky-500 flex items-center justify-center shadow-lg">

              <ShieldCheck size={34} />

            </div>

            <div>

              <h1 className="text-4xl font-bold">
                Cloud Security
              </h1>

              <p className="text-slate-300 mt-2">
                Cyber Threat Intelligence Platform
              </p>

            </div>

          </div>

          <h2 className="text-5xl font-bold leading-tight">
            Secure your infrastructure with intelligent threat monitoring.
          </h2>

          <p className="text-slate-300 text-lg mt-8 leading-8">
            Detect threats, manage IOCs, monitor alerts, and protect your
            organization with enterprise-grade cyber intelligence.
          </p>

          <div className="mt-16 space-y-6">

            <div className="flex items-center gap-4">

              <ShieldCheck className="text-sky-400" />

              <span>Real-time Threat Detection</span>

            </div>

            <div className="flex items-center gap-4">

              <Activity className="text-sky-400" />

              <span>IOC Intelligence & Analytics</span>

            </div>

            <div className="flex items-center gap-4">

              <LockKeyhole className="text-sky-400" />

              <span>Secure JWT Authentication</span>

            </div>

          </div>

        </div>

      </div>

      {/* Right Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-slate-100 px-8">

        {children}

      </div>

    </div>
  );
}

export default AuthLayout;
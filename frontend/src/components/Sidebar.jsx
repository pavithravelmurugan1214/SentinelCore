import {
  FaHome,
  FaPlusCircle,
  FaShieldAlt,
  FaUsers,
  FaExclamationTriangle,
  FaSearch,
  FaFileAlt,
  FaCog,
  FaList,
  FaBell,
  FaCircle,
  FaBug,
  FaClipboardList,
  FaBookOpen,
  FaBook,
  FaHistory,
  FaEnvelopeOpen,
  FaServer,
  FaLaptop,
} from "react-icons/fa";

import { useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { getCurrentRole } from "../services/auth";
import { useSettings } from "../context/SettingsContext";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings } = useSettings();


  const role = getCurrentRole();

  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const savedScroll = sessionStorage.getItem("sidebar-scroll");
    if (savedScroll && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = parseInt(savedScroll, 10);
    }
  }, []);

  const handleScroll = (e) => {
    sessionStorage.setItem("sidebar-scroll", e.target.scrollTop);
  };

  const menu = [
    {
      title: "Home",
      icon: <FaHome />,
      path: "/dashboard",
    },
    {
      title: "Threat List",
      icon: <FaShieldAlt />,
      path: "/threat-list",
    },
    {
      title: "IOC List",
      icon: <FaList />,
      path: "/ioc-list",
    },
    {
      title: "Alert List",
      icon: <FaExclamationTriangle />,
      path: "/alert-list",
    },
    {
      title: "Alert Rules",
      icon: <FaCog />,
      path: "/alert-rules",
      roles: ["ADMIN", "ANALYST"],
    },
    {
      title: "Incidents",
      icon: <FaClipboardList />,
      path: "/incidents",
    },
    {
      title: "Playbooks",
      icon: <FaBookOpen />,
      path: "/playbooks",
    },
    {
      title: "Knowledge Base",
      icon: <FaBook />,
      path: "/knowledge-base",
    },
    {
      title: "Vulnerabilities",
      icon: <FaBug />,
      path: "/vulnerabilities",
    },
    {
      title: "Asset Dashboard",
      icon: <FaServer />,
      path: "/assets/dashboard",
    },
    {
      title: "Asset Inventory",
      icon: <FaLaptop />,
      path: "/assets",
    },
    {
      title: "Audit Logs",
      icon: <FaHistory />,
      path: "/audit-logs",
      roles: ["ADMIN", "ANALYST"],
    },
    {
      title: "Users",
      icon: <FaUsers />,
      path: "/users",
      roles: ["ADMIN"],
    },
    {
      title: "Reports",
      icon: <FaFileAlt />,
      path: "/reports",
    },
    {
      title: "Enterprise Reports",
      icon: <FaFileAlt />,
      path: "/new-reports",
      roles: ["ADMIN", "ANALYST"],
    },
    {
      title: "Settings",
      icon: <FaCog />,
      path: "/settings",
      roles: ["ADMIN", "ANALYST", "VIEWER"],
    },
  ];

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-20">

      <div className="p-6 border-b border-slate-800">

        <h1 className="text-white font-bold text-lg tracking-wider flex items-center gap-2">
          <FaShieldAlt className="text-sky-500 shrink-0" />
          <span className="uppercase">{settings.organizationName || settings.platformName || "CLOUD SECURITY"}</span>
        </h1>

        <p className="text-slate-400 text-sm mt-2">
          {settings.timezone ? `Timezone: ${settings.timezone}` : "Role-based security operations"}
        </p>


      </div>

      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 mt-5 px-3 pb-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800"
      >

        {menu
          .filter((item) => !item.roles || item.roles.includes(role))
          .map((item) => {

            const active = location.pathname === item.path;

            return (
              <button
                key={item.title}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 mb-1 group relative overflow-hidden ${
                  active
                    ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-850/50 border border-transparent"
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-y from-sky-400 to-blue-500 rounded-r"
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 30,
                    }}
                  />
                )}

                <span
                  className={`text-base transition-colors ${
                    active
                      ? "text-sky-400"
                      : "text-slate-400 group-hover:text-sky-400"
                  }`}
                >
                  {item.icon}
                </span>

                <span className="truncate">{item.title}</span>

                {!active && (
                  <FaCircle className="opacity-0 group-hover:opacity-100 text-[6px] text-sky-500 absolute right-4 transition-all duration-300 transform scale-0 group-hover:scale-100" />
                )}
              </button>
            );
          })}

      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-900/50">

        <div className="flex items-center gap-3">

          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-sky-500/20">
            {settings.userName ? settings.userName.charAt(0).toUpperCase() : (role ? role.charAt(0) : "U")}
          </div>

          <div className="flex-1 min-w-0">

            <p className="text-slate-300 text-xs font-semibold truncate">
              {settings.userName || "System Access"}
            </p>

            <p className="text-slate-500 text-[10px] mt-0.5 truncate">
              {settings.userEmail || localStorage.getItem("email") || "guest@cloudsecurity.local"}
            </p>

          </div>

        </div>

        <p className="text-slate-500 text-xs mt-3">
          Signed in as: {role}
        </p>


      </div>

    </aside>
  );
}

export default Sidebar;
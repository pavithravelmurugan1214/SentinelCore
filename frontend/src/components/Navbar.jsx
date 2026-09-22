import { useState, useRef, useEffect } from "react";
import { FaBell, FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import { useNotifications } from "../context/NotificationContext";
import NotificationDropdown from "./NotificationDropdown";

import { useSettings } from "../context/SettingsContext";

function Navbar() {

    const navigate = useNavigate();
    const { settings } = useSettings();

    const email = localStorage.getItem("email");
    const role = localStorage.getItem("role");

    const { unreadCount } = useNotifications();

    const [openNotifications, setOpenNotifications] = useState(false);

    const notificationRef = useRef(null);

    // Close notification dropdown when clicking outside
    useEffect(() => {

        function handleClickOutside(event) {

            if (
                notificationRef.current &&
                !notificationRef.current.contains(event.target)
            ) {
                setOpenNotifications(false);
            }

        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };

    }, []);

    const logout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("email");
        localStorage.removeItem("role");
        localStorage.removeItem("isLoggedIn");

        navigate("/");

    };

    return (

        <nav className="fixed top-0 left-0 right-0 h-16 bg-slate-900 text-white flex items-center justify-between px-6 shadow-lg z-50">

            {/* Logo */}
            <h1 className="text-2xl font-bold text-cyan-400">
                {settings.organizationName || settings.platformName || "Cloud Security"}
            </h1>

            {/* Right Section */}
            <div className="flex items-center gap-6">

                {/* Notification Bell */}
                <div
                    ref={notificationRef}
                    className="relative"
                >


                    <button
                        onClick={() =>
                            setOpenNotifications(!openNotifications)
                        }
                        className="relative"
                    >

                        <FaBell className="text-2xl hover:text-cyan-400 transition duration-200" />

                        {unreadCount > 0 && (

                            <span
                                className="
                                    absolute
                                    -top-2
                                    -right-2
                                    bg-red-600
                                    text-white
                                    text-xs
                                    font-bold
                                    rounded-full
                                    w-5
                                    h-5
                                    flex
                                    items-center
                                    justify-center
                                "
                            >
                                {unreadCount}
                            </span>

                        )}

                    </button>

                    <NotificationDropdown
                        open={openNotifications}
                    />

                </div>

                {/* User Info */}
                <div className="flex items-center gap-3">

                    {settings.profileImage ? (
                        <img
                            src={settings.profileImage}
                            alt="Profile"
                            className="w-9 h-9 rounded-full object-cover border border-cyan-400"
                            onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                        />
                    ) : (
                        <FaUserCircle className="text-3xl text-cyan-400" />
                    )}

                    <div>

                        <p className="text-sm font-semibold">
                            {settings.userName || email}
                        </p>

                        <span
                            className={`text-xs px-2 py-1 rounded-full font-bold ${
                                role === "ADMIN"
                                    ? "bg-red-600 text-white"
                                    : role === "ANALYST"
                                    ? "bg-cyan-600 text-white"
                                    : "bg-blue-600 text-white"
                            }`}
                        >
                            {role}
                        </span>

                    </div>

                </div>


                {/* Logout */}
                <button
                    onClick={logout}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
                >
                    <FaSignOutAlt />
                    Logout
                </button>

            </div>

        </nav>

    );

}

export default Navbar;
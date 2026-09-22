import { createContext, useContext, useState, useEffect } from "react";
import { getSystemSettings } from "../services/settingsService";
import { getProfile } from "../services/profileService";

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
    const [settings, setSettings] = useState({
        organizationName: "Cloud Security",
        timezone: "Asia/Kolkata",
        theme: "dark",
        userName: "",
        userEmail: "",
        profileImage: "",
        emailNotificationsEnabled: true,
        inAppNotificationsEnabled: true,
    });

    useEffect(() => {
        loadSettings();
    }, []);

    useEffect(() => {
        const root = document.documentElement;
        if (settings.theme === "light") {
            root.classList.add("light");
            root.classList.add("light-mode");
            root.classList.remove("dark");
            root.classList.remove("dark-mode");
        } else {
            root.classList.add("dark");
            root.classList.add("dark-mode");
            root.classList.remove("light");
            root.classList.remove("light-mode");
        }
        
        if (settings.organizationName) {
            document.title = `${settings.organizationName} | Enterprise SOC`;
        }
    }, [settings.theme, settings.organizationName]);

    const loadSettings = async () => {
        try {
            const sysData = await getSystemSettings();
            let profData = null;

            if (localStorage.getItem("token")) {
                try {
                    profData = await getProfile();
                } catch (e) {
                    console.log("Pre-auth or profile load error:", e);
                }
            }

            setSettings((prev) => ({
                ...prev,
                organizationName: sysData?.organizationName || prev.organizationName,
                timezone: sysData?.timezone || prev.timezone,
                theme: profData?.theme || sysData?.theme || prev.theme || "dark",
                userName: profData?.name || prev.userName,
                userEmail: profData?.email || prev.userEmail,
                profileImage: profData?.profileImage || prev.profileImage,
                emailNotificationsEnabled: profData?.emailNotificationsEnabled !== undefined ? profData.emailNotificationsEnabled : prev.emailNotificationsEnabled,
                inAppNotificationsEnabled: profData?.inAppNotificationsEnabled !== undefined ? profData.inAppNotificationsEnabled : prev.inAppNotificationsEnabled,
            }));
        } catch (error) {
            console.error("Error loading system settings:", error);
        }
    };

    const updateSettingsState = (newSettings) => {
        setSettings((prev) => ({
            ...prev,
            ...newSettings,
        }));
    };

    return (
        <SettingsContext.Provider
            value={{
                settings,
                updateSettingsState,
                reloadSettings: loadSettings,
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    return useContext(SettingsContext);
}


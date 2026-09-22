import { useState, useEffect } from "react";
import { getCurrentRole } from "../services/auth";
import { getProfile, updateProfile, changePassword } from "../services/profileService";
import {
    getAlertSettings,
    updateAlertSettings,
    getNotificationSettings,
    updateNotificationSettings,
    getRetentionSettings,
    updateRetentionSettings,
    getSystemSettings,
    updateSystemSettings,
} from "../services/settingsService";
import { useSettings } from "../context/SettingsContext";

import {
    FaUser,
    FaExclamationTriangle,
    FaEnvelope,
    FaDatabase,
    FaSlidersH,
    FaLock,
    FaCheck,
    FaSave,
    FaKey,
    FaShieldAlt,
    FaMoon,
    FaSun,
    FaUserShield,
    FaBell,
} from "react-icons/fa";

import { toast } from "react-hot-toast";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import AnimatedBackground from "../components/AnimatedBackground";

import PageHeader from "../components/ui/PageHeader";
import GlassCard from "../components/ui/GlassCard";
import PrimaryButton from "../components/ui/PrimaryButton";

function Settings() {
    const { updateSettingsState } = useSettings();
    const role = getCurrentRole();
    const isAdmin = role === "ADMIN";

    const [activeTab, setActiveTab] = useState("profile");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Profile Form State
    const [profile, setProfile] = useState({
        name: "",
        email: "",
        role: "",
        profileImage: "",
        theme: "dark",
        emailNotificationsEnabled: true,
        inAppNotificationsEnabled: true,
    });

    // Change Password State
    const [passwordForm, setPasswordForm] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    // Alert Settings State
    const [alertSettings, setAlertSettings] = useState({
        criticalThreshold: 90,
        highThreshold: 70,
        autoCreateIncident: true,
    });

    // Notification Settings State
    const [notificationSettings, setNotificationSettings] = useState({
        emailEnabled: true,
        smtpHost: "smtp.gmail.com",
        smtpPort: 587,
        senderEmail: "admin@cloudsecurity.com",
        senderPassword: "••••••••••••",
        webhookEnabled: false,
        webhookUrl: "",
        notificationThrottleMinutes: 5,
        alertEscalationMinutes: 10,
    });

    // Retention Settings State
    const [retentionSettings, setRetentionSettings] = useState({
        logRetentionDays: 90,
        auditRetentionDays: 180,
    });

    // System Settings State
    const [systemSettings, setSystemSettings] = useState({
        organizationName: "Cloud Security",
        timezone: "Asia/Kolkata",
    });

    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        setLoading(true);
        try {
            // Load User Profile (All users)
            const profData = await getProfile();
            if (profData) {
                setProfile(profData);
                updateSettingsState({ theme: profData.theme || "dark" });
            }

            // Load Admin Settings
            if (isAdmin) {
                const [alerts, notifications, retention, sys] = await Promise.all([
                    getAlertSettings().catch(() => null),
                    getNotificationSettings().catch(() => null),
                    getRetentionSettings().catch(() => null),
                    getSystemSettings().catch(() => null),
                ]);

                if (alerts) setAlertSettings(alerts);
                if (notifications) setNotificationSettings(notifications);
                if (retention) setRetentionSettings(retention);
                if (sys) {
                    setSystemSettings(sys);
                    updateSettingsState({ organizationName: sys.organizationName });
                }
            }
        } catch (error) {
            console.error("Error loading settings:", error);
            toast.error("Failed to load user settings");
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // HANDLERS
    // ==========================================

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const updated = await updateProfile({
                name: profile.name,
                profileImage: profile.profileImage,
                theme: profile.theme,
                emailNotificationsEnabled: profile.emailNotificationsEnabled,
                inAppNotificationsEnabled: profile.inAppNotificationsEnabled,
            });
            setProfile(updated);
            updateSettingsState({
                theme: updated.theme,
                userName: updated.name,
                profileImage: updated.profileImage,
                emailNotificationsEnabled: updated.emailNotificationsEnabled,
                inAppNotificationsEnabled: updated.inAppNotificationsEnabled,
            });
            toast.success("Profile settings saved!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword.length < 8) {
            toast.error("New password must be at least 8 characters long");
            return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error("Confirm password does not match new password");
            return;
        }

        setSaving(true);
        try {
            await changePassword(passwordForm);
            setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
            toast.success("Password changed successfully!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to change password");
        } finally {
            setSaving(false);
        }
    };

    const handleSaveAlerts = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const updated = await updateAlertSettings(alertSettings);
            setAlertSettings(updated);
            updateSettingsState({
                alertCritical: updated.criticalThreshold,
                alertHigh: updated.highThreshold,
                autoCreateIncident: updated.autoCreateIncident,
            });
            toast.success("Alert settings updated!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to save alert settings");
        } finally {
            setSaving(false);
        }
    };

    const handleSaveNotifications = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const updated = await updateNotificationSettings(notificationSettings);
            setNotificationSettings(updated);
            toast.success("Notification settings updated!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to save notification settings");
        } finally {
            setSaving(false);
        }
    };

    const handleSaveRetention = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const updated = await updateRetentionSettings(retentionSettings);
            setRetentionSettings(updated);
            toast.success("Data retention policies updated!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to save retention settings");
        } finally {
            setSaving(false);
        }
    };

    const handleSaveSystem = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const updated = await updateSystemSettings(systemSettings);
            setSystemSettings(updated);
            updateSettingsState({
                organizationName: updated.organizationName,
                timezone: updated.timezone,
            });
            toast.success("System settings updated!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to save system settings");
        } finally {
            setSaving(false);
        }
    };


    const tabs = [
        { id: "profile", label: "Profile", icon: <FaUser />, adminOnly: false },
        { id: "alerts", label: "Alerts", icon: <FaExclamationTriangle />, adminOnly: true },
        { id: "notifications", label: "Notifications", icon: <FaEnvelope />, adminOnly: true },
        { id: "retention", label: "Data Retention", icon: <FaDatabase />, adminOnly: true },
        { id: "system", label: "System", icon: <FaSlidersH />, adminOnly: true },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden font-sans">
            <AnimatedBackground />

            <Navbar />

            <div className="flex pt-16">
                <Sidebar />

                <main className="flex-1 ml-64 p-8 z-10 max-w-6xl mx-auto">
                    <PageHeader
                        title="Control Center & Settings"
                        subtitle="Centralized configuration management and individual user profile preferences."
                    />

                    {/* Navigation Tabs */}
                    <div className="flex flex-wrap items-center gap-2 mb-8 bg-slate-900/70 p-2 rounded-2xl border border-slate-800 backdrop-blur-md">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                                    activeTab === tab.id
                                        ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/25"
                                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                                }`}
                            >
                                <span className="text-base">{tab.icon}</span>
                                {tab.label}
                                {tab.adminOnly && !isAdmin && (
                                    <FaLock className="text-xs text-amber-400/70 ml-1" />
                                )}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <GlassCard className="p-12 text-center text-slate-400">
                            <div className="animate-spin text-4xl text-sky-400 mx-auto mb-4">
                                <FaShieldAlt />
                            </div>
                            <p>Loading Configuration & Profile...</p>
                        </GlassCard>
                    ) : (
                        <div>
                            {/* TAB 1: PROFILE (All Users) */}
                            {activeTab === "profile" && (
                                <div className="space-y-8">
                                    <GlassCard className="p-8 border-slate-800">
                                        <div className="border-b border-slate-800 pb-4 mb-6">
                                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                                <FaUser className="text-sky-400" />
                                                User Profile Preferences
                                            </h3>
                                            <p className="text-sm text-slate-400 mt-1">
                                                Manage your personal identity, contact details, and theme styling.
                                            </p>
                                        </div>

                                        <form onSubmit={handleSaveProfile} className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                                                        Full Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={profile.name}
                                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                                        required
                                                        className="w-full bg-slate-900 border border-slate-750 focus:border-sky-500 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none transition-colors"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                                                        Profile Image URL
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={profile.profileImage || ""}
                                                        onChange={(e) => setProfile({ ...profile, profileImage: e.target.value })}
                                                        placeholder="https://example.com/avatar.png"
                                                        className="w-full bg-slate-900 border border-slate-750 focus:border-sky-500 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none transition-colors"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                                                        Email Address (Read Only)
                                                    </label>
                                                    <input
                                                        type="email"
                                                        value={profile.email}
                                                        disabled
                                                        className="w-full bg-slate-900/50 border border-slate-800 text-slate-400 rounded-xl px-4 py-3 text-sm cursor-not-allowed"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                                                        Role (Read Only)
                                                    </label>
                                                    <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-800 px-4 py-3 rounded-xl text-sky-400 font-bold text-sm">
                                                        <FaUserShield />
                                                        <span>{profile.role}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Theme Selection */}
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-300 mb-3">
                                                    Interface Theme Styling
                                                </label>
                                                <div className="flex items-center gap-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => setProfile({ ...profile, theme: "dark" })}
                                                        className={`flex items-center gap-3 px-6 py-3 rounded-xl border text-sm font-bold transition-all ${
                                                            profile.theme === "dark"
                                                                ? "bg-sky-500/20 border-sky-500 text-sky-400 shadow-lg shadow-sky-500/10"
                                                                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                                                        }`}
                                                    >
                                                        <FaMoon />
                                                        Dark Mode
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => setProfile({ ...profile, theme: "light" })}
                                                        className={`flex items-center gap-3 px-6 py-3 rounded-xl border text-sm font-bold transition-all ${
                                                            profile.theme === "light"
                                                                ? "bg-sky-500/20 border-sky-500 text-sky-400 shadow-lg shadow-sky-500/10"
                                                                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                                                        }`}
                                                    >
                                                        <FaSun />
                                                        Light Mode
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Notification Preferences */}
                                            <div className="border-t border-slate-800 pt-6">
                                                <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                                    <FaBell className="text-sky-400" />
                                                    Personal Alert Delivery Preferences
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center justify-between">
                                                        <div>
                                                            <h5 className="text-sm font-semibold text-slate-200">Email Notifications</h5>
                                                            <p className="text-xs text-slate-400 mt-0.5">Receive operational alerts via email.</p>
                                                        </div>
                                                        <label className="flex items-center gap-3 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={Boolean(profile.emailNotificationsEnabled)}
                                                                onChange={(e) => setProfile({ ...profile, emailNotificationsEnabled: e.target.checked })}
                                                                className="w-5 h-5 accent-sky-500 rounded cursor-pointer"
                                                            />
                                                            <span className="text-sm font-semibold text-slate-300">Enabled</span>
                                                        </label>
                                                    </div>

                                                    <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center justify-between">
                                                        <div>
                                                            <h5 className="text-sm font-semibold text-slate-200">In-App Toast Alerts</h5>
                                                            <p className="text-xs text-slate-400 mt-0.5">Receive real-time dashboard notifications.</p>
                                                        </div>
                                                        <label className="flex items-center gap-3 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={Boolean(profile.inAppNotificationsEnabled)}
                                                                onChange={(e) => setProfile({ ...profile, inAppNotificationsEnabled: e.target.checked })}
                                                                className="w-5 h-5 accent-sky-500 rounded cursor-pointer"
                                                            />
                                                            <span className="text-sm font-semibold text-slate-300">Enabled</span>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-2 flex justify-end">
                                                <PrimaryButton type="submit" disabled={saving} className="flex items-center gap-2">
                                                    {saving ? (
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <FaSave />
                                                    )}
                                                    {saving ? "Saving Profile..." : "Save Profile"}
                                                </PrimaryButton>
                                            </div>
                                        </form>
                                    </GlassCard>

                                    {/* Password Change Sub-section */}
                                    <GlassCard className="p-8 border-slate-800">
                                        <div className="border-b border-slate-800 pb-4 mb-6">
                                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                                <FaKey className="text-amber-400" />
                                                Security & Password Update
                                            </h3>
                                            <p className="text-sm text-slate-400 mt-1">
                                                Update your account authentication credentials.
                                            </p>
                                        </div>

                                        <form onSubmit={handleChangePassword} className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                                                        Old Password
                                                    </label>
                                                    <input
                                                        type="password"
                                                        value={passwordForm.oldPassword}
                                                        onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                                                        required
                                                        className="w-full bg-slate-900 border border-slate-750 focus:border-sky-500 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none transition-colors"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                                                        New Password (Min 8 Chars)
                                                    </label>
                                                    <input
                                                        type="password"
                                                        value={passwordForm.newPassword}
                                                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                                        required
                                                        minLength={8}
                                                        className="w-full bg-slate-900 border border-slate-750 focus:border-sky-500 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none transition-colors"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                                                        Confirm New Password
                                                    </label>
                                                    <input
                                                        type="password"
                                                        value={passwordForm.confirmPassword}
                                                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                                        required
                                                        className="w-full bg-slate-900 border border-slate-750 focus:border-sky-500 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none transition-colors"
                                                    />
                                                </div>
                                            </div>

                                            <div className="pt-2 flex justify-end">
                                                <PrimaryButton type="submit" disabled={saving} className="bg-amber-600 hover:bg-amber-500 flex items-center gap-2">
                                                    <FaKey />
                                                    {saving ? "Updating Password..." : "Update Password"}
                                                </PrimaryButton>
                                            </div>
                                        </form>
                                    </GlassCard>
                                </div>
                            )}

                            {/* TAB 2: ALERTS (Admin Only) */}
                            {activeTab === "alerts" && (
                                <GlassCard className="p-8 border-slate-800">
                                    <div className="border-b border-slate-800 pb-4 mb-6">
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                            <FaExclamationTriangle className="text-amber-400" />
                                            Alert Engine Threshold Settings
                                        </h3>
                                        <p className="text-sm text-slate-400 mt-1">
                                            Control severity score cutoffs and automated incident creation rules for incoming log telemetry.
                                        </p>
                                    </div>

                                    {!isAdmin ? (
                                        <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400">
                                            <FaLock className="text-4xl text-amber-400 mx-auto mb-3" />
                                            <p className="font-bold text-slate-200">Admin Authorization Required</p>
                                            <p className="text-xs mt-1">Only system administrators can modify Alert Engine configuration parameters.</p>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleSaveAlerts} className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                                                        Critical Threshold Score (0 - 100)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        max={100}
                                                        value={alertSettings.criticalThreshold}
                                                        onChange={(e) => setAlertSettings({ ...alertSettings, criticalThreshold: e.target.value === "" ? "" : e.target.value })}
                                                        required
                                                        className="w-full bg-slate-900 border border-slate-750 focus:border-sky-500 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none transition-colors"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                                                        High Threshold Score (0 - 100)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        max={100}
                                                        value={alertSettings.highThreshold}
                                                        onChange={(e) => setAlertSettings({ ...alertSettings, highThreshold: e.target.value === "" ? "" : e.target.value })}
                                                        required
                                                        className="w-full bg-slate-900 border border-slate-750 focus:border-sky-500 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none transition-colors"
                                                    />
                                                </div>
                                            </div>

                                            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center justify-between">
                                                <div>
                                                    <h4 className="text-sm font-bold text-white">Auto Create Incident</h4>
                                                    <p className="text-xs text-slate-400 mt-0.5">
                                                        Automatically promote Critical alerts directly into active Incident records.
                                                    </p>
                                                </div>
                                                <label className="flex items-center gap-3 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={Boolean(alertSettings.autoCreateIncident)}
                                                        onChange={(e) => setAlertSettings({ ...alertSettings, autoCreateIncident: e.target.checked })}
                                                        className="w-5 h-5 accent-sky-500 rounded"
                                                    />
                                                    <span className="text-sm font-semibold text-slate-200">
                                                        Enabled
                                                    </span>
                                                </label>
                                            </div>

                                            <div className="pt-2 flex justify-end">
                                                <PrimaryButton type="submit" disabled={saving} className="flex items-center gap-2">
                                                    {saving ? (
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <FaSave />
                                                    )}
                                                    {saving ? "Saving..." : "Save Alert Settings"}
                                                </PrimaryButton>
                                            </div>
                                        </form>
                                    )}
                                </GlassCard>
                            )}

                            {/* TAB 3: NOTIFICATIONS (Admin Only) */}
                            {activeTab === "notifications" && (
                                <GlassCard className="p-8 border-slate-800">
                                    <div className="border-b border-slate-800 pb-4 mb-6">
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                            <FaEnvelope className="text-sky-400" />
                                            Notification Service & SMTP Dispatcher
                                        </h3>
                                        <p className="text-sm text-slate-400 mt-1">
                                            Configure mail relay credentials for dispatching operational security alerts and incident summaries.
                                        </p>
                                    </div>

                                    {!isAdmin ? (
                                        <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400">
                                            <FaLock className="text-4xl text-amber-400 mx-auto mb-3" />
                                            <p className="font-bold text-slate-200">Admin Authorization Required</p>
                                            <p className="text-xs mt-1">Only system administrators can configure Notification & SMTP relay settings.</p>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleSaveNotifications} className="space-y-6">
                                            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center justify-between">
                                                <div>
                                                    <h4 className="text-sm font-bold text-white">Enable Email Notifications</h4>
                                                    <p className="text-xs text-slate-400 mt-0.5">
                                                        Master toggle to enable or disable automated email dispatching.
                                                    </p>
                                                </div>
                                                <label className="flex items-center gap-3 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={Boolean(notificationSettings.emailEnabled)}
                                                        onChange={(e) => setNotificationSettings({ ...notificationSettings, emailEnabled: e.target.checked })}
                                                        className="w-5 h-5 accent-sky-500 rounded"
                                                    />
                                                    <span className="text-sm font-semibold text-slate-200">
                                                        Enabled
                                                    </span>
                                                </label>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                                                        SMTP Server Host
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={notificationSettings.smtpHost}
                                                        onChange={(e) => setNotificationSettings({ ...notificationSettings, smtpHost: e.target.value })}
                                                        required
                                                        placeholder="smtp.gmail.com"
                                                        className="w-full bg-slate-900 border border-slate-750 focus:border-sky-500 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none transition-colors"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                                                        SMTP Port (1 - 65535)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        max={65535}
                                                        value={notificationSettings.smtpPort}
                                                        onChange={(e) => setNotificationSettings({ ...notificationSettings, smtpPort: parseInt(e.target.value) || 587 })}
                                                        required
                                                        className="w-full bg-slate-900 border border-slate-750 focus:border-sky-500 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none transition-colors"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                                                        Sender Email Address
                                                    </label>
                                                    <input
                                                        type="email"
                                                        value={notificationSettings.senderEmail}
                                                        onChange={(e) => setNotificationSettings({ ...notificationSettings, senderEmail: e.target.value })}
                                                        required
                                                        placeholder="admin@cloudsecurity.com"
                                                        className="w-full bg-slate-900 border border-slate-750 focus:border-sky-500 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none transition-colors"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                                                        Sender Password / App Token
                                                    </label>
                                                    <input
                                                        type="password"
                                                        value={notificationSettings.senderPassword}
                                                        onChange={(e) => setNotificationSettings({ ...notificationSettings, senderPassword: e.target.value })}
                                                        required
                                                        className="w-full bg-slate-900 border border-slate-750 focus:border-sky-500 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none transition-colors"
                                                    />
                                                </div>
                                            </div>

                                            {/* Webhook Configuration Section */}
                                            <div className="border-t border-slate-800 pt-6 mt-6">
                                                <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                                    <FaSlidersH className="text-sky-400" />
                                                    Outgoing Webhook Integration
                                                </h4>
                                                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center justify-between mb-6">
                                                    <div>
                                                        <h5 className="text-sm font-semibold text-slate-200">Enable Outgoing Webhook</h5>
                                                        <p className="text-xs text-slate-400 mt-0.5">
                                                            Dispatch generated alert payloads to a remote server.
                                                        </p>
                                                    </div>
                                                    <label className="flex items-center gap-3 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={Boolean(notificationSettings.webhookEnabled)}
                                                            onChange={(e) => setNotificationSettings({ ...notificationSettings, webhookEnabled: e.target.checked })}
                                                            className="w-5 h-5 accent-sky-500 rounded"
                                                        />
                                                        <span className="text-sm font-semibold text-slate-200">Enabled</span>
                                                    </label>
                                                </div>

                                                {notificationSettings.webhookEnabled && (
                                                    <div>
                                                        <label className="block text-sm font-semibold text-slate-300 mb-2">
                                                            Webhook Endpoint URL
                                                        </label>
                                                        <input
                                                            type="url"
                                                            value={notificationSettings.webhookUrl || ""}
                                                            onChange={(e) => setNotificationSettings({ ...notificationSettings, webhookUrl: e.target.value })}
                                                            required
                                                            placeholder="http://example.com/webhook"
                                                            className="w-full bg-slate-900 border border-slate-750 focus:border-sky-500 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none transition-colors"
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Throttling & Escalation Rules Section */}
                                            <div className="border-t border-slate-800 pt-6 mt-6">
                                                <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                                    <FaExclamationTriangle className="text-sky-400" />
                                                    Notification Throttling & Escalation Rules
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="block text-sm font-semibold text-slate-300 mb-2">
                                                            Alert Storm Throttling (Minutes)
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            value={notificationSettings.notificationThrottleMinutes || 5}
                                                            onChange={(e) => setNotificationSettings({ ...notificationSettings, notificationThrottleMinutes: parseInt(e.target.value) || 0 })}
                                                            required
                                                            className="w-full bg-slate-900 border border-slate-750 focus:border-sky-500 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none transition-colors"
                                                        />
                                                        <p className="text-xs text-slate-400 mt-1">
                                                            Deduplicate and suppress notification alerts with the same name within this window.
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-semibold text-slate-300 mb-2">
                                                            Critical Alert Escalation (Minutes)
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min={1}
                                                            value={notificationSettings.alertEscalationMinutes || 10}
                                                            onChange={(e) => setNotificationSettings({ ...notificationSettings, alertEscalationMinutes: parseInt(e.target.value) || 10 })}
                                                            required
                                                            className="w-full bg-slate-900 border border-slate-750 focus:border-sky-500 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none transition-colors"
                                                        />
                                                        <p className="text-xs text-slate-400 mt-1">
                                                            Unacknowledged Critical alerts will automatically escalate to Incidents after this delay.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-2 flex justify-end">
                                                <PrimaryButton type="submit" disabled={saving} className="flex items-center gap-2">
                                                    <FaSave />
                                                    {saving ? "Saving..." : "Save Notification Settings"}
                                                </PrimaryButton>
                                            </div>
                                        </form>
                                    )}
                                </GlassCard>
                            )}

                            {/* TAB 4: DATA RETENTION (Admin Only) */}
                            {activeTab === "retention" && (
                                <GlassCard className="p-8 border-slate-800">
                                    <div className="border-b border-slate-800 pb-4 mb-6">
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                            <FaDatabase className="text-sky-400" />
                                            Data Retention & Scheduled Cleanup
                                        </h3>
                                        <p className="text-sm text-slate-400 mt-1">
                                            Configure lifecycle hold durations (30 to 3650 days) for telemetry and audit log records.
                                        </p>
                                    </div>

                                    {!isAdmin ? (
                                        <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400">
                                            <FaLock className="text-4xl text-amber-400 mx-auto mb-3" />
                                            <p className="font-bold text-slate-200">Admin Authorization Required</p>
                                            <p className="text-xs mt-1">Only system administrators can modify Data Retention policies.</p>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleSaveRetention} className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                                                        Log Retention Duration (Days)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min={30}
                                                        max={3650}
                                                        value={retentionSettings.logRetentionDays}
                                                        onChange={(e) => setRetentionSettings({ ...retentionSettings, logRetentionDays: e.target.value === "" ? "" : e.target.value })}
                                                        required
                                                        className="w-full bg-slate-900 border border-slate-750 focus:border-sky-500 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none transition-colors"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                                                        Audit Log Retention Duration (Days)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min={30}
                                                        max={3650}
                                                        value={retentionSettings.auditRetentionDays}
                                                        onChange={(e) => setRetentionSettings({ ...retentionSettings, auditRetentionDays: e.target.value === "" ? "" : e.target.value })}
                                                        required
                                                        className="w-full bg-slate-900 border border-slate-750 focus:border-sky-500 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none transition-colors"
                                                    />
                                                </div>
                                            </div>

                                            <div className="pt-2 flex justify-end">
                                                <PrimaryButton type="submit" disabled={saving} className="flex items-center gap-2">
                                                    <FaSave />
                                                    {saving ? "Saving..." : "Save Data Retention"}
                                                </PrimaryButton>
                                            </div>
                                        </form>
                                    )}
                                </GlassCard>
                            )}

                            {/* TAB 5: SYSTEM (Admin Only) */}
                            {activeTab === "system" && (
                                <GlassCard className="p-8 border-slate-800">
                                    <div className="border-b border-slate-800 pb-4 mb-6">
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                            <FaSlidersH className="text-sky-400" />
                                            System & Organization Metadata
                                        </h3>
                                        <p className="text-sm text-slate-400 mt-1">
                                            Define core tenant organization information used across system reports and logs.
                                        </p>
                                    </div>

                                    {!isAdmin ? (
                                        <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400">
                                            <FaLock className="text-4xl text-amber-400 mx-auto mb-3" />
                                            <p className="font-bold text-slate-200">Admin Authorization Required</p>
                                            <p className="text-xs mt-1">Only system administrators can modify System & Organization settings.</p>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleSaveSystem} className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                                                        Organization Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={systemSettings.organizationName}
                                                        onChange={(e) => setSystemSettings({ ...systemSettings, organizationName: e.target.value })}
                                                        required
                                                        placeholder="Cloud Security"
                                                        className="w-full bg-slate-900 border border-slate-750 focus:border-sky-500 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none transition-colors"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                                                        Default Timezone
                                                    </label>
                                                    <select
                                                        value={systemSettings.timezone}
                                                        onChange={(e) => setSystemSettings({ ...systemSettings, timezone: e.target.value })}
                                                        className="w-full bg-slate-900 border border-slate-750 focus:border-sky-500 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none transition-colors"
                                                    >
                                                        <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                                                        <option value="UTC">UTC (Coordinated Universal Time)</option>
                                                        <option value="America/New_York">America/New_York (EST)</option>
                                                        <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                                                        <option value="Europe/London">Europe/London (BST)</option>
                                                        <option value="Europe/Berlin">Europe/Berlin (CET)</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="pt-2 flex justify-end">
                                                <PrimaryButton type="submit" disabled={saving} className="flex items-center gap-2">
                                                    <FaSave />
                                                    {saving ? "Saving..." : "Save System Settings"}
                                                </PrimaryButton>
                                            </div>
                                        </form>
                                    )}
                                </GlassCard>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default Settings;

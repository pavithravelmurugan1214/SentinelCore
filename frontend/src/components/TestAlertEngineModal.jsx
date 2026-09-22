import { useState } from "react";
import { X, Play } from "lucide-react";
import { toast } from "react-toastify";
import api from "../services/api";
import ModernSelect from "./ui/ModernSelect";
import ModernInput from "./ui/ModernInput";
import PrimaryButton from "./ui/PrimaryButton";

export default function TestAlertEngineModal({ open, onClose }) {
    const [loading, setLoading] = useState(false);
    const [eventData, setEventData] = useState({
        eventType: "FAILED_LOGIN",
        value: 8,
        source: "Firewall",
        description: "8 failed login attempts detected within 1 minute",
    });

    if (!open) return null;

    const handleTrigger = async () => {
        setLoading(true);
        try {
            await api.post("/alert-engine/process", eventData);
            toast.success(`⚡ [${eventData.eventType}] Event Injected! Alert Engine triggered successfully.`, {
                position: "top-right",
                autoClose: 4000,
                theme: "dark"
            });
            onClose();
        } catch (error) {
            console.error("Failed to inject event", error);
            const msg = error.response?.data?.message || error.response?.data || error.message || "Failed to process security event";
            toast.error(`❌ Security event injection failed: ${msg}`, {
                position: "top-right",
                autoClose: 5000,
                theme: "dark"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl w-[550px] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
                    <div className="flex items-center gap-3">
                        <Play className="text-cyan-400" size={24} />
                        <h2 className="text-xl font-bold text-white">Test Alert Engine</h2>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-red-400 transition">
                        <X size={22} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5">
                    <p className="text-slate-400 text-sm">
                        Simulate a real-time security event to trigger alert rules and automate response playbooks.
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        <ModernSelect
                            label="Event Type"
                            value={eventData.eventType}
                            onChange={(e) => setEventData({ ...eventData, eventType: e.target.value })}
                            options={[
                                "FAILED_LOGIN",
                                "PORT_SCAN",
                                "MALWARE",
                                "DDOS",
                                "SQL_INJECTION",
                                "XSS",
                                "BRUTE_FORCE",
                            ]}
                        />

                        <ModernInput
                            label="Event Value (Count)"
                            type="number"
                            value={eventData.value}
                            onChange={(e) => setEventData({ ...eventData, value: Number(e.target.value) })}
                        />

                        <div className="col-span-2">
                            <ModernSelect
                                label="Event Source"
                                value={eventData.source}
                                onChange={(e) => setEventData({ ...eventData, source: e.target.value })}
                                options={[
                                    "Firewall",
                                    "IDS",
                                    "IPS",
                                    "SIEM",
                                    "EDR",
                                    "XDR",
                                    "Antivirus",
                                    "Email Gateway",
                                    "Manual Investigation",
                                ]}
                            />
                        </div>

                        <div className="col-span-2">
                            <ModernInput
                                label="Description"
                                value={eventData.description}
                                onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
                                placeholder="Enter trace description..."
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-slate-800 px-6 py-4 flex justify-end gap-3 bg-slate-950/20">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <PrimaryButton
                        onClick={handleTrigger}
                        disabled={loading}
                        className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white shadow-xl px-6 flex items-center gap-2"
                    >
                        {loading ? "Processing..." : "⚡ Inject Event"}
                    </PrimaryButton>
                </div>
            </div>
        </div>
    );
}

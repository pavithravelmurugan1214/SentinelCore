import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaHistory, FaUserShield, FaClock, FaUndo } from "react-icons/fa";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import AnimatedBackground from "../components/AnimatedBackground";
import PageHeader from "../components/ui/PageHeader";
import GlassCard from "../components/ui/GlassCard";
import api from "../services/api";

const parseTimestamp = (value) => {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;

    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  if (Array.isArray(value)) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = value;
    const parsed = new Date(year, month - 1, day, hour, minute, second);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  return null;
};

const formatTimestamp = (value) => {
  const parsed = parseTimestamp(value);
  return parsed ? parsed.toLocaleString() : "—";
};

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [incidents, setIncidents] = useState([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState("");
  const [selectedLog, setSelectedLog] = useState(null);

  // New filtering states
  const [searchUser, setSearchUser] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const response = await api.get("/incidents");
        setIncidents(response.data || []);
      } catch (err) {
        console.error("Failed to fetch incidents list", err);
      }
    };
    fetchIncidents();
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchLogs = async () => {
      try {
        const response = await api.get("/audit");
        if (!isMounted) return;

        const nextLogs = Array.isArray(response.data) ? response.data : [];
        const sortedLogs = [...nextLogs].sort((left, right) => {
          const leftTime = parseTimestamp(left.timestamp);
          const rightTime = parseTimestamp(right.timestamp);

          if (!leftTime && !rightTime) return 0;
          if (!leftTime) return 1;
          if (!rightTime) return -1;

          return rightTime - leftTime;
        });

        setLogs(sortedLogs);
      } catch (err) {
        console.error("Failed to fetch audit logs", err);
        if (isMounted) {
          setError("Unable to load audit logs from the backend right now.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchLogs();
    const intervalId = window.setInterval(fetchLogs, 10000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const filteredLogs = logs.filter((log) => {
    // Incident filter
    if (selectedIncidentId && log.incident?.id !== Number(selectedIncidentId)) {
      return false;
    }

    // User search filter
    if (searchUser) {
      const uName = String(log.user?.name || "").toLowerCase();
      const uEmail = String(log.user?.email || "").toLowerCase();
      const uUser = String(log.user?.username || "").toLowerCase();
      const sTerm = searchUser.toLowerCase();
      if (!uName.includes(sTerm) && !uEmail.includes(sTerm) && !uUser.includes(sTerm)) {
        if (sTerm === "system" && log.user === null) {
          // Match System
        } else {
          return false;
        }
      }
    }

    // Action filter
    if (filterAction) {
      const act = String(log.action || "").toUpperCase();
      if (filterAction === "CREATE" && !act.includes("CREATE")) return false;
      if (filterAction === "UPDATE" && !act.includes("UPDATE")) return false;
      if (filterAction === "DELETE" && !act.includes("DELETE")) return false;
      if (filterAction === "LOGIN" && act !== "LOGIN") return false;
      if (filterAction === "REGISTER" && act !== "REGISTER") return false;
      if (filterAction === "ROLE_CHANGED" && act !== "ROLE_CHANGED") return false;
      if (filterAction === "PLAYBOOK_STARTED" && act !== "PLAYBOOK_STARTED") return false;
      if (filterAction === "PLAYBOOK_COMPLETED" && act !== "PLAYBOOK_COMPLETED") return false;
      if (filterAction === "HOST_ISOLATED" && act !== "HOST_ISOLATED") return false;
      if (filterAction === "USER_DISABLED" && act !== "USER_DISABLED") return false;
    }

    // Category / Resource filter
    if (filterCategory) {
      const act = String(log.action || "").toUpperCase();
      const desc = String(log.description || "").toUpperCase();

      if (filterCategory === "Incident") {
        const isIncident = log.incident !== null || act.includes("INCIDENT") || act.includes("CREATE") || act.includes("UPDATE") || act.includes("DELETE");
        const isOther = act.includes("USER") || act.includes("VULNERABILITY") || act.includes("ROLE") || act === "LOGIN" || act === "REGISTER" || act.includes("ALERT") || act.includes("THREAT") || act.includes("IOC") || act.includes("REPORT");
        if (!isIncident || isOther) return false;
      }
      if (filterCategory === "Playbook") {
        const isPlaybook = act.includes("PLAYBOOK") || act.includes("ISOLATED") || act.includes("DISABLED") || act.includes("NOTIFICATION") || act.includes("SCAN") || desc.includes("PLAYBOOK");
        if (!isPlaybook) return false;
      }
      if (filterCategory === "User") {
        const isUser = act.includes("USER") || act.includes("ROLE") || act.includes("REGISTER") || act.includes("ROLE_CHANGED");
        if (!isUser) return false;
      }
      if (filterCategory === "Vulnerability") {
        const isVuln = act.includes("VULNERABILITY");
        if (!isVuln) return false;
      }
      if (filterCategory === "Authentication") {
        const isAuth = act === "LOGIN" || act === "REGISTER";
        if (!isAuth) return false;
      }
      if (filterCategory === "Alert") {
        const isAlert = act.includes("ALERT");
        if (!isAlert) return false;
      }
      if (filterCategory === "Threat") {
        const isThreat = act.includes("THREAT");
        if (!isThreat) return false;
      }
      if (filterCategory === "IOC") {
        const isIOC = act.includes("IOC");
        if (!isIOC) return false;
      }
      if (filterCategory === "Report") {
        const isReport = act.includes("REPORT");
        if (!isReport) return false;
      }
    }

    // Date range filter
    if (startDate || endDate) {
      const logDate = parseTimestamp(log.timestamp);
      if (logDate) {
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          if (logDate < start) return false;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (logDate > end) return false;
        }
      } else {
        return false;
      }
    }

    return true;
  });

  return (
    <>
      <Navbar />
      <Sidebar />

      <main className="ml-64 mt-16 min-h-screen bg-slate-950 relative overflow-hidden">
        <AnimatedBackground />

        <div className="relative z-10 p-8">
          <PageHeader
            title="Audit Logs"
            subtitle="Review incident activity, ownership changes, and security events in real time."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <GlassCard className="p-6 border border-cyan-500/20 text-cyan-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Tracked Events</p>
                  <p className="text-3xl font-bold text-white mt-2">{filteredLogs.length}</p>
                </div>
                <FaHistory className="text-2xl" />
              </div>
            </GlassCard>

            <GlassCard className="p-6 border border-emerald-500/20 text-emerald-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Latest Actor</p>
                  <p className="text-3xl font-bold text-white mt-2">{filteredLogs[0]?.user?.username || filteredLogs[0]?.user?.name || "N/A"}</p>
                </div>
                <FaUserShield className="text-2xl" />
              </div>
            </GlassCard>

            <GlassCard className="p-6 border border-violet-500/20 text-violet-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Last Update</p>
                  <p className="text-3xl font-bold text-white mt-2">{formatTimestamp(filteredLogs[0]?.timestamp)}</p>
                </div>
                <FaClock className="text-2xl" />
              </div>
            </GlassCard>
          </div>

          <GlassCard className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">Incident Audit Timeline</h2>
              <p className="text-slate-400 mt-1">Activity tracking details for the system and incidents.</p>
            </div>

            {/* Search & Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-6 p-4 rounded-2xl bg-slate-950/40 border border-slate-850 items-end">
              {/* User search */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Search User</label>
                <input
                  type="text"
                  placeholder="Email, name..."
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:border-cyan-500 outline-none transition"
                />
              </div>

              {/* Action type */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Action Type</label>
                <select
                  value={filterAction}
                  onChange={(e) => setFilterAction(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white outline-none focus:border-cyan-500 transition"
                >
                  <option value="">All Actions</option>
                  <option value="CREATE">CREATE</option>
                  <option value="UPDATE">UPDATE</option>
                  <option value="DELETE">DELETE</option>
                  <option value="LOGIN">LOGIN</option>
                  <option value="REGISTER">REGISTER</option>
                  <option value="ROLE_CHANGED">ROLE_CHANGED</option>
                  <option value="PLAYBOOK_STARTED">PLAYBOOK_STARTED</option>
                  <option value="PLAYBOOK_COMPLETED">PLAYBOOK_COMPLETED</option>
                  <option value="HOST_ISOLATED">HOST_ISOLATED</option>
                  <option value="USER_DISABLED">USER_DISABLED</option>
                </select>
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Category</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white outline-none focus:border-cyan-500 transition"
                >
                  <option value="">All Categories</option>
                  <option value="Incident">Incident Events</option>
                  <option value="Playbook">Playbook Runs</option>
                  <option value="User">User Operations</option>
                  <option value="Vulnerability">Vulnerabilities</option>
                  <option value="Authentication">Authentication</option>
                  <option value="Alert">Alerts &amp; Rules</option>
                  <option value="Threat">Threats</option>
                  <option value="IOC">IOC Indicators</option>
                  <option value="Report">Reports Downloaded</option>
                </select>
              </div>

              {/* Incident selection */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Incident Target</label>
                <select
                  value={selectedIncidentId}
                  onChange={(e) => setSelectedIncidentId(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white outline-none focus:border-cyan-500 transition"
                >
                  <option value="">All Incidents</option>
                  {incidents.map((incident) => (
                    <option key={incident.id} value={incident.id}>
                      #{incident.id} - {incident.title.length > 15 ? incident.title.substring(0, 15) + "..." : incident.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Date */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-slate-400 outline-none focus:border-cyan-500 transition"
                />
              </div>

              {/* End Date */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-slate-400 outline-none focus:border-cyan-500 transition"
                />
              </div>

              {/* Reset Button */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Reset</label>
                <button
                  type="button"
                  onClick={() => {
                    setSearchUser("");
                    setFilterAction("");
                    setFilterCategory("");
                    setSelectedIncidentId("");
                    setStartDate("");
                    setEndDate("");
                  }}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-750 hover:border-cyan-500/50 transition cursor-pointer shadow-sm"
                  title="Clear all filters"
                >
                  <FaUndo className="text-[10px]" /> Reset
                </button>
              </div>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-slate-400">
                Loading audit logs from the backend...
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 text-rose-300">
                {error}
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-slate-400">
                No audit events were returned for this selection.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredLogs.map((log, index) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: index * 0.05 }}
                    onClick={() => setSelectedLog(log)}
                    className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 hover:border-cyan-500/50 hover:bg-slate-800/40 transition-all duration-300 cursor-pointer shadow-lg shadow-black/10"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{log.action || "System Action"}</p>
                        <p className="text-slate-400 mt-1">{log.description || "No description provided."}</p>
                      </div>
                      <div className="text-sm text-slate-400">
                        <p>{log.user?.username || log.user?.name || "System"}</p>
                        <p className="mt-1">{formatTimestamp(log.timestamp)}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </GlassCard>

          {/* Detailed Audit Log Modal */}
          {selectedLog && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900/95 p-6 shadow-2xl relative my-8 max-h-[85vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-850"
              >
                {/* Close X Button */}
                <button
                  onClick={() => setSelectedLog(null)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer text-lg font-bold"
                >
                  &times;
                </button>

                {/* Modal Header */}
                <div className="flex items-center gap-3 mb-6 border-b border-slate-800/80 pb-4">
                  <span className={`font-mono font-bold px-2.5 py-1 rounded text-xs border ${
                    selectedLog.action === "DELETE" ? "bg-rose-500/15 text-rose-300 border-rose-500/25" :
                    selectedLog.action === "CREATE" ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/25" :
                    "bg-amber-500/15 text-amber-300 border-amber-500/25"
                  }`}>
                    {selectedLog.action || "SYSTEM"}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-white">Event Log #{selectedLog.id}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{formatTimestamp(selectedLog.timestamp)}</p>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="space-y-4">
                  {/* Description */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Activity Description</h4>
                    <p className="text-slate-300 text-sm mt-1.5 leading-relaxed bg-slate-950/40 rounded-xl border border-slate-800 p-3 whitespace-pre-wrap break-words">
                      {selectedLog.description || "No description provided."}
                    </p>
                  </div>

                  {/* Actor Details */}
                  <div className="grid grid-cols-2 gap-4 border-t border-slate-800/60 pt-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Triggered By</h4>
                      <p className="text-slate-300 text-sm mt-1 font-semibold">
                        {selectedLog.user?.name || selectedLog.user?.username || "System Engine"}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">User Email</h4>
                      <p className="text-slate-400 text-xs mt-1 truncate">
                        {selectedLog.user?.email || "system@cloudsecurity.local"}
                      </p>
                    </div>
                  </div>

                  {/* Associated Incident Detail */}
                  {selectedLog.incident && (
                    <div className="border-t border-slate-800/60 pt-4">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Linked Incident Details</h4>
                      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono text-slate-400">Incident #{selectedLog.incident.id}</span>
                          <div className="flex gap-2">
                            <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold border ${
                              selectedLog.incident.severity?.toUpperCase() === "CRITICAL" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                              selectedLog.incident.severity?.toUpperCase() === "HIGH" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            }`}>
                              {selectedLog.incident.severity}
                            </span>
                            <span className="rounded bg-violet-500/10 border border-violet-500/20 text-violet-300 px-1.5 py-0.5 text-[10px] font-semibold">
                              {selectedLog.incident.priority}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-white">{selectedLog.incident.title}</p>
                          <p className="text-slate-400 text-xs mt-1 leading-relaxed whitespace-pre-wrap break-words">{selectedLog.incident.description}</p>
                        </div>
                        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/60 text-slate-400">
                          <span>Status: <strong className="text-slate-300 font-semibold">{selectedLog.incident.status}</strong></span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                            selectedLog.incident.escalated ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-slate-800 text-slate-500 border-slate-700/50"
                          }`}>
                            {selectedLog.incident.escalated ? "ESCALATED" : "NORMAL"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setSelectedLog(null)}
                    className="rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-semibold px-4 py-2 text-slate-300 hover:text-white transition-all cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default AuditLogs;

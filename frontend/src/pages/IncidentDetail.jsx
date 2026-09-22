import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowLeft, FaCheckCircle, FaExclamationTriangle, FaClock, FaUser, FaShieldAlt, FaPlus, FaBriefcase, FaUserShield, FaExclamationCircle } from "react-icons/fa";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import AnimatedBackground from "../components/AnimatedBackground";
import GlassCard from "../components/ui/GlassCard";
import PageHeader from "../components/ui/PageHeader";

import incidentService from "../services/incidentService";
import playbookService from "../services/playbookService";

function SlaTimer({ deadline, status }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isBreached, setIsBreached] = useState(false);

  useEffect(() => {
    if (!deadline) {
      setTimeLeft("No SLA Set");
      return;
    }

    const st = String(status || "").toUpperCase();
    if (st === "RESOLVED" || st === "CLOSED") {
      setTimeLeft("Stopped");
      return;
    }

    const calculateTime = () => {
      const now = new Date();
      const target = new Date(deadline);
      const diff = target - now;

      if (diff <= 0) {
        setIsBreached(true);
        setTimeLeft("SLA BREACHED");
        return;
      }

      setIsBreached(false);
      const totalSeconds = Math.floor(diff / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      const pad = (num) => String(num).padStart(2, "0");
      setTimeLeft(`${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [deadline, status]);

  if (!deadline) {
    return <span className="text-slate-500 font-medium">—</span>;
  }

  const st = String(status || "").toUpperCase();
  if (st === "RESOLVED" || st === "CLOSED") {
    return (
      <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
        <FaClock /> SLA Met
      </span>
    );
  }

  if (isBreached) {
    return (
      <span className="inline-flex items-center gap-1 rounded bg-rose-500/10 px-2.5 py-1 text-xs font-black text-rose-400 border border-rose-500/25 animate-pulse">
        <FaClock /> BREACHED
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full">
      <FaClock className="animate-pulse" /> {timeLeft}
    </span>
  );
}

function IncidentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [incident, setIncident] = useState(null);
  const [playbooks, setPlaybooks] = useState([]);
  const [executions, setExecutions] = useState([]);
  const [error, setError] = useState("");
  const [releasedIds, setReleasedIds] = useState(new Set());

  const isNecessaryIncident = (playbookName) => {
    if (!playbookName) return false;
    const name = playbookName.toLowerCase();
    return name.includes("brute force") || name.includes("malware") || name.includes("privilege") || name.includes("phishing") || name.includes("unauthorized") || name.includes("login") || name.includes("location");
  };

  const role = localStorage.getItem("role");
  const canWrite = ["ADMIN", "ANALYST"].includes(role);

  useEffect(() => {
    fetchIncidentDetails();
    const interval = setInterval(fetchIncidentDetails, 3000);
    return () => clearInterval(interval);
  }, [id]);

  const fetchIncidentDetails = async () => {
    try {
      const data = await incidentService.getIncidentById(Number(id));
      setIncident(data);

      const playHistory = await playbookService.getExecutionHistory();
      // Filter executions matching this incident
      const filteredExecs = playHistory.filter((e) => e.incidentId === Number(id));
      setExecutions(filteredExecs);

      const pbTemplates = await playbookService.getPlaybooks();
      setPlaybooks(pbTemplates);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch incident details.");
    }
  };

  const handleResolve = async () => {
    if (!canWrite) return;
    try {
      await incidentService.resolveIncident(Number(id));
      fetchIncidentDetails();
    } catch (err) {
      console.error(err);
      alert("Failed to resolve incident.");
    }
  };

  const handleEscalate = async () => {
    if (!canWrite) return;
    try {
      await incidentService.escalateIncident(Number(id));
      fetchIncidentDetails();
    } catch (err) {
      console.error(err);
      alert("Failed to escalate incident.");
    }
  };

  const handleRunPlaybook = async (pbId) => {
    if (!canWrite) return;
    try {
      await playbookService.triggerPlaybook(pbId, Number(id));
      alert("Playbook triggered successfully!");
      fetchIncidentDetails();
    } catch (err) {
      console.error(err);
      alert("Failed to trigger playbook: " + err.message);
    }
  };

  const getSeverityBadgeClass = (severity) => {
    switch (severity) {
      case "Critical":
        return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
      case "High":
        return "bg-orange-500/10 text-orange-400 border border-orange-500/20";
      case "Medium":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      default:
        return "bg-sky-500/10 text-sky-400 border border-sky-500/20";
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Open":
        return "bg-sky-500/10 text-sky-400 border border-sky-500/20";
      case "Investigating":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      case "Resolved":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      default:
        return "bg-slate-800 text-slate-400 border border-slate-700";
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-950 text-white">
        <FaExclamationCircle className="text-rose-500 text-5xl mb-4" />
        <h3 className="text-xl font-bold">{error}</h3>
        <button onClick={() => navigate("/incidents")} className="mt-4 text-sky-400 hover:underline">
          Back to Incidents
        </button>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <Sidebar />

      <main className="ml-64 mt-16 min-h-screen bg-slate-950 relative overflow-hidden">
        <AnimatedBackground />

        {incident && (
          <div className="relative z-10 p-8 flex flex-col gap-6">
            {/* Back action */}
            <motion.button
              whileHover={{ x: -4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/incidents")}
              className="flex items-center gap-2 text-slate-300 hover:text-white mb-2 text-xs bg-slate-900/80 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 rounded-xl px-4 py-2.5 shadow-lg backdrop-blur-xl transition-all duration-300 outline-none w-max cursor-pointer"
            >
              <FaArrowLeft className="text-sky-400" /> Back to Incidents
            </motion.button>

            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
              <PageHeader
                title={`Incident #${incident.id}: ${incident.title}`}
                subtitle={`Opened via ${incident.source} source channel`}
              />

              <div className="flex items-center gap-3 shrink-0">
                {incident.status !== "Resolved" && incident.status !== "Closed" && canWrite && (
                  <>
                    <button
                      onClick={handleEscalate}
                      className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        incident.escalated
                          ? "bg-slate-900 text-slate-500 border-slate-800 cursor-not-allowed"
                          : "bg-amber-600/10 hover:bg-amber-600 text-amber-400 hover:text-white border-amber-500/20"
                      }`}
                      disabled={incident.escalated}
                    >
                      <FaExclamationTriangle /> {incident.escalated ? "Escalated" : "Escalate"}
                    </button>

                    <button
                      onClick={handleResolve}
                      className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/25 transition cursor-pointer"
                    >
                      <FaCheckCircle /> Resolve Incident
                    </button>
                  </>
                )}

                <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-center shadow-lg">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Escalated</div>
                  <span className={`text-xs font-bold ${incident.escalated ? "text-rose-400" : "text-slate-400"}`}>
                    {incident.escalated ? "YES" : "NO"}
                  </span>
                </div>
              </div>
            </div>

            {/* Core Details and Automation block */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Left Details column */}
              <div className="xl:col-span-2 space-y-6">
                <GlassCard className="p-6 space-y-6">
                  {/* Summary row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div>
                      <div className="text-slate-500 font-bold uppercase tracking-wider mb-1">Status</div>
                      <span className={`px-2.5 py-1 rounded-full font-bold ${getStatusBadgeClass(incident.status)}`}>
                        {incident.status}
                      </span>
                    </div>

                    <div>
                      <div className="text-slate-500 font-bold uppercase tracking-wider mb-1">Severity</div>
                      <span className={`px-2.5 py-1 rounded-full font-bold ${getSeverityBadgeClass(incident.severity)}`}>
                        {incident.severity}
                      </span>
                    </div>

                    <div>
                      <div className="text-slate-500 font-bold uppercase tracking-wider mb-1">Assigned Analyst</div>
                      <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                        <FaUser className="text-slate-500 text-xs" />
                        {incident.assignedToName || "Unassigned"}
                      </div>
                    </div>

                    {incident.assetId && (
                      <div>
                        <div className="text-slate-500 font-bold uppercase tracking-wider mb-1">Associated Asset</div>
                        <div className="flex items-center gap-1.5 font-semibold">
                          <span
                            onClick={() => navigate(`/assets/detail/${incident.assetId}`)}
                            className="cursor-pointer text-cyan-400 hover:text-cyan-300 underline font-bold"
                          >
                            {incident.assetName || "View Asset"}
                          </span>
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="text-slate-500 font-bold uppercase tracking-wider mb-1">SLA Target</div>
                      <SlaTimer deadline={incident.slaDeadline} status={incident.status} />
                    </div>
                  </div>

                  {/* Low Disk Space Statistics Card */}
                  {incident.driveName && (
                    <div className="border-t border-slate-800/80 pt-5 mt-5">
                      <h4 className="text-sm font-bold text-white mb-3 uppercase tracking-wide flex items-center gap-2">
                        💾 Disk Partition Details & Usage
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-950/60 border border-slate-900 rounded-2xl p-5 text-xs font-mono leading-relaxed mb-4">
                        <div>
                          <div className="text-slate-500 font-bold uppercase tracking-wider mb-1">Drive Partition</div>
                          <span className="text-cyan-400 font-bold text-sm bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded">
                            {incident.driveName}
                          </span>
                        </div>
                        <div>
                          <div className="text-slate-500 font-bold uppercase tracking-wider mb-1">Free Space Remaining</div>
                          <span className="text-emerald-400 font-bold text-sm font-mono">
                            {incident.freeSpaceRemaining != null ? `${incident.freeSpaceRemaining.toFixed(2)} GB` : "N/A"}
                          </span>
                        </div>
                        <div>
                          <div className="text-slate-500 font-bold uppercase tracking-wider mb-1">Detection Time</div>
                          <span className="text-slate-300 font-mono">
                            {incident.detectionTime ? new Date(incident.detectionTime).toLocaleString() : "N/A"}
                          </span>
                        </div>
                        <div className="md:col-span-3 border-t border-slate-900 pt-4 mt-2">
                          <div className="text-slate-500 font-bold uppercase tracking-wider mb-2">Partition Usage Percentage</div>
                          <div className="flex items-center gap-3">
                            <div className="w-full bg-slate-900 border border-slate-800 h-4 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  (incident.diskUsagePercentage || 0) >= 90
                                    ? "bg-gradient-to-r from-red-600 to-rose-500"
                                    : (incident.diskUsagePercentage || 0) >= 85
                                    ? "bg-gradient-to-r from-amber-600 to-yellow-500"
                                    : "bg-gradient-to-r from-emerald-600 to-green-500"
                                }`}
                                style={{ width: `${incident.diskUsagePercentage || 0}%` }}
                              />
                            </div>
                            <span className="text-sm font-bold text-white font-mono shrink-0">
                              {incident.diskUsagePercentage != null ? `${incident.diskUsagePercentage.toFixed(1)}%` : "0%"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Asset Details (Visible on Disk Incident) */}
                  {incident.driveName && (
                    <div className="border-t border-slate-800/80 pt-5 mt-5">
                      <h4 className="text-sm font-bold text-white mb-3 uppercase tracking-wide flex items-center gap-2">
                        🖥️ Associated Asset Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-950/60 border border-slate-900 rounded-2xl p-5 text-xs font-mono leading-relaxed mb-4">
                        <div>
                          <div className="text-slate-500 font-bold uppercase tracking-wider mb-1">Asset Name</div>
                          <span className="text-white font-bold">{incident.assetName || "N/A"}</span>
                        </div>
                        <div>
                          <div className="text-slate-500 font-bold uppercase tracking-wider mb-1">Asset IP Address</div>
                          <span className="text-slate-300">{incident.assetIpAddress || "N/A"}</span>
                        </div>
                        <div>
                          <div className="text-slate-500 font-bold uppercase tracking-wider mb-1">Asset Details</div>
                          <span
                            onClick={() => navigate(`/assets/detail/${incident.assetId}`)}
                            className="cursor-pointer text-cyan-400 hover:text-cyan-300 underline font-bold"
                          >
                            Go to Asset Detail Page
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Description Box */}
                  <div className="border-t border-slate-800/80 pt-4">
                    <h4 className="text-sm font-bold text-white mb-2 uppercase tracking-wide">Forensic Details</h4>
                    <div className="bg-slate-950/60 border border-slate-900 p-4 rounded-xl text-slate-300 font-mono text-xs whitespace-pre-wrap leading-relaxed">
                      {incident.description || "No description logs entered."}
                    </div>
                  </div>
                </GlassCard>

                {/* Automation Executions Logs */}
                <GlassCard className="p-6">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <FaShieldAlt className="text-sky-500" /> Playbook Run Log History
                  </h4>

                  {executions.length > 0 ? (
                    <div className="space-y-3">
                      {executions.map((exec) => (
                        <div
                          key={exec.id}
                          className="p-4 bg-slate-950/40 border border-slate-800/80 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3 text-xs"
                        >
                          <div>
                            <div className="font-bold text-white text-sm">
                              Run #{exec.id}: {exec.playbookName}
                            </div>
                            <div className="text-slate-500 mt-1">
                              Status: <span className="text-slate-300 font-bold">{exec.status}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                                <div className="bg-sky-500 h-full" style={{ width: `${exec.progress}%` }} />
                              </div>
                              <span className="font-mono font-bold text-slate-400">{exec.progress}%</span>
                            </div>

                            {isNecessaryIncident(exec.playbookName) && (
                              <button
                                disabled={releasedIds.has(exec.id) || !canWrite}
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  try {
                                    await playbookService.resetSimulation();
                                    setReleasedIds(prev => new Set(prev).add(exec.id));
                                  } catch (err) {
                                    console.error("Release error", err);
                                  }
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all duration-300 outline-none cursor-pointer ${
                                  releasedIds.has(exec.id) || !canWrite
                                    ? "bg-slate-800/80 text-slate-500 border border-slate-700/60 cursor-not-allowed"
                                    : "bg-emerald-500/10 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/20"
                                }`}
                                title={releasedIds.has(exec.id) ? "Block already released" : !canWrite ? "Unauthorized to release block" : "Release IP & User Account Block"}
                              >
                                {releasedIds.has(exec.id) ? "Released" : "Release Block"}
                              </button>
                            )}
                            <button
                              onClick={() => navigate(`/playbooks/executions/${exec.id}`)}
                              className="bg-sky-500/10 hover:bg-sky-500 text-sky-400 hover:text-white border border-sky-500/20 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer whitespace-nowrap"
                            >
                              View Logs
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-xs italic py-4">No playbook containment runs logged for this ticket.</p>
                  )}
                </GlassCard>
              </div>

              {/* Right Manual Trigger panel */}
              <div className="xl:col-span-1">
                <GlassCard className="p-6 flex flex-col gap-4 h-full justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1.5">SOAR Orchestration</h4>
                    <p className="text-slate-500 text-[11px] mb-4 leading-normal">
                      Manually override containment actions. Choose an operational playbook template to deploy against this incident targets.
                    </p>

                    <div className="space-y-3">
                      {playbooks
                        .filter((p) => p.isActive)
                        .map((pb) => (
                          <div
                            key={pb.id}
                            className="p-3 bg-slate-950/40 border border-slate-800/80 hover:border-slate-700/60 rounded-xl flex flex-col gap-2 transition"
                          >
                            <div className="min-w-0">
                              <h5 className="font-bold text-white text-xs">{pb.name}</h5>
                              <p className="text-slate-500 text-[10px] truncate mt-0.5">{pb.description}</p>
                            </div>

                            <button
                              onClick={() => handleRunPlaybook(pb.id)}
                              disabled={!canWrite || incident.status === "Resolved"}
                              className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold transition w-max cursor-pointer ${
                                !canWrite || incident.status === "Resolved"
                                  ? "bg-slate-800 text-slate-600 border border-slate-700/60 cursor-not-allowed"
                                  : "bg-sky-500/10 hover:bg-sky-500 text-sky-400 hover:text-white border border-sky-500/20"
                              }`}
                            >
                              <FaPlus /> Deploy Run
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="border-t border-slate-800 pt-4 mt-6 text-[10px] text-slate-600">
                    Cloud Security orchestration logs system executions independently. Audited operations are irreversible.
                  </div>
                </GlassCard>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

export default IncidentDetail;

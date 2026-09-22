import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowLeft, FaCheckCircle, FaExclamationCircle, FaSpinner, FaTerminal, FaClock, FaUser, FaShieldAlt } from "react-icons/fa";
import { toast } from "react-toastify";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import AnimatedBackground from "../components/AnimatedBackground";
import GlassCard from "../components/ui/GlassCard";
import PageHeader from "../components/ui/PageHeader";

import playbookService from "../services/playbookService";
import incidentService from "../services/incidentService";

const getDurationString = (start, end) => {
  if (!start || !end) return "N/A";
  const diffMs = new Date(end) - new Date(start);
  const diffSecs = Math.floor(diffMs / 1000);
  if (diffSecs < 60) return `${diffSecs} Seconds`;
  const diffMins = Math.round(diffSecs / 60);
  return `${diffMins} Minutes`;
};

function PlaybookExecutionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [execution, setExecution] = useState(null);
  const [playbook, setPlaybook] = useState(null);
  const [logs, setLogs] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const terminalEndRef = useRef(null);



  useEffect(() => {
    // Initial fetch
    fetchDetailsAndLogs();

    // Start polling every 2 seconds for live execution updates
    const interval = setInterval(() => {
      fetchDetailsAndLogs(interval);
    }, 2000);

    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    // Auto-scroll the terminal to bottom when new logs arrive
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  const fetchDetailsAndLogs = async (intervalId = null) => {
    try {
      const details = await playbookService.getExecutionDetails(Number(id));
      const logData = await playbookService.getExecutionLogs(Number(id));

      setExecution(details);
      setLogs(logData);

      if (details.playbookId && !playbook) {
        try {
          const pb = await playbookService.getPlaybookById(details.playbookId);
          setPlaybook(pb);
        } catch (pbErr) {
          console.error("Failed to load playbook details", pbErr);
        }
      }

      // Stop polling when execution reaches final states
      if ((details.status === "SUCCESS" || details.status === "FAILED") && intervalId) {
        clearInterval(intervalId);
      }
    } catch (error) {
      console.error("Failed to fetch execution details/logs", error);
      if (intervalId) clearInterval(intervalId);
    }
  };

  const handleStartPlaybook = async () => {
    setActionLoading(true);
    try {
      const updated = await playbookService.startExecution(Number(id));
      setExecution(updated);
      toast.success("Playbook response started!");
      fetchDetailsAndLogs();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || "Failed to start playbook");
    } finally {
      setActionLoading(false);
    }
  };

  const handleExecuteStep = async (stepOrder) => {
    setActionLoading(true);
    try {
      const updated = await playbookService.executeStep(Number(id), stepOrder);
      setExecution(updated);
      toast.success(`Completed step ${stepOrder}!`);
      fetchDetailsAndLogs();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || "Failed to execute step");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolveIncident = async () => {
    if (!execution || !execution.incidentId) return;
    if (!window.confirm("Are you sure you want to verify cleanup and resolve this incident?")) return;
    setActionLoading(true);
    try {
      await incidentService.resolveIncident(execution.incidentId);
      toast.success("Incident resolved successfully!");
      navigate("/incidents");
    } catch (err) {
      console.error(err);
      toast.error("Failed to resolve incident");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "SUCCESS":
        return <FaCheckCircle className="text-emerald-400 text-xl" />;
      case "FAILED":
        return <FaExclamationCircle className="text-rose-400 text-xl" />;
      case "RUNNING":
        return <FaSpinner className="text-sky-400 text-xl animate-spin" />;
      default:
        return <FaClock className="text-slate-500 text-xl" />;
    }
  };

  const getLogColorClass = (level, status) => {
    if (status === "FAILED") return "text-rose-400 font-bold";
    if (status === "SUCCESS") return "text-emerald-400";
    if (level === "WARN") return "text-yellow-400";
    if (level === "ERROR") return "text-rose-500 font-bold";
    return "text-slate-300";
  };



  return (
    <>
      <Navbar />
      <Sidebar />

      <main className="ml-64 mt-16 min-h-screen bg-slate-950 relative overflow-hidden">
        <AnimatedBackground />

        <div className="relative z-10 p-8">
          {/* Back Action */}
          <motion.button
            whileHover={{ x: -4 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/playbooks")}
            className="flex items-center gap-2 text-slate-300 hover:text-white mb-6 text-xs bg-slate-900/80 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 rounded-xl px-4 py-2.5 shadow-lg backdrop-blur-xl transition-all duration-300 outline-none"
          >
            <FaArrowLeft className="text-sky-400" /> Back to Playbooks
          </motion.button>

          {execution && (
            <>
              <div className="flex justify-between items-center mb-6">
                <PageHeader
                  title={`Run #${execution.id}: ${execution.playbookName}`}
                  subtitle={`Triggered on incident ID: #${execution.incidentId || "N/A"}`}
                />
                <div className="flex items-center gap-4">


                  <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl px-5 py-3 shadow-lg">
                    {getStatusIcon(execution.status)}
                    <div>
                      <div className="text-xs text-slate-500 uppercase font-semibold">Status</div>
                      <div className="text-sm font-bold text-white tracking-wider">{execution.status}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Execution Progress Summary Card */}
              <GlassCard className="p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-sm text-slate-400">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-sky-400">
                      <FaUser />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 font-semibold uppercase">Triggered By</div>
                      <div className="text-white font-bold mt-0.5">{execution.triggeredByName || "System (Automation)"}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-sky-400">
                      <FaShieldAlt />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 font-semibold uppercase">Incident Target</div>
                      <div className="text-white font-bold mt-0.5 truncate max-w-[150px]">
                        {execution.incidentTitle || (execution.incidentId ? `Incident #${execution.incidentId}` : "Manual Direct Run")}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-sky-400">
                      <FaClock />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 font-semibold uppercase">
                        {execution.status === "SUCCESS" || execution.status === "FAILED" ? "Total Duration" : "Execution Start"}
                      </div>
                      <div className="text-white font-mono text-xs mt-1">
                        {execution.status === "SUCCESS" || execution.status === "FAILED"
                          ? getDurationString(execution.startedAt, execution.endedAt)
                          : execution.startedAt ? new Date(execution.startedAt).toLocaleTimeString() : "N/A"}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-500 font-semibold uppercase mb-2">Overall Completion Progress</div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className={`h-full transition-all duration-500 ${
                            execution.status === "FAILED" ? "bg-rose-500" : "bg-gradient-to-r from-sky-500 to-emerald-500"
                          }`}
                          style={{ width: `${execution.progress}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-white text-sm">{execution.progress}%</span>
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* Hacker Terminal Logs and Step Tracking */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Live Console Output Terminal */}
                <div className="xl:col-span-2">
                  <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                    {/* Console Header */}
                    <div className="bg-slate-900 px-6 py-3 border-b border-slate-800 flex justify-between items-center text-xs font-mono text-slate-400">
                      <span className="flex items-center gap-2 text-sky-400 font-bold">
                        <FaTerminal /> CLOUD SECURITY RESPONSE AGENT v1.0.0
                      </span>
                      <span>Logs: {logs.length} entries</span>
                    </div>

                    {/* Console Body */}
                    <div className="p-6 h-[400px] overflow-y-auto font-mono text-xs space-y-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                      {logs.length > 0 ? (
                        logs.map((log) => (
                          <div key={log.id} className="flex gap-4 hover:bg-slate-900/30 py-0.5 rounded transition-colors duration-200">
                            <span className="text-slate-600 select-none">
                              [{new Date(log.timestamp).toLocaleTimeString()}]
                            </span>
                            <span className="text-sky-500 font-semibold min-w-[120px] truncate select-none">
                              [{log.stepName}]
                            </span>
                            <span className={getLogColorClass(log.logLevel, log.status)}>
                              {log.message}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-slate-500 italic py-12 text-center">
                          Initializing execution channel, waiting for stdout streaming...
                        </div>
                      )}
                      <div ref={terminalEndRef} />
                    </div>
                  </div>
                </div>

                <div>
                  <GlassCard className="p-6 h-full flex flex-col justify-between">
                    <div>
                      <div className="mb-5 pb-4 border-b border-slate-800/80">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Playbook Description</h4>
                        {playbook ? (
                          <div className="mt-2 space-y-2">
                            <p className="text-xs text-slate-300 leading-relaxed font-semibold">{playbook.description || "No description provided."}</p>
                            <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500 font-semibold pt-1">
                              <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-850">
                                SLA Est: {playbook.estimatedTime || "30–45 minutes"}
                              </span>
                              <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-850 uppercase">
                                Trigger: {playbook.triggerType}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 mt-2">Loading playbook details...</p>
                        )}
                      </div>

                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Response Steps Checklist</h4>
                      
                      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-850">
                        {playbook && playbook.steps && playbook.steps.length > 0 ? (
                          playbook.steps.map((step) => {
                            const stepNum = step.stepOrder;
                            const isActive = execution.status === "RUNNING" && execution.currentStepIndex + 1 === stepNum;
                            const isCompleted = execution.status === "SUCCESS" || stepNum <= execution.currentStepIndex;
                            const isFailed = execution.status === "FAILED" && execution.currentStepIndex === stepNum;

                            let badgeStyle = "bg-slate-950 text-slate-600 border border-slate-850";
                            let icon = stepNum;
                            let cardStyle = "bg-slate-900/10 border-slate-850/60 opacity-60";

                            if (isCompleted) {
                              badgeStyle = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
                              icon = "✓";
                              cardStyle = "bg-slate-900/30 border-slate-850";
                            } else if (isFailed) {
                              badgeStyle = "bg-rose-500/10 text-rose-400 border border-rose-500/20";
                              icon = "✗";
                              cardStyle = "bg-rose-950/5 border-rose-500/10";
                            } else if (isActive) {
                              badgeStyle = "bg-sky-500/20 text-sky-400 border border-sky-500/30 animate-pulse";
                              cardStyle = "bg-sky-950/10 border-sky-500/20 shadow-md shadow-sky-500/5";
                            }

                            return (
                              <div key={step.id} className={`p-3.5 rounded-2xl border transition-all duration-300 ${cardStyle}`}>
                                <div className="flex items-center gap-3">
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 ${badgeStyle}`}>
                                    {icon}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className={`text-xs font-semibold ${isActive ? "text-sky-400" : isCompleted ? "text-slate-300" : "text-slate-500"}`}>
                                      {step.name}
                                    </div>
                                    {step.actionType !== "MANUAL" && (
                                      <span className="inline-block mt-1 text-[8px] font-mono text-slate-500 uppercase">
                                        Auto: {step.actionType}
                                      </span>
                                    )}
                                  </div>
                                  {isActive && (
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      disabled={actionLoading}
                                      onClick={() => handleExecuteStep(stepNum)}
                                      className="text-[10px] font-bold bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white px-3 py-1.5 rounded-lg shadow-lg shadow-sky-500/15 cursor-pointer disabled:opacity-40"
                                    >
                                      {actionLoading ? "..." : step.actionType === "MANUAL" ? "Complete" : "Execute"}
                                    </motion.button>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center py-4 text-xs text-slate-500 italic">
                            No response steps configured.
                          </div>
                        )}

                        {execution.status === "PENDING" && (
                          <div className="mt-4 p-4 bg-slate-950/60 rounded-2xl border border-slate-850 text-center space-y-3">
                            <p className="text-[11px] text-slate-400">Playbook is queued and waiting to begin response actions.</p>
                            <motion.button
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              disabled={actionLoading}
                              onClick={handleStartPlaybook}
                              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/10 cursor-pointer"
                            >
                              {actionLoading ? "Starting..." : "Start Playbook Response"}
                            </motion.button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-8 pt-4 border-t border-slate-800 text-slate-500 text-[10px]">
                      {execution.status === "SUCCESS" ? (
                        <div className="space-y-3">
                          <p className="text-emerald-400 font-bold text-xs flex items-center gap-1.5">
                            ✓ Playbook response successful!
                          </p>
                          {execution.incidentId && (
                            <motion.button
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              disabled={actionLoading}
                              onClick={handleResolveIncident}
                              className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-teal-500/10 text-xs cursor-pointer"
                            >
                              Verify & Resolve Incident
                            </motion.button>
                          )}
                        </div>
                      ) : (
                        "Halt capability is disabled during automated script containment sequences."
                      )}
                    </div>
                  </GlassCard>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}

export default PlaybookExecutionDetail;

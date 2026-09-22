

import AlertAnalysisModal from "../components/AlertAnalysisModal";
import AddAlertModal from "../components/AddAlertModal";
import { analyzeAlert } from "../services/alertAIService";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaPlus } from "react-icons/fa";

import api from "../services/api";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import AnimatedBackground from "../components/AnimatedBackground";

import GlassCard from "../components/ui/GlassCard";
import PageHeader from "../components/ui/PageHeader";
import TableContainer from "../components/ui/TableContainer";
import PrimaryButton from "../components/ui/PrimaryButton";

function AlertList() {

    const navigate = useNavigate();

    const [alerts, setAlerts] = useState([]);
    const [search, setSearch] = useState("");
    const [analysisOpen, setAnalysisOpen] = useState(false);
    const [analysis, setAnalysis] = useState("");
    const [loadingAnalysis, setLoadingAnalysis] = useState(false);
    const [severityFilter, setSeverityFilter] = useState("All");
    const [sortBy, setSortBy] = useState("id");
    const [sortOrder, setSortOrder] = useState("desc");
    const [addModalOpen, setAddModalOpen] = useState(false);

    const role = localStorage.getItem("role");
    const isAdmin = role === "ADMIN";
    const canEdit = role === "ADMIN" || role === "ANALYST";

    useEffect(() => {
        fetchAlerts();
        const interval = setInterval(fetchAlerts, 4000);
        return () => clearInterval(interval);
    }, []);

    const fetchAlerts = async () => {

        try {
            const response = await api.get("/alerts");
            setAlerts(response.data);
        } catch (error) {
            console.log(error);
        }

    };

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(field);
            setSortOrder("desc");
        }
    };

    const deleteAlert = async (id) => {

        if (!window.confirm("Delete this alert?"))
            return;

        try {

            await api.delete(`/alerts/${id}`);
            fetchAlerts();

        } catch (error) {

            console.log(error);
            alert("Failed to Delete Alert");

        }

    };

    const changeStatus = async (id, status) => {

        try {

            await api.put(`/alerts/${id}/status?status=${status}`);
            fetchAlerts();

        } catch (error) {

            console.log(error);
            alert("Failed to update status");

        }

    };

    const severityWeight = {
        "Critical": 4,
        "High": 3,
        "Medium": 2,
        "Low": 1
    };

    const filteredAlerts = alerts
        .filter((alert) => {

            const matchesSearch =
                (alert.title || "").toLowerCase().includes(search.toLowerCase()) ||
                (alert.source || "").toLowerCase().includes(search.toLowerCase()) ||
                String(alert.id).includes(search);

            const matchesSeverity =
                severityFilter === "All" ||
                alert.severity === severityFilter;

            return matchesSearch && matchesSeverity;

        })
        .sort((a, b) => {
            if (sortBy === "id") {
                return sortOrder === "asc" ? a.id - b.id : b.id - a.id;
            }
            if (sortBy === "severity") {
                const wA = severityWeight[a.severity] || 0;
                const wB = severityWeight[b.severity] || 0;
                return sortOrder === "asc" ? wA - wB : wB - wA;
            }
            if (sortBy === "occurrenceCount") {
                const cA = a.occurrenceCount || 0;
                const cB = b.occurrenceCount || 0;
                return sortOrder === "asc" ? cA - cB : cB - cA;
            }
            if (sortBy === "lastOccurred") {
                const tA = a.lastOccurred ? new Date(a.lastOccurred).getTime() : 0;
                const tB = b.lastOccurred ? new Date(b.lastOccurred).getTime() : 0;
                return sortOrder === "asc" ? tA - tB : tB - tA;
            }
            if (sortBy === "title") {
                return sortOrder === "asc"
                    ? (a.title || "").localeCompare(b.title || "")
                    : (b.title || "").localeCompare(a.title || "");
            }
            if (sortBy === "status") {
                return sortOrder === "asc"
                    ? (a.status || "").localeCompare(b.status || "")
                    : (b.status || "").localeCompare(a.status || "");
            }
            if (sortBy === "source") {
                return sortOrder === "asc"
                    ? (a.source || "").localeCompare(b.source || "")
                    : (b.source || "").localeCompare(a.source || "");
            }
            return b.id - a.id;
        });

    const getSeverityBadge = (severity) => {

        switch (severity) {

            case "Critical":
                return "bg-red-500/20 text-red-400 border border-red-500/30";

            case "High":
                return "bg-orange-500/20 text-orange-400 border border-orange-500/30";

            case "Medium":
                return "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30";

            case "Low":
                return "bg-green-500/20 text-green-400 border border-green-500/30";

            default:
                return "bg-slate-700 text-white";

        }

    };

    const getStatusBadge = (status) => {

        switch (status) {

            case "Open":
                return "bg-red-500/20 text-red-400";

            case "Acknowledged":
                return "bg-yellow-500/20 text-yellow-300";

            case "Resolved":
                return "bg-green-500/20 text-green-400";

            default:
                return "bg-slate-700 text-white";

        }

    };

    const analyzeWithAI = async (alert) => {

    setAnalysisOpen(true);
    setLoadingAnalysis(true);
    setAnalysis("");

    try {

        const result = await analyzeAlert(alert);

        setAnalysis(result.analysis);

    } catch (err) {

        setAnalysis("Failed to analyze alert.");

    }

    setLoadingAnalysis(false);

};

    return (
        <>
            <Navbar />
            <Sidebar />

            <main className="ml-64 mt-16 min-h-screen bg-slate-950 relative overflow-hidden">

                <AnimatedBackground />

                <div className="relative z-10 p-8">

                    <PageHeader
                        title="Alert Management"
                        subtitle="Monitor and manage security alerts"
                    >
                        {canEdit && (
                            <PrimaryButton
                                onClick={() => setAddModalOpen(true)}
                                className="bg-sky-600 hover:bg-sky-500 text-white flex items-center gap-2 shadow-lg shadow-sky-500/20"
                            >
                                <FaPlus className="text-sm" /> Add Alert
                            </PrimaryButton>
                        )}
                    </PageHeader>

                    <GlassCard className="p-6 mb-8">

                        <div className="flex flex-col lg:flex-row gap-4 items-center">

                            <input
                                type="text"
                                placeholder="🔍 Search by ID, Title, or Source..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="
                                    flex-1
                                    w-full
                                    bg-slate-800
                                    border
                                    border-slate-700
                                    rounded-xl
                                    px-5
                                    py-3
                                    text-white
                                    placeholder:text-slate-500
                                    focus:border-cyan-400
                                    focus:ring-2
                                    focus:ring-cyan-500/30
                                    outline-none
                                "
                            />

                            <select
                                value={severityFilter}
                                onChange={(e) => setSeverityFilter(e.target.value)}
                                className="
                                    w-full
                                    lg:w-48
                                    bg-slate-800
                                    border
                                    border-slate-700
                                    rounded-xl
                                    px-4
                                    py-3
                                    text-white
                                    focus:border-cyan-400
                                    outline-none
                                "
                            >
                                <option value="All">All Severity</option>
                                <option value="Critical">Critical</option>
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>

                            <div className="flex items-center gap-2 w-full lg:w-auto">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="
                                        w-full
                                        lg:w-48
                                        bg-slate-800
                                        border
                                        border-slate-700
                                        rounded-xl
                                        px-4
                                        py-3
                                        text-white
                                        focus:border-cyan-400
                                        outline-none
                                    "
                                >
                                    <option value="id">Sort by ID</option>
                                    <option value="severity">Sort by Severity</option>
                                    <option value="occurrenceCount">Sort by Count</option>
                                    <option value="lastOccurred">Sort by Last Occurred</option>
                                    <option value="title">Sort by Title</option>
                                    <option value="status">Sort by Status</option>
                                </select>

                                <button
                                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                                    title={sortOrder === "asc" ? "Ascending (Lowest to Highest)" : "Descending (Highest to Lowest)"}
                                    className="
                                        px-4
                                        py-3
                                        bg-slate-800
                                        hover:bg-slate-700
                                        border
                                        border-slate-700
                                        rounded-xl
                                        text-cyan-400
                                        font-semibold
                                        text-sm
                                        flex
                                        items-center
                                        gap-1.5
                                        transition
                                        whitespace-nowrap
                                    "
                                >
                                    {sortOrder === "desc" ? "⬇ Newest / High" : "⬆ Oldest / Low"}
                                </button>
                            </div>

                        </div>

                    </GlassCard>

                    <TableContainer>

                        <table className="w-full">

                            <thead className="bg-slate-950 text-slate-300 uppercase tracking-wider text-xs">

                                <tr>

                                    <th
                                        onClick={() => handleSort("id")}
                                        className="p-4 cursor-pointer hover:text-cyan-400 transition select-none"
                                    >
                                        ID {sortBy === "id" && (sortOrder === "asc" ? "▲" : "▼")}
                                    </th>
                                    <th
                                        onClick={() => handleSort("title")}
                                        className="p-4 cursor-pointer hover:text-cyan-400 transition select-none"
                                    >
                                        Title {sortBy === "title" && (sortOrder === "asc" ? "▲" : "▼")}
                                    </th>
                                    <th
                                        onClick={() => handleSort("severity")}
                                        className="p-4 cursor-pointer hover:text-cyan-400 transition select-none"
                                    >
                                        Severity {sortBy === "severity" && (sortOrder === "asc" ? "▲" : "▼")}
                                    </th>
                                    <th
                                        onClick={() => handleSort("source")}
                                        className="p-4 cursor-pointer hover:text-cyan-400 transition select-none"
                                    >
                                        Source {sortBy === "source" && (sortOrder === "asc" ? "▲" : "▼")}
                                    </th>
                                    <th
                                        onClick={() => handleSort("status")}
                                        className="p-4 cursor-pointer hover:text-cyan-400 transition select-none"
                                    >
                                        Status {sortBy === "status" && (sortOrder === "asc" ? "▲" : "▼")}
                                    </th>
                                    <th
                                        onClick={() => handleSort("occurrenceCount")}
                                        className="p-4 cursor-pointer hover:text-cyan-400 transition select-none"
                                    >
                                        Count {sortBy === "occurrenceCount" && (sortOrder === "asc" ? "▲" : "▼")}
                                    </th>
                                    <th
                                        onClick={() => handleSort("lastOccurred")}
                                        className="p-4 cursor-pointer hover:text-cyan-400 transition select-none"
                                    >
                                        Last Occurred {sortBy === "lastOccurred" && (sortOrder === "asc" ? "▲" : "▼")}
                                    </th>
                                    <th className="p-4">Description</th>

                                    {canEdit && (
                                        <th className="p-4 w-80">
                                            Actions
                                        </th>
                                    )}

                                </tr>

                            </thead>

                            <tbody>

                                {filteredAlerts.length > 0 ? (

                                    filteredAlerts.map((alert, index) => (

                                        <motion.tr
                                            key={alert.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{
                                                delay: index * 0.03,
                                            }}
                                            className="
                                                border-b
                                                border-slate-800
                                                text-center
                                                text-slate-300
                                                hover:bg-slate-800/40
                                                transition-all
                                                duration-300
                                            "
                                        >

                                            <td className="p-4">
                                                <span className="px-2.5 py-1 rounded-md bg-cyan-950/60 border border-cyan-500/30 font-mono text-xs font-bold text-cyan-300 shadow-sm">
                                                    #{alert.id}
                                                </span>
                                            </td>

                                            <td className="p-4 font-semibold text-white">
                                                {alert.asset ? (
                                                    <span
                                                        onClick={() => navigate(`/assets/detail/${alert.asset.id}`)}
                                                        className="cursor-pointer text-cyan-400 hover:text-cyan-300 hover:underline"
                                                    >
                                                        {alert.title}
                                                    </span>
                                                ) : (
                                                    alert.title
                                                )}
                                            </td>

                                            <td className="p-4">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-sm font-semibold ${getSeverityBadge(alert.severity)}`}
                                                >
                                                    {alert.severity}
                                                </span>
                                            </td>

                                            <td className="p-4">
                                                {alert.source}
                                            </td>

                                            <td className="p-4">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(alert.status)}`}
                                                >
                                                    {alert.status}
                                                </span>
                                            </td>

                                            <td className="p-4 font-semibold text-cyan-400">
                                                {alert.occurrenceCount}
                                            </td>

                                            <td className="p-4 text-sm">
                                                {alert.lastOccurred
                                                    ? new Date(alert.lastOccurred).toLocaleString()
                                                    : "-"}
                                            </td>

                                            <td className="p-4 max-w-xs truncate">
                                                {alert.description}
                                            </td>

                                            {canEdit && (
                                                <td className="p-4 whitespace-nowrap">                                                    {alert.status === "Open" && (
                                                        <button
                                                            onClick={() =>
                                                                changeStatus(
                                                                    alert.id,
                                                                    "Acknowledged"
                                                                )
                                                            }
                                                            className="px-3 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white mr-2"
                                                        >
                                                            Acknowledge
                                                        </button>
                                                    )}

                                                    {alert.status ===
                                                        "Acknowledged" && (
                                                        <button
                                                            onClick={() =>
                                                                changeStatus(
                                                                    alert.id,
                                                                    "Resolved"
                                                                )
                                                            }
                                                            className="px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white mr-2"
                                                        >
                                                            Resolve
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() =>
                                                            navigate(
                                                                `/edit-alert/${alert.id}`
                                                            )
                                                        }
                                                        className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white mr-2"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => analyzeWithAI(alert)}
                                                        className="px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white mr-2 transition-all duration-200"
                                                    >
                                                        🤖 Analyze
                                                    </button>

                                                    {isAdmin && (
                                                        <button
                                                            onClick={() =>
                                                                deleteAlert(
                                                                    alert.id
                                                                )
                                                            }
                                                            className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white"
                                                        >
                                                            Delete
                                                        </button>
                                                    )}
                                                </td>
                                            )}

                                        </motion.tr>

                                    ))

                                ) : (

                                    <tr>

                                        <td
                                            colSpan={
                                                canEdit ? 9 : 8
                                            }
                                            className="py-12 text-center text-slate-500"
                                        >
                                            No Alerts Found
                                        </td>

                                    </tr>

                                )}

                            </tbody>

                        </table>

                    </TableContainer>

                </div>
                <AlertAnalysisModal
                    open={analysisOpen}
                    onClose={() => setAnalysisOpen(false)}
                    analysis={analysis}
                    loading={loadingAnalysis}
                />
                <AddAlertModal
                    open={addModalOpen}
                    onClose={() => setAddModalOpen(false)}
                    onSuccess={fetchAlerts}
                />

            </main>

        </>
    );

}

export default AlertList;
                                                
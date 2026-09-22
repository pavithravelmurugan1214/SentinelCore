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
import AddIOCModal from "../components/AddIOCModal";

function IOCList() {

    const navigate = useNavigate();

    const role = localStorage.getItem("role");
    const canEdit = role === "ADMIN" || role === "ANALYST";

    const [iocs, setIOCs] = useState([]);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [riskFilter, setRiskFilter] = useState("All");

    useEffect(() => {
        fetchIOCs();
    }, []);

    const fetchIOCs = async () => {

        try {

            const response = await api.get("/ioc");

            setIOCs(response.data);

        } catch (error) {

            console.log(error);

        }

    };

    const deleteIOC = async (id) => {

        if (!window.confirm("Delete this IOC?")) return;

        try {

            await api.delete(`/ioc/${id}`);

            fetchIOCs();

        } catch (error) {

            console.log(error);

            alert("Failed to Delete IOC");

        }

    };

    const filteredIOCs = (iocs || []).filter((ioc) => {
        if (!ioc) return false;

        const typeStr = (ioc.type || "").toLowerCase();
        const valueStr = (ioc.value || "").toLowerCase();
        const searchLower = (search || "").toLowerCase();

        const matchesSearch =
            typeStr.includes(searchLower) ||
            valueStr.includes(searchLower);

        const matchesRisk =
            riskFilter === "All" ||
            ioc.riskLevel === riskFilter;

        return matchesSearch && matchesRisk;
    });

    const getRiskBadge = (risk) => {

        switch (risk) {

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

            case "Active":
                return "bg-green-500/20 text-green-400";

            case "Blocked":
                return "bg-red-500/20 text-red-400";

            case "Investigating":
                return "bg-yellow-500/20 text-yellow-300";

            default:
                return "bg-slate-700 text-white";

        }

    };

    return (<>
    <Navbar />
    <Sidebar />

    <main className="ml-64 mt-16 min-h-screen bg-slate-950 relative overflow-hidden">

        <AnimatedBackground />

        <div className="relative z-10 p-8">

            <PageHeader
                title="IOC Management"
                subtitle="Manage Indicators of Compromise"
            >
                {canEdit && (
                    <PrimaryButton
                        onClick={() => setAddModalOpen(true)}
                        className="bg-sky-600 hover:bg-sky-500 text-white flex items-center gap-2 shadow-lg shadow-sky-500/20"
                    >
                        <FaPlus className="text-sm" /> Add IOC
                    </PrimaryButton>
                )}
            </PageHeader>

            {/* Search & Filter */}

            <GlassCard className="p-6 mb-8">

                <div className="flex flex-col lg:flex-row gap-5">

                    <input
                        type="text"
                        placeholder="🔍 Search IOC..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="
                            flex-1
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
                        value={riskFilter}
                        onChange={(e) => setRiskFilter(e.target.value)}
                        className="
                            w-full
                            lg:w-60
                            bg-slate-800
                            border
                            border-slate-700
                            rounded-xl
                            px-5
                            py-3
                            text-white
                            focus:border-cyan-400
                            outline-none
                        "
                    >
                        <option value="All">All Risk</option>
                        <option value="Critical">Critical</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>

                </div>

            </GlassCard>

            {/* IOC Table */}

            <TableContainer>

                <table className="w-full">

                    <thead className="bg-slate-950 text-slate-300 uppercase tracking-wider">

                        <tr>

                            <th className="p-4">ID</th>
                            <th className="p-4">Type</th>
                            <th className="p-4">Value</th>
                            <th className="p-4">Risk</th>
                            <th className="p-4">Source</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Action</th>

                        </tr>

                    </thead>

                    <tbody>

                        {filteredIOCs.length > 0 ? (

                            filteredIOCs.map((ioc, index) => (

                                <motion.tr

                                    key={ioc.id}

                                    initial={{
                                        opacity: 0,
                                        y: 20,
                                    }}

                                    animate={{
                                        opacity: 1,
                                        y: 0,
                                    }}

                                    transition={{
                                        delay: index * 0.05,
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
                                        {ioc.id}
                                    </td>

                                    <td className="p-4 font-semibold text-white">
                                        {ioc.type}
                                    </td>

                                    <td className="p-4 break-all">
                                        {ioc.value}
                                    </td>

                                    <td className="p-4">

                                        <span
                                            className={`px-3 py-1 rounded-full text-sm font-semibold ${getRiskBadge(
                                                ioc.riskLevel
                                            )}`}
                                        >
                                            {ioc.riskLevel}
                                        </span>

                                    </td>

                                    <td className="p-4">
                                        {ioc.source}
                                    </td>

                                    <td className="p-4">

                                        <span
                                            className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(
                                                ioc.status
                                            )}`}
                                        >
                                            {ioc.status}
                                        </span>

                                    </td>

                                    <td className="p-4">

                                        <button
                                            onClick={() =>
                                                navigate(`/edit-ioc/${ioc.id}`)
                                            }
                                            className="
                                                px-4
                                                py-2
                                                rounded-xl
                                                bg-gradient-to-r
                                                from-blue-600
                                                to-cyan-500
                                                text-white
                                                mr-3
                                                hover:scale-105
                                                transition
                                            "
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() => deleteIOC(ioc.id)}
                                            className="
                                                px-4
                                                py-2
                                                rounded-xl
                                                bg-gradient-to-r
                                                from-red-600
                                                to-red-500
                                                text-white
                                                hover:scale-105
                                                transition
                                            "
                                        >
                                            Delete
                                        </button>

                                    </td>

                                </motion.tr>

                            ))

                        ) : (

                            <tr>

                                <td
                                    colSpan="7"
                                    className="py-12 text-center text-slate-500"
                                >
                                    No IOC Found
                                </td>

                            </tr>

                        )}

                    </tbody>

                </table>

            </TableContainer>

            <AddIOCModal
                open={addModalOpen}
                onClose={() => setAddModalOpen(false)}
                onSuccess={fetchIOCs}
            />
        </div>

    </main>

</>
);

}

export default IOCList;
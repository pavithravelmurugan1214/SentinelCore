import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaPlus } from "react-icons/fa";

import api from "../services/api";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import AnimatedBackground from "../components/AnimatedBackground";

import GlassCard from "../components/ui/GlassCard";
import PageHeader from "../components/ui/PageHeader";
import PrimaryButton from "../components/ui/PrimaryButton";
import TableContainer from "../components/ui/TableContainer";
import AddThreatModal from "../components/AddThreatModal";

function ThreatList() {

    const navigate = useNavigate();

    const role = localStorage.getItem("role");
    const canEdit = role === "ADMIN" || role === "ANALYST";

    const [threats, setThreats] = useState([]);
    const [addModalOpen, setAddModalOpen] = useState(false);

    const [search, setSearch] = useState("");

    const [severityFilter, setSeverityFilter] = useState("All");

    useEffect(() => {

        fetchThreats();

    }, []);

    const fetchThreats = async () => {

        try {

            const response = await api.get("/threats");

            setThreats(response.data);

        } catch (error) {

            console.log(error);

        }

    };

    // ---------------- PDF ----------------

    const exportPdf = async () => {

        try {

            const response = await api.get(

                "/reports/threats/pdf",

                {

                    responseType: "blob",

                }

            );

            const url = window.URL.createObjectURL(

                new Blob([response.data])

            );

            const link = document.createElement("a");

            link.href = url;

            link.download = "Cloud_Security_Threat_Report.pdf";

            link.click();

        } catch {

            alert("Failed to Download PDF");

        }

    };

    // ---------------- Excel ----------------

    const exportExcel = async () => {

        try {

            const response = await api.get(

                "/reports/threats/excel",

                {

                    responseType: "blob",

                }

            );

            const url = window.URL.createObjectURL(

                new Blob([response.data])

            );

            const link = document.createElement("a");

            link.href = url;

            link.download = "Cloud_Security_Threat_Report.xlsx";

            link.click();

        } catch {

            alert("Failed to Download Excel");

        }

    };

    // ---------------- Delete ----------------

    const deleteThreat = async (id) => {

        if (!window.confirm("Delete this threat?"))

            return;

        try {

            await api.delete(`/threats/${id}`);

            fetchThreats();

        } catch {

            alert("Failed to delete");

        }

    };

    // ---------------- Severity Badge ----------------

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

    // ---------------- Status Badge ----------------

    const getStatusBadge = (status) => {

        switch (status) {

            case "Open":

                return "bg-blue-500/20 text-blue-400";

            case "Resolved":

                return "bg-green-500/20 text-green-400";

            case "In Progress":

                return "bg-yellow-500/20 text-yellow-300";

            default:

                return "bg-slate-700 text-white";

        }

    };

    // ---------------- Search ----------------

    const filteredThreats = threats.filter((threat) => {

        const matchesSearch = threat.title

            .toLowerCase()

            .includes(search.toLowerCase());

        const matchesSeverity =

            severityFilter === "All" ||

            threat.severity === severityFilter;

        return matchesSearch && matchesSeverity;

    });

    return (<>
  <Navbar />
  <Sidebar />

  <main className="ml-64 mt-16 min-h-screen bg-slate-950 relative overflow-hidden">

    <AnimatedBackground />

    <div className="relative z-10 p-8">

      <PageHeader
        title="Threat Management"
        subtitle="Monitor, search and manage cyber threats"
      >
        <div className="flex gap-4">
          {role === "ADMIN" && (
            <>
              <PrimaryButton
                onClick={exportPdf}
                className="bg-gradient-to-r from-red-600 to-red-500 text-white"
              >
                📄 Export PDF
              </PrimaryButton>

              <PrimaryButton
                onClick={exportExcel}
                className="bg-gradient-to-r from-green-600 to-green-500 text-white"
              >
                📊 Export Excel
              </PrimaryButton>
            </>
          )}

          {canEdit && (
            <PrimaryButton
              onClick={() => setAddModalOpen(true)}
              className="bg-sky-600 hover:bg-sky-500 text-white flex items-center gap-2 shadow-lg shadow-sky-500/20"
            >
              <FaPlus className="text-sm" /> Add Threat
            </PrimaryButton>
          )}
        </div>
      </PageHeader>

      {/* Search */}

      <GlassCard className="p-6 mb-8">

        <div className="flex flex-col lg:flex-row gap-5">

          <input
            type="text"
            placeholder="🔍 Search Threat..."
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
              outline-none
              transition
            "
          />

          <select
            value={severityFilter}
            onChange={(e) =>
              setSeverityFilter(e.target.value)
            }
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
              outline-none
              focus:border-cyan-400
            "
          >

            <option value="All">All Severity</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>

          </select>

        </div>

      </GlassCard>

      {/* Table */}

      <TableContainer>

        <table className="w-full">

          <thead className="bg-slate-950 text-slate-300 uppercase tracking-wider">

            <tr>

              <th className="p-4">ID</th>
              <th className="p-4">Title</th>
              <th className="p-4">Severity</th>
              <th className="p-4">Source</th>
              <th className="p-4">Status</th>

              {role === "ADMIN" && (

                <th className="p-4">
                  Actions
                </th>

              )}

            </tr>

          </thead>

          <tbody>

            {filteredThreats.length > 0 ? (

              filteredThreats.map((threat, index) => (

                <motion.tr

                  key={threat.id}

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
                    hover:bg-slate-800/50
                    transition-all
                    duration-300
                  "
                >

                  <td className="p-4">
                    {threat.id}
                  </td>

                  <td className="p-4 font-semibold text-white">
                    {threat.title}
                  </td>

                  <td className="p-4">

                    <span
                      className={`px-4 py-1 rounded-full text-sm font-semibold ${getSeverityBadge(
                        threat.severity
                      )}`}
                    >
                      {threat.severity}
                    </span>

                  </td>

                  <td className="p-4">
                    {threat.source}
                  </td>

                  <td className="p-4">

                    <span
                      className={`px-4 py-1 rounded-full text-sm font-semibold ${getStatusBadge(
                        threat.status
                      )}`}
                    >
                      {threat.status}
                    </span>

                  </td>

                  {role === "ADMIN" && (

                    <td className="p-4">

                      <button
                        onClick={() =>
                          navigate(
                            `/edit-threat/${threat.id}`
                          )
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
                        onClick={() =>
                          deleteThreat(threat.id)
                        }
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

                  )}

                </motion.tr>

              ))

            ) : (

              <tr>

                <td
                  colSpan={role === "ADMIN" ? 6 : 5}
                  className="text-center py-12 text-slate-500"
                >

                  No Threats Found

                </td>

              </tr>

            )}

          </tbody>

        </table>

      </TableContainer>

      <AddThreatModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={fetchThreats}
      />
    </div>

  </main>

</>
);
}

export default ThreatList;
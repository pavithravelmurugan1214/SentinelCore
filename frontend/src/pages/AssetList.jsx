import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  FaPlus,
  FaSearch,
  FaSync,
  FaDownload,
  FaUpload,
  FaTrash,
  FaEdit,
  FaEye,
  FaSortUp,
  FaSortDown,
  FaServer,
  FaFilter,
} from "react-icons/fa";

import assetService from "../services/assetService";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import AnimatedBackground from "../components/AnimatedBackground";

import GlassCard from "../components/ui/GlassCard";
import PageHeader from "../components/ui/PageHeader";
import PrimaryButton from "../components/ui/PrimaryButton";
import TableContainer from "../components/ui/TableContainer";

function AssetList() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // User auth details
  const role = localStorage.getItem("role") || "VIEWER";
  const isWritable = role === "ADMIN" || role === "ANALYST";

  // Data state
  const [assets, setAssets] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);

  // Filter and pagination params
  const [searchHostname, setSearchHostname] = useState("");
  const [searchOwner, setSearchOwner] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterCriticality, setFilterCriticality] = useState("ALL");
  const [filterPatchStatus, setFilterPatchStatus] = useState("ALL");

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sortBy, setSortBy] = useState("id");
  const [direction, setDirection] = useState("desc");

  // Delete dialog state
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size,
        sortBy,
        direction,
        hostname: searchHostname || undefined,
        owner: searchOwner || undefined,
        status: filterStatus === "ALL" ? undefined : filterStatus,
        criticality: filterCriticality === "ALL" ? undefined : filterCriticality,
        patchStatus: filterPatchStatus === "ALL" ? undefined : filterPatchStatus,
      };

      const response = await assetService.getAssets(params);
      setAssets(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load asset list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [page, size, sortBy, direction]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    fetchAssets();
  };

  const handleResetFilters = () => {
    setSearchHostname("");
    setSearchOwner("");
    setFilterStatus("ALL");
    setFilterCriticality("ALL");
    setFilterPatchStatus("ALL");
    setPage(0);
    // Timeout to allow state to batch
    setTimeout(fetchAssets, 50);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setDirection(direction === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setDirection("asc");
    }
    setPage(0);
  };

  const handleExportCsv = async () => {
    try {
      const blob = await assetService.exportAssets();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "cloud_security_asset_inventory.csv");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success("CSV report downloaded successfully!");
    } catch (error) {
      console.error(error);
      toast.error("CSV Export failed.");
    }
  };

  const handleImportCsv = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset file input value so same file can be uploaded again
    e.target.value = "";

    const loadingToastId = toast.loading("Uploading CSV...");
    try {
      const result = await assetService.importAssets(file);
      toast.update(loadingToastId, {
        render: result.message || "CSV Imported successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
      setPage(0);
      fetchAssets();
    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.message || "Failed to parse uploaded CSV.";
      toast.update(loadingToastId, {
        render: errMsg,
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    }
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await assetService.deleteAsset(deleteId);
      toast.success("Asset deleted successfully.");
      setShowDeleteModal(false);
      setDeleteId(null);
      fetchAssets();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete asset.");
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return null;
    return direction === "asc" ? <FaSortUp className="inline ml-1" /> : <FaSortDown className="inline ml-1" />;
  };

  return (
    <>
      <Navbar />
      <Sidebar />

      <main className="ml-64 mt-16 min-h-screen bg-slate-950 relative overflow-hidden">
        <AnimatedBackground />

        <div className="relative z-10 p-8">
          <PageHeader title="Asset Inventory" subtitle="Manage, filter, audit, and inventory all active network hardware and systems">
            <div className="flex flex-wrap gap-3">
              <PrimaryButton onClick={() => navigate("/assets/dashboard")} className="bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 flex items-center gap-2">
                <FaServer /> Dashboard
              </PrimaryButton>

              <PrimaryButton onClick={handleExportCsv} className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white flex items-center gap-2">
                <FaDownload /> Export CSV
              </PrimaryButton>

              {isWritable && (
                <>
                  <input type="file" ref={fileInputRef} onChange={handleImportCsv} accept=".csv" className="hidden" />
                  <PrimaryButton onClick={() => fileInputRef.current?.click()} className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white flex items-center gap-2">
                    <FaUpload /> Import CSV
                  </PrimaryButton>

                  <PrimaryButton onClick={() => navigate("/assets/add")} className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white flex items-center gap-2">
                    <FaPlus /> Add Asset
                  </PrimaryButton>
                </>
              )}

              <PrimaryButton onClick={fetchAssets} className="bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300">
                <FaSync className={loading ? "animate-spin" : ""} />
              </PrimaryButton>
            </div>
          </PageHeader>

          {/* Filters Form */}
          <GlassCard className="p-6 mb-8">
            <form onSubmit={handleSearch}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Hostname filter */}
                <div>
                  <label className="block text-slate-400 text-xs font-semibold mb-2 uppercase tracking-wide">Hostname</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500"><FaSearch /></span>
                    <input type="text" placeholder="Search Hostname..." value={searchHostname} onChange={(e) => setSearchHostname(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-400 outline-none transition" />
                  </div>
                </div>

                {/* Owner filter */}
                <div>
                  <label className="block text-slate-400 text-xs font-semibold mb-2 uppercase tracking-wide">Owner</label>
                  <input type="text" placeholder="Search Owner..." value={searchOwner} onChange={(e) => setSearchOwner(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-400 outline-none transition" />
                </div>

                {/* Status filter */}
                <div>
                  <label className="block text-slate-400 text-xs font-semibold mb-2 uppercase tracking-wide">Status</label>
                  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:border-cyan-400 outline-none transition">
                    <option value="ALL">All Statuses</option>
                    <option value="ONLINE">ONLINE</option>
                    <option value="OFFLINE">OFFLINE</option>
                  </select>
                </div>

                {/* Criticality filter */}
                <div>
                  <label className="block text-slate-400 text-xs font-semibold mb-2 uppercase tracking-wide">Criticality</label>
                  <select value={filterCriticality} onChange={(e) => setFilterCriticality(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:border-cyan-400 outline-none transition">
                    <option value="ALL">All Criticalities</option>
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>

                {/* Patch Status filter */}
                <div>
                  <label className="block text-slate-400 text-xs font-semibold mb-2 uppercase tracking-wide">Patch Status</label>
                  <select value={filterPatchStatus} onChange={(e) => setFilterPatchStatus(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:border-cyan-400 outline-none transition">
                    <option value="ALL">All Patch States</option>
                    <option value="UPDATED">UPDATED</option>
                    <option value="OUTDATED">OUTDATED</option>
                    <option value="UNKNOWN">UNKNOWN</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={handleResetFilters} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition">
                  Reset
                </button>
                <button type="submit" className="px-6 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold transition shadow-lg shadow-cyan-600/20 flex items-center gap-2">
                  <FaFilter /> Apply Filters
                </button>
              </div>
            </form>
          </GlassCard>

          {/* Table container */}
          <TableContainer>
            <table className="w-full text-left">
              <thead className="bg-slate-950 text-slate-300 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort("assetName")}>Asset Name {getSortIcon("assetName")}</th>
                  <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort("hostname")}>Hostname {getSortIcon("hostname")}</th>
                  <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort("ipAddress")}>IP {getSortIcon("ipAddress")}</th>
                  <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort("operatingSystem")}>OS {getSortIcon("operatingSystem")}</th>
                  <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort("cpuUsage")}>CPU % {getSortIcon("cpuUsage")}</th>
                  <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort("ramUsage")}>RAM % {getSortIcon("ramUsage")}</th>
                  <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort("diskUsage")}>Disk % {getSortIcon("diskUsage")}</th>
                  <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort("status")}>Status {getSortIcon("status")}</th>
                  <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort("lastSeen")}>Last Seen {getSortIcon("lastSeen")}</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-sm text-slate-300">
                {assets.length > 0 ? (
                  assets.map((asset, index) => (
                    <motion.tr key={asset.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }} className="hover:bg-slate-800/40 transition-colors duration-200">
                      <td className="p-4">
                        <div className="font-semibold text-white">{asset.assetName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{asset.assetId}</div>
                      </td>
                      <td className="p-4 font-semibold text-slate-300">{asset.hostname}</td>
                      <td className="p-4 font-mono text-xs text-slate-300">{asset.ipAddress}</td>
                      <td className="p-4 text-slate-300">{asset.operatingSystem} {asset.osVersion}</td>
                      <td className="p-4 text-slate-300 font-mono text-xs">
                        {asset.cpuUsage !== null && asset.cpuUsage !== undefined ? `${asset.cpuUsage.toFixed(1)}%` : "—"}
                      </td>
                      <td className="p-4 text-slate-300 font-mono text-xs">
                        {asset.ramUsage !== null && asset.ramUsage !== undefined ? `${asset.ramUsage.toFixed(1)}%` : "—"}
                      </td>
                      <td className="p-4 text-slate-300 font-mono text-xs">
                        {asset.diskUsage !== null && asset.diskUsage !== undefined ? `${asset.diskUsage.toFixed(1)}%` : "—"}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          asset.status === "ONLINE" ? "bg-green-500/10 text-green-400" :
                          asset.status === "OFFLINE" ? "bg-red-500/10 text-red-400" :
                          "bg-yellow-500/10 text-yellow-300"
                        }`}>
                          ● {asset.status}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-slate-400 font-mono">
                        {asset.lastSeen ? new Date(asset.lastSeen).toLocaleString() : "Never"}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => navigate(`/assets/detail/${asset.id}`)} title="View Detail" className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition">
                            <FaEye />
                          </button>
                          {isWritable && (
                            <button onClick={() => navigate(`/assets/edit/${asset.id}`)} title="Edit" className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 transition">
                              <FaEdit />
                            </button>
                          )}
                          {role === "ADMIN" && (
                            <button onClick={() => confirmDelete(asset.id)} title="Delete" className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-red-400 hover:text-red-300 transition">
                              <FaTrash />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="text-center py-12 text-slate-500">
                      {loading ? "Fetching assets..." : "No Assets Found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-800/60 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Showing page {page + 1} of {totalPages} ({totalElements} total assets)
                </span>
                <div className="flex gap-2">
                  <button disabled={page === 0} onClick={() => setPage(page - 1)} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 rounded-lg text-xs text-white transition font-medium">
                    Previous
                  </button>
                  <button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 rounded-lg text-xs text-white transition font-medium">
                    Next
                  </button>
                </div>
              </div>
            )}
          </TableContainer>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md w-full shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-2">Delete Asset</h3>
              <p className="text-slate-400 text-sm mb-6">
                Are you sure you want to delete this asset? This action is permanent and will log an audit event.
              </p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowDeleteModal(false)} className="px-5 py-2 text-sm text-slate-400 hover:text-white transition">
                  Cancel
                </button>
                <button onClick={handleDelete} className="px-6 py-2 text-sm font-semibold bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white rounded-xl transition shadow-lg shadow-red-600/10">
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default AssetList;

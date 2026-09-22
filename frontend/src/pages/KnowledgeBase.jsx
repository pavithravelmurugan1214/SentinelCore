import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch,
  FaBook,
  FaEdit,
  FaTrash,
  FaPlus,
  FaHistory,
  FaLink,
  FaSyncAlt,
  FaInfoCircle,
  FaCheck,
  FaArrowLeft,
  FaExternalLinkAlt,
  FaChevronRight,
  FaBookOpen,
  FaFileAlt
} from "react-icons/fa";
import { toast } from "react-toastify";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import AnimatedBackground from "../components/AnimatedBackground";
import GlassCard from "../components/ui/GlassCard";
import PageHeader from "../components/ui/PageHeader";

import kbService from "../services/kbService";
import incidentService from "../services/incidentService";
import { getCurrentRole } from "../services/auth";

// A Custom lightweight markdown parser that formats text beautifully
const MarkdownRenderer = ({ content }) => {
  if (!content) return <p className="text-slate-400 italic">No content provided.</p>;

  const lines = content.split("\n");
  let inCodeBlock = false;
  let codeBlockLines = [];

  const renderedElements = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Handle Code Blocks
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        // End of code block
        const codeText = codeBlockLines.join("\n");
        renderedElements.push(
          <div key={`code-${i}`} className="my-4 font-mono text-xs bg-slate-950 text-sky-400 p-4 rounded-xl border border-slate-800 relative group overflow-x-auto">
            <button
              onClick={() => {
                navigator.clipboard.writeText(codeText);
                toast.success("Code copied to clipboard!");
              }}
              className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded text-[10px] transition-all"
            >
              Copy
            </button>
            <pre>{codeText}</pre>
          </div>
        );
        codeBlockLines = [];
        inCodeBlock = false;
      } else {
        // Start of code block
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    // Process inline elements like Bold (**text**) and inline code (`text`)
    const formatInline = (text) => {
      const parts = [];
      let lastIndex = 0;

      // Regular expressions for bold and inline code
      const regex = /(\*\*.*?\*\*|`.*?`)/g;
      let match;

      while ((match = regex.exec(text)) !== null) {
        const matchText = match[0];
        const matchIndex = match.index;

        // Push text before the match
        if (matchIndex > lastIndex) {
          parts.push(text.substring(lastIndex, matchIndex));
        }

        if (matchText.startsWith("**") && matchText.endsWith("**")) {
          parts.push(
            <strong key={`bold-${matchIndex}`} className="font-extrabold text-white">
              {matchText.slice(2, -2)}
            </strong>
          );
        } else if (matchText.startsWith("`") && matchText.endsWith("`")) {
          parts.push(
            <code key={`code-${matchIndex}`} className="bg-slate-950 text-cyan-400 font-mono text-xs px-1.5 py-0.5 rounded border border-slate-850">
              {matchText.slice(1, -1)}
            </code>
          );
        }

        lastIndex = regex.lastIndex;
      }

      if (lastIndex < text.length) {
        parts.push(text.substring(lastIndex));
      }

      return parts.length > 0 ? parts : text;
    };

    // Handle Headings
    if (line.startsWith("# ")) {
      renderedElements.push(
        <h1 key={`h1-${i}`} className="text-2xl font-bold text-white mt-6 mb-3 pb-1.5 border-b border-slate-800">
          {formatInline(line.substring(2))}
        </h1>
      );
    } else if (line.startsWith("## ")) {
      renderedElements.push(
        <h2 key={`h2-${i}`} className="text-xl font-bold text-sky-400 mt-5 mb-2.5">
          {formatInline(line.substring(3))}
        </h2>
      );
    } else if (line.startsWith("### ")) {
      renderedElements.push(
        <h3 key={`h3-${i}`} className="text-lg font-bold text-slate-200 mt-4 mb-2">
          {formatInline(line.substring(4))}
        </h3>
      );
    }
    // Handle Bullet Lists
    else if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
      renderedElements.push(
        <ul key={`ul-${i}`} className="list-disc pl-6 my-1.5 text-slate-300 text-sm leading-relaxed">
          <li>{formatInline(line.trim().substring(2))}</li>
        </ul>
      );
    }
    // Handle Blockquotes
    else if (line.startsWith("> ")) {
      renderedElements.push(
        <blockquote key={`quote-${i}`} className="border-l-4 border-sky-500 bg-sky-500/5 px-4 py-2.5 my-3 rounded-r-xl text-slate-300 text-sm italic">
          {formatInline(line.substring(2))}
        </blockquote>
      );
    }
    // Empty Line
    else if (line.trim() === "") {
      renderedElements.push(<div key={`empty-${i}`} className="h-3" />);
    }
    // Normal Paragraph
    else {
      renderedElements.push(
        <p key={`p-${i}`} className="text-slate-300 text-sm leading-relaxed my-1.5 break-words">
          {formatInline(line)}
        </p>
      );
    }
  }

  return <div className="markdown-body space-y-1">{renderedElements}</div>;
};

function KnowledgeBase() {
  const role = getCurrentRole();
  const location = useLocation();
  const canWrite = role === "ADMIN";
  const isAdmin = role === "ADMIN";

  const [articles, setArticles] = useState([]);
  const [activeArticle, setActiveArticle] = useState(null);
  const [revisions, setRevisions] = useState([]);
  const [incidents, setIncidents] = useState([]);

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    type: "RUNBOOK",
    content: "",
    linkedIncidentIds: []
  });

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All"); // All, RUNBOOK, POST_INCIDENT_REVIEW, DETECTION_RULE
  const [detailTab, setDetailTab] = useState("content"); // content, revisions, incidents

  // Incident linking state (for active article details)
  const [selectedIncidentId, setSelectedIncidentId] = useState("");

  useEffect(() => {
    fetchArticles();
    fetchIncidents();
  }, [searchQuery, activeTab]);

  useEffect(() => {
    // Check if redirecting from incidents to create a post-incident review (PIR)
    if (location.state && location.state.createPir && location.state.incident) {
      const incident = location.state.incident;
      handleNewPIRClick(incident);
      // Clear location state safely without triggering a route navigation re-render
      window.history.replaceState(null, "");
    } else if (location.state && location.state.selectedArticleId) {
      const artId = location.state.selectedArticleId;
      kbService.getArticleById(artId).then((art) => {
        setActiveArticle(art);
        setDetailTab("content");
        fetchRevisions(art.id);
      }).catch((err) => {
        console.error("Failed to load article from navigation state", err);
      });
      // Clear location state safely
      window.history.replaceState(null, "");
    }
  }, [location]);

  const fetchArticles = async () => {
    try {
      const data = await kbService.getArticles(searchQuery, activeTab);
      setArticles(data);
      // Update selected article if it was already set
      if (activeArticle) {
        const updated = data.find((a) => a.id === activeArticle.id);
        if (updated) {
          setActiveArticle(updated);
        }
      }
    } catch (error) {
      console.error("Failed to fetch articles", error);
      toast.error("Failed to load knowledge base articles");
    }
  };

  const fetchIncidents = async () => {
    try {
      const data = await incidentService.getIncidents();
      setIncidents(data);
    } catch (error) {
      console.error("Failed to load incidents", error);
    }
  };

  const fetchRevisions = async (articleId) => {
    try {
      const data = await kbService.getRevisions(articleId);
      setRevisions(data);
    } catch (error) {
      console.error("Failed to fetch revisions", error);
    }
  };

  const selectArticle = async (article) => {
    try {
      const detailed = await kbService.getArticleById(article.id);
      setActiveArticle(detailed);
      setIsEditing(false);
      setIsCreating(false);
      setDetailTab("content");
      fetchRevisions(detailed.id);
    } catch (error) {
      console.error("Failed to load article details", error);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      toast.warn("Title and content are required!");
      return;
    }
    try {
      const created = await kbService.createArticle(formData);
      toast.success("Article created successfully!");
      setIsCreating(false);
      fetchArticles();
      selectArticle(created);
    } catch (error) {
      console.error("Failed to create article", error);
      toast.error("Failed to create article");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      toast.warn("Title and content are required!");
      return;
    }
    try {
      const updated = await kbService.updateArticle(activeArticle.id, formData);
      toast.success("Article updated (new version logged)!");
      setIsEditing(false);
      fetchArticles();
      selectArticle(updated);
    } catch (error) {
      console.error("Failed to update article", error);
      toast.error("Failed to update article");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this article? This action is permanent!")) {
      return;
    }
    try {
      await kbService.deleteArticle(id);
      toast.success("Article deleted successfully!");
      setActiveArticle(null);
      fetchArticles();
    } catch (error) {
      console.error("Failed to delete article", error);
      toast.error("Failed to delete article");
    }
  };

  const handleRestore = async (version) => {
    if (!window.confirm(`Are you sure you want to restore Version ${version}? This will update the active article and increment the version.`)) {
      return;
    }
    try {
      const restored = await kbService.restoreRevision(activeArticle.id, version);
      toast.success(`Successfully restored Version ${version}!`);
      fetchArticles();
      selectArticle(restored);
    } catch (error) {
      console.error("Failed to restore revision", error);
      toast.error("Failed to restore version");
    }
  };

  const handleLinkIncident = async () => {
    if (!selectedIncidentId) return;
    try {
      await incidentService.linkKbArticle(selectedIncidentId, activeArticle.id);
      toast.success("Incident linked to article!");
      setSelectedIncidentId("");
      // Reload active article
      selectArticle(activeArticle);
    } catch (error) {
      console.error("Failed to link incident", error);
      toast.error("Failed to link incident");
    }
  };

  const handleUnlinkIncident = async (incidentId) => {
    if (!window.confirm("Are you sure you want to unlink this incident?")) return;
    try {
      await incidentService.unlinkKbArticle(incidentId, activeArticle.id);
      toast.success("Incident unlinked from article!");
      selectArticle(activeArticle);
    } catch (error) {
      console.error("Failed to unlink incident", error);
      toast.error("Failed to unlink incident");
    }
  };

  const startEdit = () => {
    setFormData({
      title: activeArticle.title,
      type: activeArticle.type,
      content: activeArticle.content,
      linkedIncidentIds: activeArticle.linkedIncidentIds || []
    });
    setIsEditing(true);
  };

  const startCreate = () => {
    setFormData({
      title: "",
      type: "RUNBOOK",
      content: "",
      linkedIncidentIds: []
    });
    setIsCreating(true);
    setIsEditing(false);
    setActiveArticle(null);
  };

  const handleNewPIRClick = (incident) => {
    setFormData({
      title: `PIR: ${incident.title}`,
      type: "POST_INCIDENT_REVIEW",
      content: `# Post-Incident Review (PIR) - Incident #${incident.id}

## What Happened?
${incident.description || "Provide a sequence of events outlining what occurred, how the issue was detected, and initial triage steps."}

- **Incident Title:** ${incident.title}
- **Severity:** ${incident.severity}
- **Source:** ${incident.source}
- **Logged At:** ${incident.createdAt ? new Date(incident.createdAt).toLocaleString() : "Unknown"}

## Root Cause
${incident.description ? `Initial findings from description: "${incident.description}". Under what technical conditions did this trigger?` : "Detail the technical root cause of the incident. Under what conditions did it occur and what allowed it to trigger?"}

## Impact
${incident.description ? `Initial security/operational scope from notes: "${incident.description}". Detail specific assets or data affected.` : "Detail the impact of the incident, including affected assets, compromised users, downtime, or security scope."}

## Timeline
Specify key event timestamps:
- **Detection Time:** 
- **Triage Start:** 
- **Containment Achieved:** 
- **Resolution Completed:** 

## Lessons Learned
Summarize lessons learned during incident response. Highlight response bottlenecks or processes that worked well.

## Preventive Measures
Specify corrective action items to mitigate recurrence:
- [ ] Action item 1
- [ ] Action item 2
`,
      linkedIncidentIds: [incident.id]
    });
    setIsCreating(true);
    setIsEditing(false);
    setActiveArticle(null);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "Critical": return "bg-red-500/20 text-red-400 border border-red-500/30";
      case "High": return "bg-orange-500/20 text-orange-400 border border-orange-500/30";
      case "Medium": return "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30";
      case "Low": return "bg-green-500/20 text-green-400 border border-green-500/30";
      default: return "bg-slate-700 text-white";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Open": return "bg-sky-500/20 text-sky-400 border border-sky-500/30";
      case "Investigating": return "bg-amber-500/20 text-amber-300 border border-amber-500/30";
      case "Resolved": return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
      case "Closed": return "bg-slate-500/20 text-slate-400 border border-slate-500/30";
      default: return "bg-slate-700 text-white";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "RUNBOOK":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
      case "POST_INCIDENT_REVIEW":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "DETECTION_RULE":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "RUNBOOK":
        return "Runbooks";
      case "POST_INCIDENT_REVIEW":
        return "PIRs";
      case "DETECTION_RULE":
        return "Rules";
      default:
        return type;
    }
  };

  return (
    <>
      <Navbar />
      <Sidebar />

      <main className="ml-64 mt-16 min-h-screen bg-slate-950 relative overflow-hidden">
        <AnimatedBackground />

        <div className="relative z-10 p-8 space-y-6">
          <PageHeader
            title="Internal Knowledge Base"
            subtitle="Central wiki for runbooks, post-incident reviews, and detection-rule documentation"
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: Search, Filters & Article List (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <GlassCard className="p-4 flex flex-col gap-4">
                {/* Search input */}
                <div className="relative">
                  <FaSearch className="absolute left-4 top-3.5 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search articles & documentation..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-2.5 text-sm text-white focus:border-sky-400 outline-none transition-all duration-300"
                  />
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  {["All", "RUNBOOK", "POST_INCIDENT_REVIEW", "DETECTION_RULE"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-2 px-3 text-[10px] md:text-xs font-bold rounded-lg transition-all duration-200 ${
                        activeTab === tab
                          ? "bg-slate-900 text-sky-400 border border-slate-800"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {tab === "All" ? "All" : tab === "RUNBOOK" ? "Runbooks" : tab === "POST_INCIDENT_REVIEW" ? "PIRs" : "Rules"}
                    </button>
                  ))}
                </div>

                {/* Create button */}
                {canWrite && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={startCreate}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-sky-500/20 text-sm transition-all duration-300"
                  >
                    <FaPlus className="text-xs" /> Write New Article
                  </motion.button>
                )}
              </GlassCard>

              {activeTab === "POST_INCIDENT_REVIEW" && (() => {
                const resolvedWithoutPir = incidents.filter(inc => 
                  (inc.status?.toUpperCase() === "RESOLVED" || inc.status?.toUpperCase() === "CLOSED") &&
                  (!inc.linkedArticles || !inc.linkedArticles.some(art => art.type === "POST_INCIDENT_REVIEW"))
                );
                
                if (resolvedWithoutPir.length === 0) return null;
                
                return (
                  <GlassCard className="p-4 border-amber-500/25 bg-amber-500/5 flex flex-col gap-3">
                    <h4 className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FaInfoCircle /> Awaiting Review ({resolvedWithoutPir.length})
                    </h4>
                    <div className="space-y-2 max-h-[220px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
                      {resolvedWithoutPir.map(inc => (
                        <div key={inc.id} className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-850 flex justify-between items-center gap-2">
                          <div className="min-w-0">
                            <span className="block text-[11px] font-semibold text-white truncate">#{inc.id} - {inc.title}</span>
                            <span className="block text-[9px] text-slate-500 mt-0.5">Severity: {inc.severity} | status: {inc.status}</span>
                          </div>
                          {canWrite && (
                            <button
                              onClick={() => handleNewPIRClick(inc)}
                              className="bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-white px-2 py-1 rounded text-[9px] font-bold border border-amber-500/20 transition-all shrink-0"
                            >
                              Draft PIR
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                );
              })()}

              {/* Article List Container */}
              <GlassCard className="p-4 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
                <div className="space-y-2">
                  {articles.length > 0 ? (
                    articles.map((art) => {
                      const isActive = activeArticle && activeArticle.id === art.id;
                      return (
                        <button
                          key={art.id}
                          onClick={() => selectArticle(art)}
                          className={`w-full text-left p-3.5 rounded-xl border transition-all duration-300 flex flex-col gap-2 ${
                            isActive
                              ? "bg-sky-500/10 border-sky-500/30 shadow-md shadow-sky-500/5 text-white"
                              : "bg-slate-900/40 hover:bg-slate-850/60 border-slate-800/60 text-slate-300"
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2 w-full">
                            <span className="font-semibold text-sm line-clamp-1 flex-1">{art.title}</span>
                            <span className="text-[10px] font-mono font-bold bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                              v{art.version}
                            </span>
                          </div>

                          <div className="flex justify-between items-center w-full">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase ${getTypeColor(art.type)}`}>
                              {getTypeLabel(art.type)}
                            </span>
                            <span className="text-[9px] text-slate-500">
                              {art.updatedAt ? new Date(art.updatedAt).toLocaleDateString() : "Just now"}
                            </span>
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 text-slate-500 text-sm italic">
                      No documentation articles found.
                    </div>
                  )}
                </div>
              </GlassCard>
            </div>

            {/* RIGHT COLUMN: Rich Viewer, Editor or Empty State (8 cols) */}
            <div className="lg:col-span-8">
              <AnimatePresence mode="wait">
                {/* 1. Empty State */}
                {!activeArticle && !isCreating && !isEditing && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <GlassCard className="p-12 text-center flex flex-col items-center justify-center gap-6 min-h-[500px]">
                      <div className="w-20 h-20 rounded-3xl bg-slate-950 border border-slate-800 flex items-center justify-center shadow-inner">
                        <FaBookOpen className="text-3xl text-sky-500" />
                      </div>
                      <div className="space-y-2 max-w-md">
                        <h3 className="text-2xl font-bold text-white">Cloud Security KB Center</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                          Welcome to the operations wiki. Search and consult containment runbooks, read incident autopsy logs, or reference detection engineering rules.
                        </p>
                      </div>
                      {canWrite && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={startCreate}
                          className="bg-sky-500 hover:bg-sky-400 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-sky-500/20 text-sm transition-all duration-300"
                        >
                          Create Operations Article
                        </motion.button>
                      )}
                    </GlassCard>
                  </motion.div>
                )}

                {/* 2. Creating or Editing Article Form */}
                {(isCreating || isEditing) && (
                  <motion.div
                    key="editor"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <GlassCard className="p-6">
                      <div className="flex justify-between items-center pb-4 border-b border-slate-800 mb-6">
                        <h3 className="text-xl font-bold text-sky-400 flex items-center gap-2">
                          <FaEdit /> {isCreating ? "Draft New Documentation" : "Modify Article Content"}
                        </h3>
                        <button
                          onClick={() => {
                            setIsCreating(false);
                            setIsEditing(false);
                            if (activeArticle) selectArticle(activeArticle);
                          }}
                          className="text-slate-400 hover:text-white"
                        >
                          <FaArrowLeft className="inline-block mr-1 text-xs" /> Back
                        </button>
                      </div>

                      <form onSubmit={isCreating ? handleCreate : handleUpdate} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Title *</label>
                            <input
                              type="text"
                              required
                              value={formData.title}
                              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                              placeholder="e.g. Runbook: Compromised User Credentials containment"
                              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-white focus:border-sky-400 outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Article Type *</label>
                            <select
                              value={formData.type}
                              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-sm text-white focus:border-sky-400 outline-none"
                            >
                              <option value="RUNBOOK">Runbooks</option>
                              <option value="POST_INCIDENT_REVIEW">PIRs</option>
                              <option value="DETECTION_RULE">Rules</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Content Body *</label>
                            <span className="text-[10px] text-slate-500 italic">Supports basic Markdown (# Heading, ## Subheading, - List, **Bold**, `Code`, ```Block```)</span>
                          </div>
                          <textarea
                            rows="14"
                            required
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            placeholder="# Enter Markdown Heading&#10;Type article instructions here...&#10;&#10;## Containment Steps&#10;- Step 1: Terminate session&#10;- Step 2: Disable user account in Active Directory"
                            className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-sm text-white font-mono focus:border-sky-400 outline-none resize-none"
                          />
                        </div>

                        {/* If creating new, show optional incident linking dropdown */}
                        {isCreating && (
                          <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Link to Security Incident (Optional)</label>
                            <select
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormData({
                                  ...formData,
                                  linkedIncidentIds: val ? [parseInt(val)] : []
                                });
                              }}
                              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-white focus:border-sky-400 outline-none"
                            >
                              <option value="">-- Associate with Incident --</option>
                              {incidents.map((inc) => (
                                <option key={inc.id} value={inc.id}>
                                  #{inc.id} - {inc.title} ({inc.status})
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                          <button
                            type="button"
                            onClick={() => {
                              setIsCreating(false);
                              setIsEditing(false);
                              if (activeArticle) selectArticle(activeArticle);
                            }}
                            className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-sky-500/20 transition-all duration-300"
                          >
                            {isCreating ? "Publish Article" : "Save Changes"}
                          </button>
                        </div>
                      </form>
                    </GlassCard>
                  </motion.div>
                )}

                {/* 3. Detailed View Mode */}
                {activeArticle && !isCreating && !isEditing && (
                  <motion.div
                    key={activeArticle.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <GlassCard className="p-6 space-y-6">
                      {/* Header metadata */}
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-5 border-b border-slate-800">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getTypeColor(activeArticle.type)}`}>
                              {getTypeLabel(activeArticle.type)}
                            </span>
                            <span className="text-[10px] font-mono font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-cyan-400">
                              Version {activeArticle.version}
                            </span>
                          </div>
                          <h2 className="text-2xl font-bold text-white leading-tight">{activeArticle.title}</h2>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span>Written by: <strong className="text-slate-400">{activeArticle.createdByName || "System"}</strong></span>
                            <span>•</span>
                            <span>Last updated: <strong className="text-slate-400">{activeArticle.updatedAt ? new Date(activeArticle.updatedAt).toLocaleString() : new Date(activeArticle.createdAt).toLocaleString()}</strong></span>
                          </div>
                        </div>

                        {/* Edit/Delete control buttons */}
                        {canWrite && (
                          <div className="flex gap-2 shrink-0">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={startEdit}
                              className="flex items-center gap-1.5 bg-sky-500/10 hover:bg-sky-500 text-sky-400 hover:text-white border border-sky-500/20 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300"
                            >
                              <FaEdit /> Edit
                            </motion.button>
                            {isAdmin && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleDelete(activeArticle.id)}
                                className="flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300"
                              >
                                <FaTrash /> Delete
                              </motion.button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Detail Section Tabs */}
                      <div className="flex border-b border-slate-800">
                        {[
                          { id: "content", label: "Documentation", icon: <FaFileAlt /> },
                          { id: "revisions", label: `Version History (${revisions.length})`, icon: <FaHistory /> },
                          { id: "incidents", label: `Linked Incidents (${activeArticle.linkedIncidentIds?.length || 0})`, icon: <FaLink /> }
                        ].map((t) => (
                          <button
                            key={t.id}
                            onClick={() => setDetailTab(t.id)}
                            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all duration-200 ${
                              detailTab === t.id
                                ? "border-sky-500 text-sky-400"
                                : "border-transparent text-slate-500 hover:text-slate-300"
                            }`}
                          >
                            {t.icon} {t.label}
                          </button>
                        ))}
                      </div>

                      {/* Tab Contents */}
                      <div className="pt-2 min-h-[300px]">
                        {/* Tab 1: Rendered Markdown Content */}
                        {detailTab === "content" && (
                          <div className="space-y-4">
                            {/* Incident Context Card for PIRs */}
                            {activeArticle.type === "POST_INCIDENT_REVIEW" && 
                             activeArticle.linkedIncidentIds && 
                             activeArticle.linkedIncidentIds.length > 0 && (() => {
                               const linkedInc = incidents.find(i => String(i.id) === String(activeArticle.linkedIncidentIds[0]));
                               if (!linkedInc) return null;
                               return (
                                 <div className="bg-slate-950/60 p-4.5 rounded-2xl border border-slate-850 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                   <div className="space-y-1">
                                     <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Linked Incident Context</span>
                                     <span className="text-sm font-bold text-white block">#{linkedInc.id} - {linkedInc.title}</span>
                                     <span className="text-[10px] text-slate-400 block">Logged: {new Date(linkedInc.createdAt).toLocaleString()} | Source: {linkedInc.source}</span>
                                   </div>
                                   <div className="flex gap-2">
                                     <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(linkedInc.status)}`}>
                                       {linkedInc.status}
                                     </span>
                                     <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getSeverityColor(linkedInc.severity)}`}>
                                       {linkedInc.severity}
                                     </span>
                                   </div>
                                 </div>
                               );
                             })()}

                            <div className="bg-slate-950/40 p-6 rounded-2xl border border-slate-850/60 overflow-y-auto max-h-[600px]">
                              <MarkdownRenderer content={activeArticle.content} />
                            </div>
                          </div>
                        )}

                        {/* Tab 2: Revision History Log */}
                        {detailTab === "revisions" && (
                          <div className="space-y-3">
                            <p className="text-xs text-slate-500">
                              Every modification updates the active copy and catalogs the previous state here. Restore to go back to a prior state.
                            </p>
                            {revisions.length > 0 ? (
                              <div className="border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800 bg-slate-950/20">
                                {revisions.map((rev) => (
                                  <div key={rev.id} className="p-4 flex justify-between items-center hover:bg-slate-900/20 transition-all">
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-sky-400 font-mono">v{rev.version}</span>
                                        <span className="text-xs font-semibold text-white">{rev.title}</span>
                                      </div>
                                      <div className="text-[10px] text-slate-500">
                                        Saved by: <strong>{rev.updatedByName || "System"}</strong> on {new Date(rev.updatedAt).toLocaleString()}
                                      </div>
                                    </div>

                                    {canWrite && (
                                      <div className="flex gap-2">
                                        {/* Toggle review content panel */}
                                        <button
                                          onClick={() => {
                                            // Quick prompt/alert to view version body text
                                            alert(`--- Version ${rev.version} Contents ---\n\n${rev.content}`);
                                          }}
                                          className="text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-750 transition"
                                        >
                                          View Text
                                        </button>
                                        <button
                                          onClick={() => handleRestore(rev.version)}
                                          className="flex items-center gap-1 text-[10px] font-bold bg-sky-500/10 hover:bg-sky-500 text-sky-400 hover:text-white px-3 py-1.5 rounded-lg border border-sky-500/20 transition"
                                        >
                                          <FaSyncAlt className="text-[8px]" /> Restore
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-12 text-slate-500 text-sm border border-dashed border-slate-800 rounded-2xl bg-slate-950/20">
                                <FaInfoCircle className="inline-block mr-1" /> This is the original version. No revisions recorded yet.
                              </div>
                            )}
                          </div>
                        )}

                        {/* Tab 3: Linked Incidents Panel */}
                        {detailTab === "incidents" && (
                          <div className="space-y-4">
                            {/* Link new incident form */}
                            {canWrite && (
                              <div className="flex gap-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-850">
                                <div className="flex-1">
                                  <select
                                    value={selectedIncidentId}
                                    onChange={(e) => setSelectedIncidentId(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-sky-400 outline-none"
                                  >
                                    <option value="">-- Associate a Security Incident --</option>
                                    {incidents
                                      .filter((inc) => !activeArticle.linkedIncidentIds?.includes(inc.id))
                                      .map((inc) => (
                                        <option key={inc.id} value={inc.id}>
                                          #{inc.id} - {inc.title} ({inc.severity} | {inc.status})
                                        </option>
                                      ))}
                                  </select>
                                </div>
                                <button
                                  onClick={handleLinkIncident}
                                  disabled={!selectedIncidentId}
                                  className="bg-sky-500 hover:bg-sky-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1 shadow-md shadow-sky-500/10 transition"
                                >
                                  <FaLink /> Link
                                </button>
                              </div>
                            )}

                            {/* List linked incidents */}
                            {activeArticle.linkedIncidentIds && activeArticle.linkedIncidentIds.length > 0 ? (
                              <div className="border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800 bg-slate-950/20">
                                {incidents
                                  .filter((inc) => activeArticle.linkedIncidentIds.includes(inc.id))
                                  .map((inc) => (
                                    <div key={inc.id} className="p-4 flex justify-between items-center hover:bg-slate-900/10">
                                      <div className="flex items-center gap-3">
                                        <span className="text-slate-500 font-mono text-xs">#{inc.id}</span>
                                        <div>
                                          <div className="text-xs font-bold text-white flex items-center gap-2">
                                            {inc.title}
                                            {inc.status === "RESOLVED" && <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-1 py-0.5 rounded">RESOLVED</span>}
                                          </div>
                                          <div className="text-[10px] text-slate-500 mt-0.5">
                                            Severity: <strong className="text-slate-400">{inc.severity}</strong> | Source: <span className="text-slate-400">{inc.source}</span>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-3">
                                        {canWrite && (
                                          <button
                                            onClick={() => handleUnlinkIncident(inc.id)}
                                            className="text-rose-400 hover:text-rose-300 text-[10px] font-bold bg-rose-500/5 hover:bg-rose-500/15 border border-rose-500/10 px-2.5 py-1.5 rounded-lg transition"
                                            title="Unlink from Article"
                                          >
                                            Unlink
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            ) : (
                              <div className="text-center py-12 text-slate-500 text-sm border border-dashed border-slate-800 rounded-2xl bg-slate-950/20">
                                <FaInfoCircle className="inline-block mr-1" /> No active incidents linked to this article.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </GlassCard>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default KnowledgeBase;

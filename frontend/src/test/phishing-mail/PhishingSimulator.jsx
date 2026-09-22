import { useState } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import AnimatedBackground from "../../components/AnimatedBackground";
import PageHeader from "../../components/ui/PageHeader";
import GlassCard from "../../components/ui/GlassCard";

import Inbox from "./Inbox";
import EmailDetails from "./EmailDetails";
import ComposeMail from "./ComposeMail";
import ReceiveMail from "./ReceiveMail";
import PhishingAnalysisResult from "./PhishingAnalysisResult";
import PlaybookSimulation from "./PlaybookSimulation";

import { FaPlus, FaCloudDownloadAlt, FaMailBulk } from "react-icons/fa";

function PhishingSimulator() {
  const [emails, setEmails] = useState([
    {
      id: 1,
      sender: "security-alert@amazon-login.com",
      recipient: "analyst@cloudsecurity.local",
      subject: "Urgent: Security Verification Required",
      body: "Dear Amazon Customer,\n\nWe detected suspicious attempts to sign in to your Amazon account from an unknown IP address. To prevent unauthorized access, your account has been temporarily restricted.\n\nYou must verify your identity immediately by clicking the secure login link below:\n\nhttp://verify-account.net/amazon-login\n\nIf you do not verify your account within 24 hours, it will be permanently deactivated.\n\nRegards,\nAmazon Security Team",
      attachments: [],
      urls: ["http://verify-account.net/amazon-login"],
      isPhishing: true,
      date: "10:14 AM",
    },
    {
      id: 2,
      sender: "support@github.com",
      recipient: "analyst@cloudsecurity.local",
      subject: "[GitHub] Security Alert: New login detected",
      body: "Hi Cloud Security Analyst,\n\nWe noticed a login to your GitHub account from a new location/device.\n\nDevice: Chrome on Windows 11\nLocation: Bangalore, India\nIP: 103.45.191.12\n\nIf this was you, no action is needed. If you do not recognize this login, please change your credentials immediately.\n\nThanks,\nThe GitHub Team",
      attachments: [],
      urls: ["https://github.com/settings/security"],
      isPhishing: false,
      date: "11:20 AM",
    },
  ]);

  const [selectedEmail, setSelectedEmail] = useState(emails[0]);
  const [activeModal, setActiveModal] = useState(null); // compose | receive | scan | playbook
  const [scanningEmail, setScanningEmail] = useState(null);

  const handleSendEmail = (newMail) => {
    setEmails([newMail, ...emails]);
    setSelectedEmail(newMail);
    setActiveModal(null);
  };

  const handleReceiveEmail = (newMail) => {
    setEmails([newMail, ...emails]);
    setSelectedEmail(newMail);
    setActiveModal(null);
  };

  const handleCheckPhishing = (email) => {
    setScanningEmail(email);
    setActiveModal("scan");
  };

  const handleTriggerPlaybook = (email) => {
    setActiveModal("playbook");
  };

  return (
    <>
      <Navbar />
      <Sidebar />

      <main className="ml-64 mt-16 min-h-screen bg-slate-950 relative overflow-hidden flex flex-col">
        <AnimatedBackground />

        <div className="relative z-10 p-8 flex-1 flex flex-col gap-6">
          {/* Header row */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <PageHeader
              title="Phishing Mail Simulator"
              subtitle="Sandbox demo portal for email threats. Construct attacks, scan payloads, and view SOAR playbooks."
            />

            <div className="flex gap-3 shrink-0">
              <button
                onClick={() => setActiveModal("compose")}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <FaPlus className="text-sky-400" /> Compose Email
              </button>

              <button
                onClick={() => setActiveModal("receive")}
                className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-sky-500/25 transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <FaCloudDownloadAlt /> Inbound Queues
              </button>
            </div>
          </div>

          {/* Interactive Mailbox Grid */}
          <div className="flex-1 grid grid-cols-1 xl:grid-cols-3 gap-6 min-h-[500px]">
            {/* Inbox Panel */}
            <div className="xl:col-span-1 h-full">
              <Inbox
                emails={emails}
                selectedEmail={selectedEmail}
                onSelectEmail={setSelectedEmail}
              />
            </div>

            {/* Email Details View */}
            <div className="xl:col-span-2 h-full">
              <EmailDetails
                email={selectedEmail}
                onCheckPhishing={handleCheckPhishing}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Overlay Modals */}
      {activeModal === "compose" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setActiveModal(null)} />
          <ComposeMail onSendEmail={handleSendEmail} onClose={() => setActiveModal(null)} />
        </div>
      )}

      {activeModal === "receive" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setActiveModal(null)} />
          <div className="w-full max-w-lg z-10 max-h-[80vh] flex flex-col">
            <div className="flex justify-end p-2 bg-slate-900 border-t border-x border-slate-800 rounded-t-3xl">
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white px-3 py-1 cursor-pointer">✕</button>
            </div>
            <div className="overflow-y-auto flex-1 bg-slate-900 border-b border-x border-slate-800 rounded-b-3xl">
              <ReceiveMail onReceiveEmail={handleReceiveEmail} />
            </div>
          </div>
        </div>
      )}

      {activeModal === "scan" && scanningEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setActiveModal(null)} />
          <div className="z-10 w-full max-w-xl">
            <PhishingAnalysisResult
              email={scanningEmail}
              onTriggerPlaybook={handleTriggerPlaybook}
              onClose={() => setActiveModal(null)}
            />
          </div>
        </div>
      )}

      {activeModal === "playbook" && scanningEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setActiveModal(null)} />
          <div className="z-10 w-full max-w-xl">
            <PlaybookSimulation
              email={scanningEmail}
              onClose={() => setActiveModal(null)}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default PhishingSimulator;

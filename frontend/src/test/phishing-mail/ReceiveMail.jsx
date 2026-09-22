import { FaDownload, FaExclamationTriangle, FaCheckCircle, FaInbox } from "react-icons/fa";

function ReceiveMail({ onReceiveEmail }) {
  // Predefined sample emails (both phishing and legitimate)
  const sampleMails = [
    {
      id: 101,
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
      id: 102,
      sender: "support@github.com",
      recipient: "analyst@cloudsecurity.local",
      subject: "[GitHub] Security Alert: New login detected",
      body: "Hi Cloud Security Analyst,\n\nWe noticed a login to your GitHub account from a new location/device.\n\nDevice: Chrome on Windows 11\nLocation: Bangalore, India\nIP: 103.45.191.12\n\nIf this was you, no action is needed. If you do not recognize this login, please change your credentials immediately.\n\nThanks,\nThe GitHub Team",
      attachments: [],
      urls: ["https://github.com/settings/security"],
      isPhishing: false,
      date: "11:20 AM",
    },
    {
      id: 103,
      sender: "billing@netflix-verify.net",
      recipient: "analyst@cloudsecurity.local",
      subject: "Action Required: Billing Information Update",
      body: "Dear Customer,\n\nWe were unable to process your monthly subscription payment. As a result, your streaming service will be suspended unless you update your credit card details immediately.\n\nPlease log in here to correct your billing profile:\n\nhttp://secure-login.net/netflix-billing\n\nThank you for choosing Netflix.\n\nNetflix Billing Operations",
      attachments: [],
      urls: ["http://secure-login.net/netflix-billing"],
      isPhishing: true,
      date: "Yesterday",
    },
    {
      id: 104,
      sender: "hr@cloudsecurity.com",
      recipient: "employee-all@cloudsecurity.com",
      subject: "Q3 Security Awareness Training Program",
      body: "Hi Team,\n\nOur annual Q3 Cyber Security Awareness training course is now open. Completion is mandatory for all team members by August 15th, 2026.\n\nYou can access the courses on the corporate training portal:\n\nhttps://internal-training.cloudsecurity.local/courses/cyber-2026\n\nPlease find attached the PDF outline containing modules details.\n\nBest,\nHR Operations Team",
      attachments: ["security_modules_2026.pdf"],
      urls: ["https://internal-training.cloudsecurity.local/courses/cyber-2026"],
      isPhishing: false,
      date: "Yesterday",
    },
    {
      id: 105,
      sender: "financial-ops@fakebank.com",
      recipient: "analyst@cloudsecurity.local",
      subject: "Wire Transfer Confirmation #883901",
      body: "Hello,\n\nAttached is the wire transaction confirmation document for the transfer of $25,500.00 processed from your account.\n\nPlease double check if all billing recipient accounts listed in the invoice attachment are correct.\n\nIf you did not authorize this, run the validation tool in the zip file immediately.\n\nAttachment: wire_transfer_invoice_details.zip",
      attachments: ["wire_transfer_invoice_details.zip", "run_validation.exe"],
      urls: [],
      isPhishing: true,
      date: "2 days ago",
    },
  ];

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col h-full backdrop-blur-xl">
      <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
        <FaInbox className="text-emerald-500 shrink-0" />
        <span>Predefined Inbound Queues</span>
      </div>

      <p className="text-[11px] text-slate-400 mb-4 px-1 leading-relaxed">
        Click the download/inject button next to any preloaded test email to simulate receiving it into your active inbox.
      </p>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
        {sampleMails.map((mail) => (
          <div
            key={mail.id}
            className="p-3.5 bg-slate-950/40 border border-slate-800/80 hover:border-slate-700/60 rounded-xl flex justify-between items-center gap-4 transition duration-300"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                {mail.isPhishing ? (
                  <span className="flex items-center gap-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.5 rounded text-[8px] font-bold">
                    Phishing
                  </span>
                ) : (
                  <span className="flex items-center gap-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[8px] font-bold">
                    Legitimate
                  </span>
                )}
                <span className="text-[10px] text-slate-500 truncate">{mail.sender}</span>
              </div>
              <h4 className="text-xs font-bold text-white truncate">{mail.subject}</h4>
            </div>

            <button
              onClick={() => onReceiveEmail({ ...mail, id: Date.now() })}
              className="p-2.5 bg-sky-500/10 hover:bg-sky-500 text-sky-400 hover:text-white border border-sky-500/20 rounded-xl transition cursor-pointer text-xs flex items-center gap-1.5 font-bold shadow-md shadow-sky-500/5 hover:scale-105 active:scale-95"
              title="Inject into Inbox"
            >
              <FaDownload /> Inject
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ReceiveMail;

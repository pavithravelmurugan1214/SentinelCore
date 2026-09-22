import { useState } from "react";
import { FaPaperPlane, FaPaperclip, FaTimes } from "react-icons/fa";

function ComposeMail({ onSendEmail, onClose }) {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [urls, setUrls] = useState("");
  const [attachmentInput, setAttachmentInput] = useState("");

  const handleAddAttachment = () => {
    if (!attachmentInput.trim()) return;
    setAttachments([...attachments, attachmentInput.trim()]);
    setAttachmentInput("");
  };

  const handleRemoveAttachment = (idx) => {
    setAttachments(attachments.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!to || !subject || !body) return;

    // Parse URL list from string or body
    const urlList = urls
      .split(",")
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

    // Detect if this composed email looks like a simulated phishing test
    // E.g., if domain contains fake domains, or content has critical keywords
    const isSenderPhish = to.includes("fakebank.com") || to.includes("paypai.com") || to.includes("secure-login") || to.includes("verify-account");
    const hasPhishKeywords = ["verify", "urgent", "click here", "password", "restricted", "suspended", "payment"].some(w => 
      body.toLowerCase().includes(w) || subject.toLowerCase().includes(w)
    );
    const isPhishing = isSenderPhish || hasPhishKeywords || urlList.some(u => u.includes("verify") || u.includes("login") || u.includes("update"));

    const newMail = {
      id: Date.now(),
      sender: "security-simulation@cloudsecurity.local",
      recipient: to,
      subject: subject,
      body: body,
      attachments: attachments,
      urls: urlList,
      isPhishing: isPhishing,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    onSendEmail(newMail);
    setTo("");
    setSubject("");
    setBody("");
    setAttachments([]);
    setUrls("");
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-white max-h-[85vh] flex flex-col w-full max-w-xl">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
        <h3 className="text-base font-bold text-sky-400">Compose Simulation Email</h3>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer transition">
            <FaTimes />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800 flex-1">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">To (Recipient) *</label>
          <input
            type="email"
            required
            placeholder="target@company.com"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:border-sky-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Subject *</label>
          <input
            type="text"
            required
            placeholder="e.g. Critical System Patch Required"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:border-sky-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Message Body *</label>
          <textarea
            rows="5"
            required
            placeholder="Write your email body..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-sky-500 outline-none resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Embedded URLs (comma separated)</label>
          <input
            type="text"
            placeholder="e.g., http://verify-secure.net, http://google.com"
            value={urls}
            onChange={(e) => setUrls(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:border-sky-500 outline-none font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Attachments (Simulated)</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g., invoice.exe, payload.js, report.pdf"
              value={attachmentInput}
              onChange={(e) => setAttachmentInput(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:border-sky-500 outline-none"
            />
            <button
              type="button"
              onClick={handleAddAttachment}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition"
            >
              <FaPaperclip /> Add
            </button>
          </div>

          {/* Attachment list */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {attachments.map((att, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 bg-slate-950 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-lg text-[10px] font-semibold"
                >
                  {att}
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(idx)}
                    className="text-rose-400 hover:text-rose-300 font-bold transition ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/80">
          <button
            type="submit"
            className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-lg shadow-sky-500/25 transition cursor-pointer"
          >
            <FaPaperPlane /> Send (Simulator Inbound)
          </button>
        </div>
      </form>
    </div>
  );
}

export default ComposeMail;

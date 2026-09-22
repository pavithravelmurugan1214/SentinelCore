import { useState, useRef, useEffect } from "react";
import { askAI } from "../services/aiService";
import {
    MessageCircle,
    X,
    Send,
    Bot,
    Copy,
    Trash2,
    Check
} from "lucide-react";

export default function AIChatWidget() {

    const [isOpen, setIsOpen] = useState(false);
    const [question, setQuestion] = useState("");

    const [messages, setMessages] = useState([
        {
            sender: "ai",
            text: "👋 Hello! I am Cloud Security AI Assistant.\n\nHow can I help you today?"
        }
    ]);

    const [loading, setLoading] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState(null);

    const chatRef = useRef(null);
    const messagesEndRef = useRef(null);

    const quickQuestions = [
        "📊 Dashboard Summary",
        "🚨 How many alerts are there?",
        "🛡 How many incidents are there?",
        "⚠ How many threats are there?",
        "🔐 How many vulnerabilities are there?",
        "👥 How many users are there?",
        "❓ What is SIEM?",
        "❓ Explain MITRE ATT&CK",
    ];

    // Auto Scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });
    }, [messages, loading]);

    // Click Outside
    useEffect(() => {

        function handleClickOutside(e) {

            if (
                chatRef.current &&
                !chatRef.current.contains(e.target)
            ) {
                setIsOpen(false);
            }

        }

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };

    }, [isOpen]);

    // ESC Close
    useEffect(() => {

        function handleEsc(e) {

            if (e.key === "Escape") {
                setIsOpen(false);
            }

        }

        document.addEventListener("keydown", handleEsc);

        return () =>
            document.removeEventListener("keydown", handleEsc);

    }, []);

    // Clear Chat
    function clearChat() {

        setMessages([
            {
                sender: "ai",
                text: "👋 Hello! I am Cloud Security AI Assistant.\n\nHow can I help you today?"
            }
        ]);

        setQuestion("");
        setLoading(false);

    }

    // Copy AI Response
    async function copyMessage(text, index) {

        try {

            await navigator.clipboard.writeText(text);

            setCopiedIndex(index);

            setTimeout(() => {
                setCopiedIndex(null);
            }, 2000);

        } catch {

            alert("Failed to copy.");

        }

    }

    async function sendMessage(customQuestion = null) {

        const message = customQuestion || question;

        if (!message.trim()) return;

        setMessages(prev => [
            ...prev,
            {
                sender: "user",
                text: message
            }
        ]);

        setLoading(true);

        try {

            const response = await askAI(message);

            setMessages(prev => [
                ...prev,
                {
                    sender: "ai",
                    text: response.answer
                }
            ]);

        } catch {

            setMessages(prev => [
                ...prev,
                {
                    sender: "ai",
                    text: "Unable to contact AI service."
                }
            ]);

        }

        setQuestion("");
        setLoading(false);

    }

    return (
        <>
            {!isOpen && (

                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 bg-cyan-500 hover:bg-cyan-600 text-white rounded-full p-4 shadow-xl z-50"
                >
                    <MessageCircle size={26} />
                </button>

            )}

            {isOpen && (

                <div
                    ref={chatRef}
                    className="fixed bottom-6 right-6 w-[390px] h-[600px] bg-slate-900 border border-cyan-500 rounded-xl shadow-2xl flex flex-col z-50"
                >

                    {/* Header */}

                    <div className="flex justify-between items-center p-4 border-b border-slate-700">

                        <div className="flex items-center gap-2">

                            <Bot
                                className="text-cyan-400"
                                size={22}
                            />

                            <h2 className="text-cyan-400 font-bold text-lg">
                                Cloud Security AI
                            </h2>

                        </div>

                        <div className="flex items-center gap-3">

                            <button
                                onClick={clearChat}
                                title="Clear Chat"
                                className="text-slate-400 hover:text-yellow-400 transition"
                            >
                                <Trash2 size={20} />
                            </button>

                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white hover:text-red-400 transition"
                            >
                                <X size={22} />
                            </button>

                        </div>

                    </div>

                    {/* Messages */}

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">

                        {messages.length === 1 && (

                            <>
                                <p className="text-slate-400 text-sm">
                                    ⚡ Quick Actions
                                </p>

                                <div className="flex flex-wrap gap-2 mb-4">

                                    {quickQuestions.map((item) => (

                                        <button
                                            key={item}
                                            onClick={() => sendMessage(item)}
                                            className="bg-slate-800 hover:bg-cyan-600 px-3 py-2 rounded-full text-xs text-white transition"
                                        >
                                            {item}
                                        </button>

                                    ))}

                                </div>
                            </>

                        )}

                        {messages.map((msg, index) => (

                            <div
                                key={index}
                                className={`relative group p-3 rounded-xl whitespace-pre-wrap ${
                                    msg.sender === "user"
                                        ? "bg-cyan-600 ml-10 text-white"
                                        : "bg-slate-800 mr-10 text-slate-200"
                                }`}
                            >

                                {msg.text}

                                {msg.sender === "ai" && (

                                    <button
                                        onClick={() =>
                                            copyMessage(
                                                msg.text,
                                                index
                                            )
                                        }
                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition text-cyan-400 hover:text-white"
                                        title="Copy"
                                    >

                                        {copiedIndex === index ? (
                                            <Check size={16} />
                                        ) : (
                                            <Copy size={16} />
                                        )}

                                    </button>

                                )}

                            </div>

                        ))}

                        {loading && (

                            <div className="bg-slate-800 mr-10 rounded-xl p-3">

                                <div className="flex items-center gap-2">

                                    <Bot
                                        size={18}
                                        className="text-cyan-400"
                                    />

                                    <span className="text-slate-300 animate-pulse">
                                        AI is thinking...
                                    </span>

                                </div>

                            </div>

                        )}

                        <div ref={messagesEndRef} />

                    </div>

                    {/* Input */}

                    <div className="p-3 border-t border-slate-700 flex gap-2">

                        <input
                            className="flex-1 rounded-lg bg-slate-800 text-white px-3 py-2 outline-none"
                            placeholder="Ask anything..."
                            value={question}
                            onChange={(e) =>
                                setQuestion(e.target.value)
                            }
                            onKeyDown={(e) => {

                                if (e.key === "Enter") {

                                    sendMessage();

                                }

                            }}
                        />

                        <button
                            onClick={() => sendMessage()}
                            className="bg-cyan-500 hover:bg-cyan-600 px-4 rounded-lg text-white"
                        >
                            <Send size={18} />
                        </button>

                    </div>

                </div>

            )}
        </>
    );
}
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import playbookService from "../services/playbookService";

function VictimPortal() {
  const [email, setEmail] = useState("admin@acme.com");
  const [ip, setIp] = useState("192.168.1.105");
  const [password, setPassword] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [executionInfo, setExecutionInfo] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [location, setLocation] = useState("Chennai, IN");
  const [blockedType, setBlockedType] = useState("Brute Force");

  // Poll for target status every 2 seconds to reflect real-time playbook block
  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 2000);
    return () => clearInterval(interval);
  }, [email, ip]);

  const checkStatus = async () => {
    try {
      const data = await playbookService.getTargetStatus(ip, email);
      if (data && data.blocked) {
        setIsBlocked(true);
        const storedType = localStorage.getItem("blocked_type");
        if (storedType) {
          setBlockedType(storedType);
        }
      } else {
        setIsBlocked(false);
        localStorage.removeItem("blocked_type");
      }
    } catch (err) {
      console.error("Failed to fetch target status", err);
    }
  };

  const handleManualLogin = async (e) => {
    e.preventDefault();
    if (isBlocked) return;

    setLoading(true);
    setStatusMessage("");

    // Check login history for anomalous location within 24 hours
    const historyKey = `login_history_${email}`;
    const lastLogin = localStorage.getItem(historyKey);
    const now = new Date().getTime();

    if (lastLogin) {
      const lastLoginData = JSON.parse(lastLogin);
      // Verify if location is different AND password is the same AND within 24 hours
      if (lastLoginData.location !== location && lastLoginData.password === password && (now - lastLoginData.timestamp) < 24 * 60 * 60 * 1000) {
        setStatusMessage(`🚨 IMPOSSIBLE TRAVEL DETECTED: Account ${email} logged in from ${lastLoginData.location} and now from ${location} with the same credentials within 24 hours! Triggering Automated Playbook...`);
        await triggerUnauthorizedLogin();
        return;
      }
    }

    // Save login history
    localStorage.setItem(historyKey, JSON.stringify({ location, password, timestamp: now }));

    // Simulate normal failed password attempt after checking travel
    const newCount = failedAttempts + 1;
    setFailedAttempts(newCount);

    if (newCount >= 5) {
      setStatusMessage(`🚨 5 Failed login attempts from IP ${ip}! Triggering Cloud Security IP Block Playbook...`);
      await triggerBruteForce();
    } else {
      setStatusMessage(`❌ Invalid password for ${email}. Failed attempt ${newCount} of 5 from IP ${ip}. Logged in successfully from ${location} beforehand (change location next with the SAME password to trigger travel anomaly).`);
      setLoading(false);
    }
  };

  const triggerBruteForce = async () => {
    setLoading(true);
    try {
      localStorage.setItem("blocked_type", "Brute Force");
      setBlockedType("Brute Force");
      const result = await playbookService.simulateBruteForce(ip, email);
      setExecutionInfo(result);
      setIsBlocked(true);
      setStatusMessage(`🚨 BRUTE FORCE ATTACK CONTAINED: Source IP ${ip} & Account ${email} BLOCKED by Cloud Security SOC!`);
    } catch (err) {
      console.error("Simulation failed", err);
      setStatusMessage("Failed to execute playbook simulation.");
    } finally {
      setLoading(false);
    }
  };

  const triggerUnauthorizedLogin = async () => {
    setLoading(true);
    try {
      localStorage.setItem("blocked_type", "Unauthorized Login");
      setBlockedType("Unauthorized Login");
      const result = await playbookService.simulateUnauthorizedLogin(ip, email, location);
      setExecutionInfo(result);
      setIsBlocked(true);
      setStatusMessage(`🚨 UNAUTHORIZED LOGIN DETECTED: Source IP ${ip} & Account ${email} BLOCKED by Cloud Security SOC due to anomalous login from ${location}!`);
    } catch (err) {
      console.error("Simulation failed", err);
      setStatusMessage("Failed to execute playbook simulation.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      await playbookService.resetSimulation();
      setFailedAttempts(0);
      setIsBlocked(false);
      localStorage.removeItem("blocked_type");
      setExecutionInfo(null);
      setStatusMessage(`✅ Simulation reset. IP ${ip} and user ${email} unblocked successfully.`);
    } catch (err) {
      console.error("Reset failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: isBlocked 
        ? "radial-gradient(circle at center, #2a080c 0%, #0d0203 100%)" 
        : "radial-gradient(circle at center, #111827 0%, #030712 100%)",
      color: "#f3f4f6",
      fontFamily: "'Inter', sans-serif",
      display: "flex",
      flexDirection: "column",
      transition: "background 0.5s ease"
    }}>
      {/* Top Banner Navigation */}
      <header style={{
        padding: "16px 32px",
        background: "rgba(17, 24, 39, 0.8)",
        backdropFilter: "blur(12px)",
        borderBottom: isBlocked ? "1px solid #7f1d1d" : "1px solid #1f2937",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            background: isBlocked ? "#dc2626" : "linear-gradient(135deg, #2563eb, #7c3aed)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            fontSize: "18px"
          }}>
            {isBlocked ? "🚨" : "🏢"}
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#ffffff" }}>
              Acme Corp Secure Employee Portal
            </h1>
            <span style={{ fontSize: "12px", color: "#9ca3af" }}>
              Target Environment (Simulated Victim App)
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <Link to="/playbooks" style={{
            padding: "8px 16px",
            borderRadius: "6px",
            background: "#1f2937",
            color: "#3b82f6",
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: "600",
            border: "1px solid #374151",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            🛡️ Open Cloud Security SOC Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px"
      }}>
        {isBlocked ? (
          /* BLOCKED / LOCKED STATE UI OVERLAY */
          <div style={{
            maxWidth: "640px",
            width: "100%",
            background: "rgba(30, 10, 15, 0.9)",
            border: "2px solid #ef4444",
            borderRadius: "16px",
            padding: "36px",
            boxShadow: "0 0 60px rgba(239, 68, 68, 0.4)",
            backdropFilter: "blur(16px)",
            textAlign: "center"
          }}>
            <div style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "rgba(239, 68, 68, 0.15)",
              border: "2px solid #ef4444",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "40px",
              margin: "0 auto 20px auto"
            }}>
              🛑
            </div>

            <span style={{
              background: "#7f1d1d",
              color: "#fca5a5",
              padding: "4px 14px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: "800",
              letterSpacing: "1px",
              textTransform: "uppercase"
            }}>
              IP & USER CONTAINMENT ENFORCED
            </span>

            <h2 style={{ color: "#f87171", margin: "16px 0 8px 0", fontSize: "26px", fontWeight: "800" }}>
              FIREWALL IP BLOCK & ACCOUNT SUSPENSION
            </h2>

            <p style={{ color: "#d1d5db", fontSize: "15px", lineHeight: "1.6", marginBottom: "24px" }}>
              Traffic from source IP <strong style={{ color: "#ef4444", fontFamily: "monospace" }}>{ip}</strong> and target user account <strong style={{ color: "#ef4444" }}>{email}</strong> have been 
              <strong> BLOCKED</strong> due to a detected <span style={{ color: "#ef4444", fontWeight: "bold" }}>{blockedType === "Brute Force" ? "Brute Force Attack" : "Anomalous Login Location / Travel Pattern"}</span>.
            </p>

            <div style={{
              background: "rgba(15, 23, 42, 0.85)",
              border: "1px solid #374151",
              borderRadius: "12px",
              padding: "20px",
              textAlign: "left",
              marginBottom: "28px"
            }}>
              <h4 style={{ margin: "0 0 14px 0", color: "#9ca3af", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                🛡️ Cloud Security Playbook IP Containment Record
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", fontSize: "14px" }}>
                <div>
                  <span style={{ color: "#9ca3af" }}>Blocked Source IP:</span>
                  <div style={{ color: "#ef4444", fontFamily: "monospace", fontWeight: "bold", fontSize: "16px" }}>{ip}</div>
                </div>
                <div>
                  <span style={{ color: "#9ca3af" }}>Target Account:</span>
                  <div style={{ color: "#fca5a5", fontFamily: "monospace", fontWeight: "bold" }}>{email}</div>
                </div>
                <div>
                  <span style={{ color: "#9ca3af" }}>Firewall Action:</span>
                  <div style={{ color: "#60a5fa", fontWeight: "bold" }}>BLOCK_IP (Drop Traffic)</div>
                </div>
                <div>
                  <span style={{ color: "#9ca3af" }}>Triggered Playbook:</span>
                  <div style={{ color: "#34d399", fontWeight: "bold" }}>
                    {blockedType === "Brute Force" ? "Brute Force Response" : "Unauthorized Login Location Detection"}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleReset}
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                color: "#ffffff",
                border: "none",
                fontWeight: "700",
                fontSize: "15px",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(37, 99, 235, 0.4)",
                transition: "all 0.2s ease"
              }}
            >
              {loading ? "Resetting..." : `🔄 Reset Simulation & Unblock Account (${email})`}
            </button>
          </div>
        ) : (
          /* NORMAL TARGET LOGIN FORM */
          <div style={{
            maxWidth: "480px",
            width: "100%",
            background: "rgba(17, 24, 39, 0.75)",
            border: "1px solid #374151",
            borderRadius: "16px",
            padding: "36px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(12px)"
          }}>
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "24px", fontWeight: "800", margin: "0 0 8px 0" }}>
                Employee Single Sign-On
              </h2>
              <p style={{ fontSize: "14px", color: "#9ca3af", margin: 0 }}>
                Enter credentials to simulate login attempts
              </p>
            </div>

            {statusMessage && (
              <div style={{
                padding: "12px 16px",
                borderRadius: "8px",
                background: statusMessage.includes("🚨") || statusMessage.includes("❌") ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.15)",
                border: statusMessage.includes("🚨") || statusMessage.includes("❌") ? "1px solid #ef4444" : "1px solid #10b981",
                color: statusMessage.includes("🚨") || statusMessage.includes("❌") ? "#fca5a5" : "#6ee7b7",
                fontSize: "13px",
                marginBottom: "20px"
              }}>
                {statusMessage}
              </div>
            )}

            <form onSubmit={handleManualLogin}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", color: "#9ca3af", marginBottom: "6px", fontWeight: "600" }}>
                  Source IP Address (Attacker IP)
                </label>
                <input
                  type="text"
                  value={ip}
                  onChange={(e) => setIp(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    background: "#111827",
                    border: "1px solid #374151",
                    color: "#60a5fa",
                    fontFamily: "monospace",
                    fontSize: "14px",
                    fontWeight: "bold",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", color: "#9ca3af", marginBottom: "6px", fontWeight: "600" }}>
                  Work Email Address (Target Account)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    background: "#111827",
                    border: "1px solid #374151",
                    color: "#ffffff",
                    fontSize: "14px",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", color: "#9ca3af", marginBottom: "6px", fontWeight: "600" }}>
                  Login Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    background: "#111827",
                    border: "1px solid #374151",
                    color: "#ffffff",
                    fontSize: "14px",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "13px", color: "#9ca3af", marginBottom: "6px", fontWeight: "600" }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    background: "#111827",
                    border: "1px solid #374151",
                    color: "#ffffff",
                    fontSize: "14px",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
                padding: "10px 14px",
                background: "#1f2937",
                borderRadius: "8px",
                border: "1px solid #374151"
              }}>
                <span style={{ fontSize: "13px", color: "#9ca3af" }}>Failed Login Attempts:</span>
                <span style={{
                  padding: "2px 10px",
                  borderRadius: "12px",
                  background: failedAttempts > 3 ? "#7f1d1d" : "#374151",
                  color: failedAttempts > 3 ? "#fca5a5" : "#60a5fa",
                  fontWeight: "bold",
                  fontSize: "13px"
                }}>
                  {failedAttempts} / 5
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  background: "#3b82f6",
                  color: "#ffffff",
                  border: "none",
                  fontWeight: "700",
                  fontSize: "15px",
                  cursor: "pointer",
                  marginBottom: "16px"
                }}
              >
                {loading ? "Authenticating..." : "Sign In / Simulate Login"}
              </button>
            </form>

            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              borderTop: "1px solid #374151",
              paddingTop: "20px",
              marginTop: "10px"
            }}>
              <button
                type="button"
                onClick={triggerBruteForce}
                disabled={loading}
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  background: "linear-gradient(135deg, #dc2626, #b91c1c)",
                  color: "#ffffff",
                  border: "none",
                  fontWeight: "700",
                  fontSize: "12px",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(220, 38, 38, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px"
                }}
              >
                ⚡ Brute Force Simulation
              </button>
              <button
                type="button"
                onClick={triggerUnauthorizedLogin}
                disabled={loading}
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  background: "linear-gradient(135deg, #e11d48, #be123c)",
                  color: "#ffffff",
                  border: "none",
                  fontWeight: "700",
                  fontSize: "12px",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(225, 29, 72, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px"
                }}
              >
                📍 Travel Anomaly Simulation
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default VictimPortal;

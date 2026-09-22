import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Shield, 
  Activity, 
  Lock, 
  BarChart3, 
  FileText, 
  Database, 
  Cpu, 
  Server, 
  Layers, 
  Terminal, 
  ArrowRight, 
  Menu, 
  X, 
  CheckCircle, 
  User, 
  AlertTriangle, 
  BookOpen,
  LogIn,
  UserPlus
} from "lucide-react";

// Inline Github Icon to avoid lucide-react export mismatches
const GithubIcon = ({ size = 16, className }) => (
  <svg 
    viewBox="0 0 24 24" 
    width={size} 
    height={size} 
    fill="currentColor" 
    className={className}
    style={{ display: "inline-block", verticalAlign: "middle" }}
  >
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);
import "../styles/landing.css";

// Dynamic count-up counter component
const Counter = ({ value, duration = 2000 }) => {
  const [count, setCount] = useState("0");

  useEffect(() => {
    let startTimestamp = null;
    const numericValue = parseFloat(value.replace(/[^0-9.]/g, ""));
    const isPercentage = value.includes("%");
    const isPlus = value.includes("+");
    const isK = value.includes("K");
    const isSlash = value.includes("/"); // e.g., "24/7"

    if (isNaN(numericValue)) {
      setCount(value);
      return;
    }

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const current = progress * numericValue;
      
      let formatted = "";
      if (isPercentage) {
        formatted = current.toFixed(2) + "%";
      } else if (isSlash) {
        formatted = Math.floor(current) + "/7";
      } else {
        const floorVal = Math.floor(current);
        formatted = isK ? floorVal + "K" : floorVal;
        if (isPlus) formatted += "+";
      }
      
      setCount(formatted);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(value);
      }
    };

    window.requestAnimationFrame(step);
  }, [value, duration]);

  return <span>{count}</span>;
};

// Interactive network node canvas background
const CanvasBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", handleResize);

    const particles = [];
    const particleCount = Math.min(50, Math.floor((width * height) / 25000));

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.35;
        this.vy = (Math.random() - 0.5) * 0.35;
        this.radius = Math.random() * 1.5 + 1;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > width) this.vx = -this.vx;
        if (this.y < 0 || this.y > height) this.vy = -this.vy;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(6, 182, 212, 0.4)";
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    let mouse = { x: null, y: null };
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    const parent = canvas.parentElement;
    parent.addEventListener("mousemove", handleMouseMove);
    parent.addEventListener("mouseleave", handleMouseLeave);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(59, 130, 246, ${0.12 * (1 - dist / 130)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        if (mouse.x !== null && mouse.y !== null) {
          const dx = particles[i].x - mouse.x;
          const dy = particles[i].y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(6, 182, 212, ${0.2 * (1 - dist / 180)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      parent.removeEventListener("mousemove", handleMouseMove);
      parent.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="sc-hero-canvas" />;
};

function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Simulated live SOC security logs state
  const [logs, setLogs] = useState([
    { time: "18:28:10", type: "INFO", msg: "Cloud Security AI Engine initialized." },
    { time: "18:28:12", type: "SUCCESS", msg: "Database security connection established." },
    { time: "18:28:15", type: "WARN", msg: "Port scan detected from IP: 45.132.8.90." },
    { time: "18:28:18", type: "DANGER", msg: "XSS payload blocked on path '/auth/login'." }
  ]);

  const mockLogPool = [
    { type: "WARN", msg: "Unauthorized connection attempt on port 443" },
    { type: "INFO", msg: "API token validated for analyst_user_22" },
    { type: "DANGER", msg: "Potential brute force attack isolated from 198.51.100.4" },
    { type: "SUCCESS", msg: "Threat detection signatures auto-updated (+127 new rules)" },
    { type: "INFO", msg: "Database synchronization completed in 12ms" },
    { type: "SUCCESS", msg: "Response playbook #14 executed successfully" },
    { type: "WARN", msg: "Suspicious egress traffic spike observed on node-3" },
    { type: "DANGER", msg: "SQL injection payload stripped on endpoint /users/add" }
  ];

  // Rotate logs in real-time
  useEffect(() => {
    const logInterval = setInterval(() => {
      const randomLog = mockLogPool[Math.floor(Math.random() * mockLogPool.length)];
      const now = new Date();
      const timeStr = now.toTimeString().split(" ")[0];
      
      setLogs((prevLogs) => {
        const updatedLogs = [...prevLogs.slice(1), { time: timeStr, ...randomLog }];
        return updatedLogs;
      });
    }, 3000);

    return () => clearInterval(logInterval);
  }, []);

  // Smooth scroll handler
  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="sc-landing-root">
      {/* Navigation */}
      <nav className="sc-navbar">
        <div className="sc-navbar-inner">
          <Link to="/" className="sc-logo-container">
            <div className="sc-logo-row">
              <Shield size={24} className="sc-logo-accent" />
              <span className="sc-logo-text">
                Cloud<span className="sc-logo-accent">Security</span>
              </span>
            </div>
            <span className="sc-logo-subtitle">AI Security Platform</span>
          </Link>

          <div className="sc-nav-links">
            <a href="#home" onClick={(e) => { e.preventDefault(); scrollToSection("home"); }} className="sc-nav-link">Home</a>
            <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection("features"); }} className="sc-nav-link">Features</a>
            <a href="#technology" onClick={(e) => { e.preventDefault(); scrollToSection("technology"); }} className="sc-nav-link">Technology</a>
            <a href="#architecture" onClick={(e) => { e.preventDefault(); scrollToSection("architecture"); }} className="sc-nav-link">Architecture</a>
            <a href="#security" onClick={(e) => { e.preventDefault(); scrollToSection("security"); }} className="sc-nav-link">Security</a>
          </div>

          <div className="sc-nav-buttons">
            <Link to="/login" className="sc-btn sc-btn-outline sc-nav-auth-btn">
              <LogIn size={16} /> Login
            </Link>
            <Link to="/register" className="sc-btn sc-btn-accent sc-nav-auth-btn">
              <UserPlus size={16} /> Register
            </Link>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="sc-btn sc-btn-outline"
            >
              <GithubIcon size={16} /> GitHub
            </a>
          </div>

          <button 
            className="sc-menu-toggle" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      <div className={`sc-mobile-drawer ${mobileMenuOpen ? "sc-open" : ""}`}>
        <div className="sc-mobile-links">
          <a href="#home" onClick={(e) => { e.preventDefault(); scrollToSection("home"); }} className="sc-nav-link">Home</a>
          <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection("features"); }} className="sc-nav-link">Features</a>
          <a href="#technology" onClick={(e) => { e.preventDefault(); scrollToSection("technology"); }} className="sc-nav-link">Technology</a>
          <a href="#architecture" onClick={(e) => { e.preventDefault(); scrollToSection("architecture"); }} className="sc-nav-link">Architecture</a>
          <a href="#security" onClick={(e) => { e.preventDefault(); scrollToSection("security"); }} className="sc-nav-link">Security</a>
        </div>
        <div className="sc-mobile-buttons">
          <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="sc-btn sc-btn-outline" style={{ width: "100%" }}>
            <LogIn size={16} /> Login
          </Link>
          <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="sc-btn sc-btn-accent" style={{ width: "100%" }}>
            <UserPlus size={16} /> Register
          </Link>
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="sc-btn sc-btn-outline" 
            style={{ width: "100%" }}
          >
            <GithubIcon size={16} /> GitHub
          </a>
        </div>
      </div>

      {/* Hero Section */}
      <header id="home" className="sc-hero">
        <div className="sc-cyber-grid"></div>
        <div className="sc-hero-glow"></div>
        <CanvasBackground />

        <div className="sc-hero-container">
          <div className="sc-hero-content">
            <div className="sc-badge-ai">
              <span className="sc-badge-pulse"></span>
              AI-Powered Security Operations Center
            </div>
            <h1 className="sc-hero-title">
              Enterprise <span className="sc-text-highlight">Cybersecurity</span> Built for the Future.
            </h1>
            <p className="sc-hero-subtitle">
              Monitor threats, detect anomalies, automate incident response, generate enterprise reports, manage compliance, and secure modern infrastructure through one intelligent AI-powered Security Operations Center.
            </p>
            <div className="sc-hero-buttons">
              <button onClick={() => scrollToSection("features")} className="sc-btn sc-btn-primary">
                Explore Features <ArrowRight size={16} />
              </button>
              <button onClick={() => scrollToSection("architecture")} className="sc-btn sc-btn-outline">
                View Architecture
              </button>
            </div>
          </div>

          <div className="sc-hero-visual">
            <div className="sc-dashboard-mockup">
              <div className="sc-dashboard-header">
                <div className="sc-dashboard-dots">
                  <span className="sc-dashboard-dot sc-dot-red"></span>
                  <span className="sc-dashboard-dot sc-dot-yellow"></span>
                  <span className="sc-dashboard-dot sc-dot-green"></span>
                </div>
                <div className="sc-dashboard-title">CLOUD-SECURITY-SOC-CONSOLE</div>
                <div className="sc-dashboard-status">
                  <span className="sc-status-indicator"></span>
                  LIVE SCANNING
                </div>
              </div>

              <div className="sc-dashboard-body">
                {/* Stats */}
                <div className="sc-dashboard-stats">
                  <div className="sc-stat-mini">
                    <div className="sc-stat-mini-val sc-val-danger">147</div>
                    <div className="sc-stat-mini-label">Active Threats</div>
                  </div>
                  <div className="sc-stat-mini">
                    <div className="sc-stat-mini-val sc-val-warning">12</div>
                    <div className="sc-stat-mini-label">Crit Alerts</div>
                  </div>
                  <div className="sc-stat-mini">
                    <div className="sc-stat-mini-val sc-val-success">98%</div>
                    <div className="sc-stat-mini-label">Security Score</div>
                  </div>
                </div>

                {/* SVG Live Waveform Chart */}
                <div className="sc-chart-wrapper">
                  <div className="sc-chart-header">
                    <span className="sc-chart-title">Anomaly Detection Trend</span>
                    <span className="sc-chart-legend">Threat Volatility (60s)</span>
                  </div>
                  <svg viewBox="0 0 400 100" style={{ width: "100%", height: "80px", overflow: "visible" }}>
                    <defs>
                      <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path 
                      d="M 0,80 C 40,90 60,30 100,50 C 140,70 160,20 200,60 C 240,100 270,40 310,35 C 350,30 370,60 400,30" 
                      fill="none" 
                      stroke="#06B6D4" 
                      strokeWidth="2" 
                      strokeLinecap="round"
                    />
                    <path 
                      d="M 0,80 C 40,90 60,30 100,50 C 140,70 160,20 200,60 C 240,100 270,40 310,35 C 350,30 370,60 400,30 L 400,100 L 0,100 Z" 
                      fill="url(#chart-grad)"
                    />
                    {/* Glowing dots */}
                    <circle cx="200" cy="60" r="4" fill="#06B6D4" style={{ filter: "drop-shadow(0 0 6px #06B6D4)" }} />
                    <circle cx="310" cy="35" r="4" fill="#10B981" style={{ filter: "drop-shadow(0 0 6px #10B981)" }} />
                  </svg>
                </div>

                {/* Real-time Rolling Log Console */}
                <div className="sc-live-logs">
                  {logs.map((log, index) => (
                    <div key={index} className="sc-log-line">
                      <span className="sc-log-time">[{log.time}]</span>
                      <span className={`sc-log-tag ${
                        log.type === "DANGER" ? "sc-tag-danger" : 
                        log.type === "WARN" ? "sc-tag-warn" : 
                        log.type === "SUCCESS" ? "sc-tag-success" : "sc-tag-info"
                      }`}>
                        [{log.type}]
                      </span>
                      <span className="sc-log-text">{log.msg}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Security Mission / Evolving Threat Intelligence Section */}
      <section id="technology" className="sc-trust sc-section" style={{ position: "relative", overflow: "hidden", padding: "5rem 2rem" }}>
        <div className="sc-hero-glow" style={{ opacity: 0.4, top: "50%", transform: "translate(-50%, -50%)" }}></div>
        <div className="sc-section-header" style={{ maxWidth: "920px", margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <div className="sc-badge-ai" style={{ margin: "0 auto 1.5rem auto", display: "inline-flex" }}>
            <span className="sc-badge-pulse"></span>
            Evolving Threat Protection
          </div>
          <p className="sc-section-subtitle" style={{ fontSize: "1.35rem", lineHeight: "1.8", color: "#F1F5F9", fontWeight: 500, margin: 0 }}>
            Cyber threats are constantly evolving. Cloud Security gives your team the visibility, intelligence, and automation needed to detect threats early, protect critical assets, and maintain a strong security posture.
          </p>
        </div>
      </section>


      {/* Premium Features Section */}
      <section id="features" className="sc-section">
        <div className="sc-features-container">
          <div className="sc-section-header">
            <h2 className="sc-section-title">Comprehensive Security Capabilities</h2>
            <p className="sc-section-subtitle">
              Cloud Security provides complete visibility and defense-in-depth across your digital environment.
            </p>
          </div>

          <div className="sc-feature-grid">
            {[
              {
                title: "AI Threat Detection",
                desc: "Harness neural analysis to examine system logs in real-time, detecting anomalies and mitigating zero-day threats instantly.",
                icon: <Shield />
              },
              {
                title: "Real-Time Monitoring",
                desc: "Visualize attacks with interactive telemetry charts, low-latency live connection maps, and continuous system auditing.",
                icon: <Activity />
              },
              {
                title: "Role-Based Authentication",
                desc: "Secure operational bounds with cryptographically-signed JWT sessions separating Admins, Analysts, and Viewers.",
                icon: <Lock />
              },
              {
                title: "Compliance Dashboard",
                desc: "Verify structural alignment with enterprise auditing standards, tracking data modification history and permission updates.",
                icon: <CheckCircle />
              },
              {
                title: "Enterprise PDF Reports",
                desc: "Compile complete security postures, current threat volumes, and active incident details into executive-ready PDF documents.",
                icon: <FileText />
              },
              {
                title: "Knowledge Base",
                desc: "Access structured catalogues of Indicators of Compromise (IOC) and response playbooks for rapid operational resolutions.",
                icon: <BookOpen />
              }
            ].map((feat, idx) => (
              <div 
                key={idx} 
                className="sc-feature-card"
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  e.currentTarget.style.setProperty("--x", `${x}px`);
                  e.currentTarget.style.setProperty("--y", `${y}px`);
                }}
              >
                <div className="sc-feature-icon-wrapper">{feat.icon}</div>
                <h3 className="sc-feature-title">{feat.title}</h3>
                <p className="sc-feature-desc">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics counters section */}
      <section id="security" className="sc-stats">
        <div className="sc-stats-grid">
          <div className="sc-stat-card">
            <div className="sc-stat-number">
              <Counter value="99.99%" />
            </div>
            <div className="sc-stat-label">System Uptime</div>
          </div>
          <div className="sc-stat-card">
            <div className="sc-stat-number">
              <Counter value="100+" />
            </div>
            <div className="sc-stat-label">Assets Protected</div>
          </div>
          <div className="sc-stat-card">
            <div className="sc-stat-number">
              <Counter value="50K+" />
            </div>
            <div className="sc-stat-label">Security Events / s</div>
          </div>
          <div className="sc-stat-card">
            <div className="sc-stat-number">
              <Counter value="24/7" />
            </div>
            <div className="sc-stat-label">Threat Monitoring</div>
          </div>
        </div>
      </section>

      {/* Architecture Flow Section */}
      <section id="architecture" className="sc-section">
        <div className="sc-architecture-container">
          <div className="sc-section-header">
            <h2 className="sc-section-title">Cloud Security Operational Architecture</h2>
            <p className="sc-section-subtitle">
              How network telemetry travels through the Cloud Security stack from entry ingestion to threat resolution and reporting.
            </p>
          </div>

          <div className="sc-arch-flow">
            {[
              { title: "User / Telemetry Ingestion", desc: "API client request or server system event logs ingest into the secure gateway.", icon: <User /> },
              { title: "Authentication Shield", desc: "JWT validator enforces strict role checks (Admin, Analyst, Viewer) on incoming headers.", icon: <Lock /> },
              { title: "AI Threat Detection", desc: "Live anomaly engines scan payload signatures against current rules and IOC indexes.", icon: <Shield /> },
              { title: "SOC Dashboard", desc: "Aggregated threat intelligence updates live metric trends via low-latency WebSockets.", icon: <Activity /> },
              { title: "Incident Management", desc: "Critical anomalies prompt immediate triage queue listing for active analyst response.", icon: <AlertTriangle /> },
              { title: "Compliance Verification", desc: "Operations trigger automatic updates in DB audit tables to preserve verification history.", icon: <CheckCircle /> },
              { title: "PDF Reports Generator", desc: "Analysts compile findings into encrypted PDF templates with structural data tables.", icon: <FileText /> },
              { title: "Knowledge Base Registry", desc: "Resolved incidents push updated playbooks and IOC rules back to local databases.", icon: <Database /> }
            ].map((step, idx) => (
              <div key={idx} className="sc-arch-step">
                <span className="sc-arch-dot"></span>
                <div className="sc-arch-node">
                  <div className="sc-arch-icon-box">{step.icon}</div>
                  <div className="sc-arch-text-box">
                    <h4 className="sc-arch-title">{step.title}</h4>
                    <p className="sc-arch-desc">{step.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section className="sc-cta">
        <div className="sc-cta-glow"></div>
        <div className="sc-cta-container">
          <h2 className="sc-cta-title">Secure Your Organization with Cloud Security</h2>
          <p className="sc-cta-desc">
            Deploy automated artificial intelligence pipelines to monitor, isolate, and neutralize digital threats across your entire enterprise infrastructure today.
          </p>
          <div className="sc-cta-buttons">
            <Link to="/login" className="sc-btn sc-btn-primary">
              Get Started <ArrowRight size={16} />
            </Link>
            <a 
              href="mailto:support@cloudsecurity.com" 
              className="sc-btn sc-btn-outline"
            >
              Contact Security Team
            </a>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="sc-footer">
        <div className="sc-footer-container">
          <div className="sc-footer-logo-group">
            <span className="sc-footer-logo">
              Cloud<span className="sc-logo-accent">Security</span>
            </span>
            <span className="sc-footer-copy">
              © {new Date().getFullYear()} Cloud Security Inc. All rights reserved.
            </span>
          </div>

          <div className="sc-footer-links">
            <a href="#home" onClick={(e) => { e.preventDefault(); scrollToSection("home"); }} className="sc-footer-link">Documentation</a>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="sc-footer-link"
            >
              GitHub
            </a>
            <a href="#home" onClick={(e) => { e.preventDefault(); scrollToSection("home"); }} className="sc-footer-link">Privacy Policy</a>
            <a href="mailto:support@cloudsecurity.com" className="sc-footer-link">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;

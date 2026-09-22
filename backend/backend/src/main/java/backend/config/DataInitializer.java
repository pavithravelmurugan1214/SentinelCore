package backend.config;

import backend.entity.*;
import backend.repository.*;
import backend.service.PlaybookService;
import backend.service.SettingsService;
import backend.service.VulnerabilityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.context.annotation.Lazy;

@Component
@SuppressWarnings("null")
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    @Lazy
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ThreatRepository threatRepository;

    @Autowired
    private IOCRepository iocRepository;

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private AlertRepository alertRepository;

    @Autowired
    private AlertRuleRepository alertRuleRepository;

    @Autowired
    private KnowledgeBaseArticleRepository articleRepository;

    @Autowired
    private KnowledgeBaseRevisionRepository revisionRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private VulnerabilityService vulnerabilityService;

    @Autowired
    private PlaybookService playbookService;

    @Autowired
    private SettingsService settingsService;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        seedRoles();
        seedUsers();
        seedAssets();
        seedThreats();
        seedIOCs();
        seedAlertRules();
        seedAlerts();
        seedKnowledgeBase();
        seedNotifications();
        seedAuditLogs();
        playbookService.seedDefaultPlaybooks();
    }

    private void seedRoles() {
        for (String roleName : new String[]{"ADMIN", "ANALYST", "VIEWER"}) {
            if (roleRepository.findByName(roleName).isEmpty()) {
                roleRepository.save(Role.builder().name(roleName).build());
            }
        }
    }

    private void seedUsers() {
        Role adminRole = roleRepository.findByName("ADMIN").orElse(null);
        Role analystRole = roleRepository.findByName("ANALYST").orElse(null);

        if (adminRole != null) {
            if (userRepository.findByEmail("admin@sentinelcore.com").isEmpty()) {
                User admin = new User();
                admin.setName("System Administrator");
                admin.setEmail("admin@sentinelcore.com");
                admin.setPassword(passwordEncoder.encode("password123"));
                admin.setRole(adminRole);
                admin.setEnabled(true);
                userRepository.save(admin);
            }

            if (userRepository.findByEmail("admin@admin.com").isEmpty()) {
                User admin2 = new User();
                admin2.setName("Admin User");
                admin2.setEmail("admin@admin.com");
                admin2.setPassword(passwordEncoder.encode("password123"));
                admin2.setRole(adminRole);
                admin2.setEnabled(true);
                userRepository.save(admin2);
            }
        }

        if (analystRole != null) {
            if (userRepository.findByEmail("analyst@sentinelcore.com").isEmpty()) {
                User analyst = new User();
                analyst.setName("Lead SOC Analyst");
                analyst.setEmail("analyst@sentinelcore.com");
                analyst.setPassword(passwordEncoder.encode("password123"));
                analyst.setRole(analystRole);
                analyst.setEnabled(true);
                userRepository.save(analyst);
            }
        }
    }

    private void seedAssets() {
        if (assetRepository.count() == 0) {
            Asset dc = Asset.builder()
                    .assetId("AST-001")
                    .hostname("DC-PROD-01")
                    .assetName("Domain Controller Primary")
                    .ipAddress("10.0.1.10")
                    .macAddress("00:1A:2B:3C:4D:5E")
                    .deviceType("Server")
                    .operatingSystem("Windows Server 2022")
                    .osVersion("21H2")
                    .owner("Infrastructure Team")
                    .department("IT Ops")
                    .location("Data Center Alpha")
                    .environment("Production")
                    .criticality("CRITICAL")
                    .patchStatus("UPDATED")
                    .lastPatchDate(LocalDate.now().minusDays(10))
                    .lastSeen(LocalDateTime.now())
                    .status("ONLINE")
                    .riskScore(85)
                    .cpuUsage(42.5)
                    .ramUsage(78.0)
                    .diskUsage(55.2)
                    .totalStorage(1024.0)
                    .freeStorage(458.8)
                    .totalRam(64.0)
                    .agentInstalled(true)
                    .build();
            assetRepository.save(dc);

            Asset ws = Asset.builder()
                    .assetId("AST-002")
                    .hostname("WS-102-DEV")
                    .assetName("Developer Workstation 102")
                    .ipAddress("10.0.2.45")
                    .macAddress("00:1A:2B:3C:4D:5F")
                    .deviceType("Workstation")
                    .operatingSystem("Windows 11 Enterprise")
                    .osVersion("22H2")
                    .owner("John Doe")
                    .department("Engineering")
                    .location("HQ Office - Floor 3")
                    .environment("Development")
                    .criticality("MEDIUM")
                    .patchStatus("OUTDATED")
                    .lastPatchDate(LocalDate.now().minusDays(45))
                    .lastSeen(LocalDateTime.now())
                    .status("ONLINE")
                    .riskScore(62)
                    .cpuUsage(15.2)
                    .ramUsage(54.0)
                    .diskUsage(68.0)
                    .totalStorage(512.0)
                    .freeStorage(163.84)
                    .totalRam(32.0)
                    .agentInstalled(true)
                    .build();
            assetRepository.save(ws);

            Asset db = Asset.builder()
                    .assetId("AST-003")
                    .hostname("DB-CLUSTER-MAIN")
                    .assetName("Primary PostgreSQL Database Cluster")
                    .ipAddress("10.0.3.100")
                    .macAddress("00:1A:2B:3C:4D:60")
                    .deviceType("Database")
                    .operatingSystem("Ubuntu 22.04 LTS")
                    .osVersion("22.04.3")
                    .owner("Database Reliability Team")
                    .department("DevOps")
                    .location("Cloud Region US-East")
                    .environment("Production")
                    .criticality("CRITICAL")
                    .patchStatus("UPDATED")
                    .lastPatchDate(LocalDate.now().minusDays(5))
                    .lastSeen(LocalDateTime.now())
                    .status("ONLINE")
                    .riskScore(92)
                    .cpuUsage(68.4)
                    .ramUsage(88.5)
                    .diskUsage(72.1)
                    .totalStorage(2048.0)
                    .freeStorage(571.4)
                    .totalRam(128.0)
                    .agentInstalled(true)
                    .build();
            assetRepository.save(db);
        }
    }

    private void seedThreats() {
        if (threatRepository.count() == 0) {
            Threat t1 = new Threat();
            t1.setTitle("Emotet Botnet Campaign Activity");
            t1.setSeverity("Critical");
            t1.setSource("FireEye CTI Feed");
            t1.setStatus("Active");
            threatRepository.save(t1);

            Threat t2 = new Threat();
            t2.setTitle("Cobalt Strike Beacon Detection on Subnet B");
            t2.setSeverity("High");
            t2.setSource("CrowdStrike Falcon");
            t2.setStatus("Active");
            threatRepository.save(t2);

            Threat t3 = new Threat();
            t3.setTitle("APT29 Spearphishing Campaign Targeting Executive Emails");
            t3.setSeverity("High");
            t3.setSource("US-CERT Advisory");
            t3.setStatus("Investigating");
            threatRepository.save(t3);

            Threat t4 = new Threat();
            t4.setTitle("Ransomware Encryptor Payload Signature");
            t4.setSeverity("Critical");
            t4.setSource("VirusTotal Intelligence");
            t4.setStatus("Blocked");
            threatRepository.save(t4);
        }
    }

    private void seedIOCs() {
        if (iocRepository.count() == 0) {
            IOC i1 = new IOC();
            i1.setType("IP");
            i1.setValue("185.220.101.5");
            i1.setRiskLevel("Critical");
            i1.setSource("Tor Exit Node Intelligence");
            i1.setStatus("Active");
            iocRepository.save(i1);

            IOC i2 = new IOC();
            i2.setType("DOMAIN");
            i2.setValue("malicious-auth-portal.xyz");
            i2.setRiskLevel("High");
            i2.setSource("Phishing Feed API");
            i2.setStatus("Active");
            iocRepository.save(i2);

            IOC i3 = new IOC();
            i3.setType("HASH");
            i3.setValue("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
            i3.setRiskLevel("Critical");
            i3.setSource("VirusTotal Hash Feed");
            i3.setStatus("Active");
            iocRepository.save(i3);

            IOC i4 = new IOC();
            i4.setType("URL");
            i4.setValue("http://login-banking-update.com/reset");
            i4.setRiskLevel("High");
            i4.setSource("SOC Email Parser");
            i4.setStatus("Quarantined");
            iocRepository.save(i4);
        }
    }

    private void seedAlertRules() {
        if (alertRuleRepository.count() == 0) {
            AlertRule r1 = new AlertRule(null, "Brute Force Threshold Rule",
                    "Triggers when user fails authentication 5+ times in 5 minutes",
                    "AUTH_FAILURE", "THRESHOLD", 5, "High", true);
            alertRuleRepository.save(r1);

            AlertRule r2 = new AlertRule(null, "Malware Hash Execution Rule",
                    "Triggers when known malicious SHA-256 hash executes on endpoint",
                    "HASH_EXECUTION", "MATCH", 1, "Critical", true);
            alertRuleRepository.save(r2);

            AlertRule r3 = new AlertRule(null, "Impossible Travel GeoIP Rule",
                    "Triggers on logins from geographically conflicting locations within 1 hour",
                    "IMPOSSIBLE_TRAVEL", "GEO_VIOLATION", 1, "High", true);
            alertRuleRepository.save(r3);
        }
    }

    private void seedAlerts() {
        if (alertRepository.count() == 0) {
            Asset defaultAsset = assetRepository.findAll().stream().findFirst().orElse(null);

            Alert a1 = new Alert();
            a1.setTitle("Brute Force Attack Detected on Auth Gateway");
            a1.setSeverity("High");
            a1.setSource("Auth Service");
            a1.setStatus("Open");
            a1.setDescription("Multiple failed logins detected from IP 192.168.1.105 target: admin@acme.com");
            a1.setOccurrenceCount(12);
            a1.setLastOccurred(LocalDateTime.now().minusMinutes(15));
            a1.setAsset(defaultAsset);
            alertRepository.save(a1);

            Alert a2 = new Alert();
            a2.setTitle("Suspicious PowerShell Execution on WS-102");
            a2.setSeverity("Critical");
            a2.setSource("EDR Agent");
            a2.setStatus("Investigating");
            a2.setDescription("Encoded base64 payload executed from Temp directory by non-admin session.");
            a2.setOccurrenceCount(1);
            a2.setLastOccurred(LocalDateTime.now().minusHours(1));
            a2.setAsset(defaultAsset);
            alertRepository.save(a2);

            Alert a3 = new Alert();
            a3.setTitle("Phishing Email Reported by User admin@example.com");
            a3.setSeverity("Medium");
            a3.setSource("Email Gateway");
            a3.setStatus("Open");
            a3.setDescription("User submitted suspicious email with subject 'Urgent Invoice Payment Required'");
            a3.setEmailSender("spammer@phish-domain.com");
            a3.setEmailRecipient("admin@example.com");
            a3.setEmailSubject("Urgent Invoice Payment Required");
            a3.setEmailBody("Dear Customer, please verify your account immediately at http://login-banking-update.com/reset");
            a3.setEmailUrls("http://login-banking-update.com/reset");
            a3.setOccurrenceCount(3);
            a3.setLastOccurred(LocalDateTime.now().minusHours(3));
            a3.setAsset(defaultAsset);
            alertRepository.save(a3);
        }
    }

    private void seedKnowledgeBase() {
        if (articleRepository.count() == 0) {
            User creator = userRepository.findByEmail("admin@sentinelcore.com").orElse(null);

            KnowledgeBaseArticle kb1 = KnowledgeBaseArticle.builder()
                    .title("Standard Operating Procedure: Containing Brute Force Attacks")
                    .content("Step 1: Verify IP reputation on Threat Intel feeds.\nStep 2: Inject firewall block rule for target IP.\nStep 3: Revoke user active session tokens.\nStep 4: Force password reset and MFA re-enrollment.")
                    .type("RUNBOOK")
                    .version(2)
                    .createdBy(creator)
                    .build();
            KnowledgeBaseArticle saved1 = articleRepository.save(kb1);

            KnowledgeBaseRevision rev1 = KnowledgeBaseRevision.builder()
                    .articleId(saved1.getId())
                    .version(1)
                    .title("SOP: Handling Failed Logins")
                    .content("Initial draft for handling brute force authentication failures.")
                    .updatedBy(creator)
                    .updatedAt(LocalDateTime.now().minusDays(5))
                    .build();
            revisionRepository.save(rev1);

            KnowledgeBaseArticle kb2 = KnowledgeBaseArticle.builder()
                    .title("Incident Response Guide: Handling Endpoint Malware Infection")
                    .content("Step 1: Isolate compromised workstation from local network.\nStep 2: Extract binary SHA-256 hash and submit to VirusTotal.\nStep 3: Run EDR anti-malware quarantine routine.\nStep 4: Conduct memory dump and forensic audit.")
                    .type("POST_INCIDENT_REVIEW")
                    .version(1)
                    .createdBy(creator)
                    .build();
            articleRepository.save(kb2);
        }
    }

    private void seedNotifications() {
        // Disabled default mock notification seeding to prevent startup notification popups.
    }

    private void seedAuditLogs() {
        if (auditLogRepository.count() == 0) {
            User admin = userRepository.findByEmail("admin@sentinelcore.com").orElse(null);

            AuditLog log1 = new AuditLog();
            log1.setAction("SYSTEM_STARTUP");
            log1.setDescription("SentinelCore Cyber Security Platform initialized cleanly");
            log1.setTimestamp(LocalDateTime.now().minusHours(5));
            log1.setUser(admin);
            auditLogRepository.save(log1);

            AuditLog log2 = new AuditLog();
            log2.setAction("USER_LOGIN");
            log2.setDescription("User admin@sentinelcore.com logged in successfully");
            log2.setTimestamp(LocalDateTime.now().minusHours(4));
            log2.setUser(admin);
            auditLogRepository.save(log2);

            AuditLog log3 = new AuditLog();
            log3.setAction("CREATE_ALERT");
            log3.setDescription("New security alert generated: Brute Force Attack Detected");
            log3.setTimestamp(LocalDateTime.now().minusHours(2));
            log3.setUser(admin);
            auditLogRepository.save(log3);
        }
    }
}

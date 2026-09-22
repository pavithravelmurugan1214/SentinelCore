package backend.service;

import backend.dto.*;
import backend.entity.SystemSetting;
import backend.repository.SystemSettingRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class SettingsService {

    @Autowired
    private SystemSettingRepository systemSettingRepository;

    @PostConstruct
    public void initDefaultSettings() {
        seedIfMissing("ALERT_CRITICAL", "90", "Critical alert severity score threshold (0-100)");
        seedIfMissing("ALERT_HIGH", "70", "High alert severity score threshold (0-100)");
        seedIfMissing("AUTO_CREATE_INCIDENT", "true", "Automatically escalate critical alerts to Incidents");
        seedIfMissing("SMTP_HOST", "smtp.gmail.com", "SMTP server host address");
        seedIfMissing("SMTP_PORT", "587", "SMTP server port number");
        seedIfMissing("SMTP_EMAIL", "admin@sentinelcore.com", "System sender email address");
        seedIfMissing("SMTP_PASSWORD", "••••••••••••", "SMTP authentication password / token");
        seedIfMissing("EMAIL_ENABLED", "true", "Enable automated email notifications");
        seedIfMissing("WEBHOOK_ENABLED", "false", "Enable automated webhook alerts dispatch");
        seedIfMissing("WEBHOOK_URL", "http://localhost:8080/api/notifications/test-webhook", "Webhook endpoint URL for alerts integration");
        seedIfMissing("NOTIFICATION_THROTTLE_MINUTES", "5", "Min threshold between similar notifications to prevent alert storms");
        seedIfMissing("ALERT_ESCALATION_MINUTES", "10", "Unacknowledged Critical alert auto-escalation duration to Incident");
        seedIfMissing("LOG_RETENTION_DAYS", "90", "System log retention duration in days");
        seedIfMissing("AUDIT_RETENTION_DAYS", "180", "Audit log retention duration in days");
        seedIfMissing("ORGANIZATION_NAME", "SentinelCore", "Organization or tenant name");
        seedIfMissing("TIMEZONE", "Asia/Kolkata", "Default system timezone identifier");
    }

    private void seedIfMissing(String key, String defaultValue, String description) {
        if (systemSettingRepository.findByKey(key).isEmpty()) {
            SystemSetting setting = new SystemSetting(key, defaultValue, description, "SYSTEM");
            systemSettingRepository.save(setting);
        }
    }

    public String getValue(String key, String defaultValue) {
        return systemSettingRepository.findByKey(key)
                .map(SystemSetting::getValue)
                .orElse(defaultValue);
    }

    public void setValue(String key, String value, String updatedBy) {
        SystemSetting setting = systemSettingRepository.findByKey(key)
                .orElse(new SystemSetting(key, value, "", updatedBy));
        setting.setValue(value);
        setting.setUpdatedBy(updatedBy);
        systemSettingRepository.save(setting);
    }

    // ==========================================
    // ALERT SETTINGS
    // ==========================================
    public AlertSettingsDTO getAlertSettings() {
        int critical = Integer.parseInt(getValue("ALERT_CRITICAL", "90"));
        int high = Integer.parseInt(getValue("ALERT_HIGH", "70"));
        boolean autoCreate = Boolean.parseBoolean(getValue("AUTO_CREATE_INCIDENT", "true"));
        return new AlertSettingsDTO(critical, high, autoCreate);
    }

    public AlertSettingsDTO updateAlertSettings(AlertSettingsDTO dto, String updatedBy) {
        if (dto.getCriticalThreshold() == null || dto.getCriticalThreshold() < 0 || dto.getCriticalThreshold() > 100) {
            throw new IllegalArgumentException("Critical Threshold must be between 0 and 100");
        }
        if (dto.getHighThreshold() == null || dto.getHighThreshold() < 0 || dto.getHighThreshold() > 100) {
            throw new IllegalArgumentException("High Threshold must be between 0 and 100");
        }
        if (dto.getCriticalThreshold() <= dto.getHighThreshold()) {
            throw new IllegalArgumentException("Critical Threshold must be greater than High Threshold");
        }

        setValue("ALERT_CRITICAL", String.valueOf(dto.getCriticalThreshold()), updatedBy);
        setValue("ALERT_HIGH", String.valueOf(dto.getHighThreshold()), updatedBy);
        setValue("AUTO_CREATE_INCIDENT", String.valueOf(dto.getAutoCreateIncident() != null && dto.getAutoCreateIncident()), updatedBy);

        return getAlertSettings();
    }

    // ==========================================
    // NOTIFICATION SETTINGS
    // ==========================================
    public NotificationSettingsDTO getNotificationSettings() {
        boolean enabled = Boolean.parseBoolean(getValue("EMAIL_ENABLED", "true"));
        String host = getValue("SMTP_HOST", "smtp.gmail.com");
        int port = Integer.parseInt(getValue("SMTP_PORT", "587"));
        String email = getValue("SMTP_EMAIL", "admin@sentinelcore.com");
        String password = getValue("SMTP_PASSWORD", "••••••••••••");
        boolean webhookEnabled = Boolean.parseBoolean(getValue("WEBHOOK_ENABLED", "false"));
        String webhookUrl = getValue("WEBHOOK_URL", "http://localhost:8080/api/notifications/test-webhook");
        int throttleMinutes = Integer.parseInt(getValue("NOTIFICATION_THROTTLE_MINUTES", "5"));
        int escalationMinutes = Integer.parseInt(getValue("ALERT_ESCALATION_MINUTES", "10"));
        return new NotificationSettingsDTO(enabled, host, port, email, password, webhookEnabled, webhookUrl, throttleMinutes, escalationMinutes);
    }

    public NotificationSettingsDTO updateNotificationSettings(NotificationSettingsDTO dto, String updatedBy) {
        if (dto.getSmtpHost() == null || dto.getSmtpHost().trim().isEmpty()) {
            throw new IllegalArgumentException("SMTP Host is required");
        }
        if (dto.getSmtpPort() == null || dto.getSmtpPort() < 1 || dto.getSmtpPort() > 65535) {
            throw new IllegalArgumentException("SMTP Port must be between 1 and 65535");
        }
        if (dto.getSenderEmail() == null || !dto.getSenderEmail().contains("@")) {
            throw new IllegalArgumentException("Valid Sender Email address is required");
        }
        if (dto.getSenderPassword() == null || dto.getSenderPassword().trim().isEmpty()) {
            throw new IllegalArgumentException("Sender Password is required");
        }

        setValue("EMAIL_ENABLED", String.valueOf(dto.getEmailEnabled() != null && dto.getEmailEnabled()), updatedBy);
        setValue("SMTP_HOST", dto.getSmtpHost().trim(), updatedBy);
        setValue("SMTP_PORT", String.valueOf(dto.getSmtpPort()), updatedBy);
        setValue("SMTP_EMAIL", dto.getSenderEmail().trim(), updatedBy);
        if (!"••••••••••••".equals(dto.getSenderPassword())) {
            setValue("SMTP_PASSWORD", dto.getSenderPassword(), updatedBy);
        }
        setValue("WEBHOOK_ENABLED", String.valueOf(dto.getWebhookEnabled() != null && dto.getWebhookEnabled()), updatedBy);
        setValue("WEBHOOK_URL", dto.getWebhookUrl() != null ? dto.getWebhookUrl().trim() : "", updatedBy);
        setValue("NOTIFICATION_THROTTLE_MINUTES", String.valueOf(dto.getNotificationThrottleMinutes() != null ? dto.getNotificationThrottleMinutes() : 5), updatedBy);
        setValue("ALERT_ESCALATION_MINUTES", String.valueOf(dto.getAlertEscalationMinutes() != null ? dto.getAlertEscalationMinutes() : 10), updatedBy);

        return getNotificationSettings();
    }

    // ==========================================
    // DATA RETENTION SETTINGS
    // ==========================================
    public RetentionSettingsDTO getRetentionSettings() {
        int logRetention = Integer.parseInt(getValue("LOG_RETENTION_DAYS", "90"));
        int auditRetention = Integer.parseInt(getValue("AUDIT_RETENTION_DAYS", "180"));
        return new RetentionSettingsDTO(logRetention, auditRetention);
    }

    public RetentionSettingsDTO updateRetentionSettings(RetentionSettingsDTO dto, String updatedBy) {
        if (dto.getLogRetentionDays() == null || dto.getLogRetentionDays() < 30 || dto.getLogRetentionDays() > 3650) {
            throw new IllegalArgumentException("Log Retention Days must be between 30 and 3650 Days");
        }
        if (dto.getAuditRetentionDays() == null || dto.getAuditRetentionDays() < 30 || dto.getAuditRetentionDays() > 3650) {
            throw new IllegalArgumentException("Audit Retention Days must be between 30 and 3650 Days");
        }

        setValue("LOG_RETENTION_DAYS", String.valueOf(dto.getLogRetentionDays()), updatedBy);
        setValue("AUDIT_RETENTION_DAYS", String.valueOf(dto.getAuditRetentionDays()), updatedBy);

        return getRetentionSettings();
    }

    // ==========================================
    // SYSTEM SETTINGS
    // ==========================================
    public SystemSectionSettingsDTO getSystemSettings() {
        String orgName = getValue("ORGANIZATION_NAME", "Cloud Security");
        if ("SentinelCore".equalsIgnoreCase(orgName)) {
            orgName = "Cloud Security";
        }
        String tz = getValue("TIMEZONE", "Asia/Kolkata");
        return new SystemSectionSettingsDTO(orgName, tz);
    }

    public SystemSectionSettingsDTO updateSystemSettings(SystemSectionSettingsDTO dto, String updatedBy) {
        if (dto.getOrganizationName() == null || dto.getOrganizationName().trim().isEmpty()) {
            throw new IllegalArgumentException("Organization Name is required");
        }
        if (dto.getTimezone() == null || dto.getTimezone().trim().isEmpty()) {
            throw new IllegalArgumentException("Timezone is required");
        }

        setValue("ORGANIZATION_NAME", dto.getOrganizationName().trim(), updatedBy);
        setValue("TIMEZONE", dto.getTimezone().trim(), updatedBy);

        return getSystemSettings();
    }
}

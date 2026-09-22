package backend.service;

import backend.entity.AlertRule;
import backend.entity.User;
import backend.repository.AlertRuleRepository;
import backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@SuppressWarnings("null")
public class AlertRuleService {

    @Autowired
    private AlertRuleRepository alertRuleRepository;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        String email = authentication.getName();
        return userRepository.findByEmail(email).orElse(null);
    }

    // Get all rules (sorted by ID)
    public List<AlertRule> getAllRules() {
        return alertRuleRepository.findAllByOrderByIdAsc();
    }

    // Get rule by ID
    public Optional<AlertRule> getRuleById(Long id) {
        return alertRuleRepository.findById(id);
    }

    // Create new rule
    public AlertRule createRule(AlertRule alertRule) {
        AlertRule saved = alertRuleRepository.save(alertRule);
        auditLogService.createLog("CREATE_ALERT_RULE", "New alert rule created: " + saved.getName(), getCurrentUser(), null);
        return saved;
    }

    // Update existing rule
    public AlertRule updateRule(Long id, AlertRule updatedRule) {
        AlertRule existingRule = alertRuleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alert Rule not found"));

        existingRule.setName(updatedRule.getName());
        existingRule.setDescription(updatedRule.getDescription());
        existingRule.setEventType(updatedRule.getEventType());
        existingRule.setConditionType(updatedRule.getConditionType());
        existingRule.setThreshold(updatedRule.getThreshold());
        existingRule.setSeverity(updatedRule.getSeverity());
        existingRule.setEnabled(updatedRule.getEnabled());

        AlertRule saved = alertRuleRepository.save(existingRule);
        auditLogService.createLog("UPDATE_ALERT_RULE", "Alert rule updated: " + saved.getName() + " (Enabled: " + saved.getEnabled() + ")", getCurrentUser(), null);
        return saved;
    }

    // Delete rule
    public void deleteRule(Long id) {
        AlertRule rule = alertRuleRepository.findById(id).orElse(null);
        if (rule != null) {
            alertRuleRepository.delete(rule);
            auditLogService.createLog("DELETE_ALERT_RULE", "Alert rule deleted: " + rule.getName(), getCurrentUser(), null);
        }
    }
}
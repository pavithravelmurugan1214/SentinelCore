package backend.service;

import backend.entity.Alert;
import backend.entity.User;
import backend.repository.AlertRepository;
import backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@SuppressWarnings("null")
public class AlertService {

    @Autowired
    private AlertRepository alertRepository;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PlaybookService playbookService;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        String email = authentication.getName();
        return userRepository.findByEmail(email).orElse(null);
    }

    // Get All Alerts (sorted newest first by ID)
    public List<Alert> getAllAlerts() {
        return alertRepository.findAllByOrderByIdDesc();
    }

    // Get Alert By ID
    public Alert getAlertById(Long id) {
        return alertRepository.findById(id).orElse(null);
    }

    // Add Alert
    public Alert addAlert(Alert alert) {
        if (alert.getStatus() == null) {
            alert.setStatus("Open");
        }
        Alert saved = alertRepository.save(alert);
        auditLogService.createLog("CREATE_ALERT", "New alert created: " + saved.getTitle() + " (Severity: " + saved.getSeverity() + ")", getCurrentUser(), null);

        if (saved.getTitle() != null && 
            (saved.getTitle().toLowerCase().contains("phishing") || 
             "Phishing Simulator".equalsIgnoreCase(saved.getSource()) || 
             "Email Gateway".equalsIgnoreCase(saved.getSource()))) {
            try {
                playbookService.triggerPhishingPlaybook(saved);
            } catch (Exception e) {
                System.err.println("Failed to trigger phishing playbook automatically: " + e.getMessage());
            }
        }
        return saved;
    }

    // Update Alert
    public Alert updateAlert(Long id, Alert updatedAlert) {

        Alert alert = alertRepository.findById(id).orElse(null);

        if (alert != null) {

            alert.setTitle(updatedAlert.getTitle());
            alert.setSeverity(updatedAlert.getSeverity());
            alert.setSource(updatedAlert.getSource());
            alert.setStatus(updatedAlert.getStatus());
            alert.setDescription(updatedAlert.getDescription());

            Alert saved = alertRepository.save(alert);
            auditLogService.createLog("UPDATE_ALERT", "Alert updated: " + saved.getTitle() + " (Status: " + saved.getStatus() + ")", getCurrentUser(), null);
            return saved;
        }

        return null;
    }

    // Delete Alert
    public void deleteAlert(Long id) {
        Alert alert = alertRepository.findById(id).orElse(null);
        if (alert != null) {
            alertRepository.delete(alert);
            auditLogService.createLog("DELETE_ALERT", "Alert deleted: " + alert.getTitle(), getCurrentUser(), null);
        }
    }

    public Alert updateStatus(Long id, String status) {

        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alert not found"));

        String oldStatus = alert.getStatus();
        alert.setStatus(status);

        Alert saved = alertRepository.save(alert);
        auditLogService.createLog("UPDATE_ALERT", "Alert status updated from " + oldStatus + " to " + status + " for " + saved.getTitle(), getCurrentUser(), null);
        return saved;
    }

    public List<Alert> getAlertsByAsset(Long assetId) {
        return alertRepository.findByAssetId(assetId);
    }
}

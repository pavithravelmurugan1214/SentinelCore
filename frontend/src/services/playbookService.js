import api from "./api";

/**
 * Playbook Automation Module Axios API Integrations
 */
const playbookService = {
  
  // Get all playbooks
  getPlaybooks: async () => {
    const response = await api.get("/playbooks");
    return response.data;
  },

  // Get playbook configuration by ID
  getPlaybookById: async (id) => {
    const response = await api.get(`/playbooks/${id}`);
    return response.data;
  },

  // Get playbook execution statistics and history details
  getPlaybookDetails: async (id) => {
    const response = await api.get(`/playbooks/${id}/details`);
    return response.data;
  },

  // Create new playbook configuration
  createPlaybook: async (playbookData) => {
    const response = await api.post("/playbooks", playbookData);
    return response.data;
  },

  // Update existing playbook configuration
  updatePlaybook: async (id, playbookData) => {
    const response = await api.put(`/playbooks/${id}`, playbookData);
    return response.data;
  },

  // Delete playbook configuration
  deletePlaybook: async (id) => {
    const response = await api.delete(`/playbooks/${id}`);
    return response.data;
  },

  // Toggle active status
  togglePlaybookStatus: async (id) => {
    const response = await api.post(`/playbooks/${id}/toggle`);
    return response.data;
  },

  // Run playbook on a specific incident (Manual trigger)
  triggerPlaybook: async (playbookId, incidentId) => {
    const response = await api.post(`/playbooks/trigger`, {
      playbookId,
      incidentId,
    });
    return response.data;
  },

  // Get playbook execution history list
  getExecutionHistory: async () => {
    const response = await api.get("/playbooks/executions");
    return response.data;
  },

  // Get status details of a specific playbook execution
  getExecutionDetails: async (executionId) => {
    const response = await api.get(`/playbooks/executions/${executionId}`);
    return response.data;
  },

  // Get real-time execution logs for a playbook run
  getExecutionLogs: async (executionId) => {
    const response = await api.get(`/playbooks/executions/${executionId}/logs`);
    return response.data;
  },

  // Start playbook execution interactively
  startExecution: async (executionId) => {
    const response = await api.post(`/playbooks/executions/${executionId}/start`);
    return response.data;
  },

  // Execute or complete step of execution interactively
  executeStep: async (executionId, stepOrder) => {
    const response = await api.post(`/playbooks/executions/${executionId}/steps/${stepOrder}/execute`);
    return response.data;
  },

  // Simulate Brute Force Attack on Target Portal
  simulateBruteForce: async (ip = "192.168.1.105", username = "admin@acme.com") => {
    const response = await api.post(`/playbooks/simulate-brute-force?ip=${encodeURIComponent(ip)}&username=${encodeURIComponent(username)}`);
    return response.data;
  },

  // Simulate Unauthorized Login Attack on Target Portal
  simulateUnauthorizedLogin: async (ip = "185.220.101.5", username = "admin@acme.com", location = "Moscow, RU") => {
    const response = await api.post(`/playbooks/simulate-unauthorized-login?ip=${encodeURIComponent(ip)}&username=${encodeURIComponent(username)}&location=${encodeURIComponent(location)}`);
    return response.data;
  },

  // Check if target is blocked by Cloud Security Playbook
  getTargetStatus: async (ip = "192.168.1.105", username = "admin@acme.com") => {
    const response = await api.get(`/playbooks/target-status?ip=${encodeURIComponent(ip)}&username=${encodeURIComponent(username)}`);
    return response.data;
  },

  // Reset simulation state and unblock targets
  resetSimulation: async () => {
    const response = await api.post("/playbooks/reset-simulation");
    return response.data;
  },
};

export default playbookService;

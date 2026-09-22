# SentinelCore

SentinelCore is a Security Operations Center (SOC) platform.

Modules

- Authentication (JWT)
- Role Based Access Control
- Threat Management
- IOC Management
- Alert Engine
- Alert Rules
- Incident Management
- Playbook Automation
- Vulnerability Dashboard
- Notifications
- Audit Logs
- Asset Inventory

Alert Engine

The Alert Engine continuously monitors security events.

It evaluates Alert Rules.

If a rule matches:

- Create Alert
- Assign Severity
- Store in PostgreSQL
- Trigger Notification
- Write Audit Log

Severity Levels

Critical
High
Medium
Low

Incident Management

Incidents are created from Alerts.

Each Incident contains

- title
- description
- priority
- assignee
- status

Notifications

Notifications are sent using WebSocket.

Audit Logs

Every important action is stored in Audit Logs.

Playbooks

Playbooks automate security response.

Risk Scoring

Risk Score is calculated using

- Vulnerability Severity
- Threat Intelligence
- Asset Criticality

Database

PostgreSQL stores

Alerts

Incidents

Threats

Assets

Users

Audit Logs

Notifications
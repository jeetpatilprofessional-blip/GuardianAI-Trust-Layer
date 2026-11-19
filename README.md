# GuardianAI – AI Agent Governance Platform

> Independent portfolio prototype exploring governance, security controls, and observability for autonomous financial agents. This project is not affiliated with or endorsed by American Express (AMEX).

GuardianAI is a prototype control layer for autonomous AI agents in financial-style workflows. It demonstrates policy checks, risk signals, human review, explainability, and audit-oriented design. The repository does not establish production deployment, regulatory compliance, or real financial-institution integration.

---

## 🌟 Key Features

### 1. Multi-Agent Governance Pipeline
- **Sequential Multi-Agent Verification**: Every agent request evaluates through a pipeline of specialized agents:
  `AI Agent` ➔ `Fraud Layer` ➔ `Customer Verification Agent` ➔ `Compliance Agent (RBI / PCI-DSS)` ➔ `Adaptive Risk Engine` ➔ `Decision Gate` ➔ `Immutable Audit Store`.
- **Explainable AI (XAI) Timelines**: Interactive visual steppers displaying confidence scores (e.g. 98.7%), explainability indices (e.g. 96.0%), fraud score breakdowns, and policy enforcement rationale.

### 2. Conversational AI Governance Copilot
- **Natural Language Assistant**: Context-aware Copilot powered by real-time database queries (`/api/v1/copilot/chat`).
- **Context-Aware Desk Intelligence**: Automatically adapts inquiry suggestion chips based on the active desk (`Overview`, `Agents`, `Policies`, `Audit Trail`, `HITL Queue`, `Executive`, `Sandbox`, `Digital Twin`, `Monitoring`).
- **Direct Operational Triggers**: Performs actions like **Resume Agent**, **Update Limit**, **Open Audit Ledger**, and **Navigate to Desk** with full RBAC permission checks.

### 3. Dynamic AI Policy Recommendations
- **Auto-Refreshed Compliance Intelligence**: Panels auto-refresh every 30 seconds with live countdown timers and loading skeleton animations.
- **Priority Badges & Color Coding**: Cards categorized as `Critical` (Red), `High` (Orange), `Medium` (Blue), and `Low` (Green).
- **Interactive Actions**: Single-click `Apply` (with emerald toast feedback & dynamic policy limit updates), `Review` (deep inspection modal), `Schedule` (7-day review), and `Ignore`.

### 4. Enterprise Role-Based Access Control (RBAC) Matrix
Supports 9 distinct enterprise roles with strict sidebar menu filtering, direct URL route guards (`<AccessDenied>`), and lock icons (`🔒`) on restricted actions:

| Enterprise Role | Accessible Desks | Granted Operational Permissions | Enforced Restrictions |
| :--- | :--- | :--- | :--- |
| **Super Administrator** *(L5)* | All 9 Desks | Full CRUD, Deploy/Delete Policies, Pause/Resume/Delete Agents, HITL Approval, Emergency Kill, User Mgmt | None |
| **Security Administrator** *(L3)* | Overview, Agents, Policies, Audit Trail, Sandbox, Digital Twin, Monitoring | Pause/Resume Agents, Create/Edit/Deploy Security Policies, Run Sandbox & Digital Twin | Cannot delete agents, cannot delete policies, cannot approve HITL, cannot manage users |
| **Operations Manager** *(L3)* | Overview, Agents, HITL Queue, Audit Trail, Monitoring | Pause/Resume Agents, Manage running agents, Approve/Reject HITL | Cannot create/edit/delete policies, cannot access Sandbox/Digital Twin |
| **Compliance Officer** *(L4)* | Overview, Policies, Audit Trail, HITL Queue, Executive | Create/Edit/Deploy Compliance Policies, Approve HITL requests, View Audit Trail | Cannot manage agents, cannot access Monitoring, Sandbox, or Digital Twin |
| **Risk Analyst** *(L3)* | Overview, Agents *(View Only)*, Policies, Audit Trail, Sandbox, Digital Twin, Monitoring, Executive | Run Sandbox tests, Launch Digital Twin simulations, Fraud analysis | Read-only agents, cannot edit production policies, cannot approve HITL |
| **Human Reviewer (HITL)** | **HITL Queue ONLY** | Approve/Reject requests, add auditor sign-off notes | **All other 8 sidebar menus hidden** |
| **Executive (CEO)** | **Executive Dashboard ONLY** | Read-only KPIs, ROI business modeling, compliance index | **All operational controls hidden**, read-only mode |
| **DevOps Engineer** *(L4)* | Overview, Monitoring, Sandbox, Digital Twin | Restart services, View terminal tail, CPU/Memory telemetry | Cannot edit policies, cannot approve HITL, cannot manage users |
| **Auditor (Read Only)** | All 9 Desks | Read-only inspection, Export Reports, View Audit Logs | **All operational buttons disabled with lock icons (`🔒`)** |

---

## ⚡ Quick Start

### 1. Prerequisites
- **Python 3.10+**
- **Node.js 18+** & **npm**

### 2. Launch FastAPI Backend (Port 8000)
```bash
# Navigate to project directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Initialize & Seed Database (guardian_ai.db)
python init_db.py

# Launch FastAPI Server
python run.py
```
*FastAPI server runs on `http://localhost:8000` with interactive OpenAPI docs at `http://localhost:8000/docs`.*

### 3. Launch Vite Frontend (Port 5173)
```bash
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Build & Launch Development Server
npm run dev -- --port 5173
```
*Frontend application runs on `http://localhost:5173`.*

---

## 🌐 API Endpoint Reference

| Category | Endpoint | Method | Description |
| :--- | :--- | :--- | :--- |
| **Governance Engine** | `/api/v1/governance/request` | `POST` | Process transaction through multi-agent pipeline |
| **Governance Engine** | `/api/v1/governance/feedback` | `POST` | Submit HITL auditor sign-off override |
| **Copilot AI** | `/api/v1/copilot/chat` | `POST` | Natural language database-backed assistant query |
| **Agent Directory** | `/api/v1/agents/` | `GET / POST` | List or register AI agents |
| **Agent Directory** | `/api/v1/agents/{id}/resume` | `POST` | Resume paused agent |
| **Policy Manager** | `/api/v1/policies/` | `GET / POST` | Manage governance policy configurations |
| **Policy Manager** | `/api/v1/policies/simulate` | `POST` | Pre-simulate policy against historical transaction logs |
| **Policy Manager** | `/api/v1/policies/recommendations` | `GET` | List dynamic AI policy recommendations |
| **Sandbox** | `/api/v1/sandbox/test` | `POST` | Execute custom payload assertions |
| **Digital Twin** | `/api/v1/digital-twin/stream` | `GET` | Stream live telemetry for cyberattack simulations |

---

## 🎨 Theme & Aesthetic Features
- **High-Contrast Dark Mode & Crisp Light Mode**: Persistent theme switcher with custom `.light-mode` high-contrast CSS design tokens.
- **Glassmorphism & Micro-Animations**: Smooth 200ms transitions, hover card elevation, and pulse status rings.
- **Non-Blurring Overlay Drawer**: Governance Copilot drawer operates as a floating side-drawer with zero backdrop blur in Light Mode.

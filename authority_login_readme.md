# 🏛️ JanSetu Municipal Authority Portal & Governance Documentation

This document provides a comprehensive reference of all **Categorized Municipal Officer Login Credentials**, administrative responsibilities, monitoring systems, analytics dashboards, and accountability audit workflows in the JanSetu Civic Intelligence Platform.

---

## 📌 Executive Summary

In JanSetu, the **Municipal Authority Portal** (`/#/authority/login`) acts as the high-level **Command & Governance Center**.

To log in, a Municipal Officer must select/enter:
1. **Officer Email or Employee ID**
2. **Password**
3. **Assigned Department**

If the credentials and assigned department match, the officer is authenticated and granted access to the command center.

---

## 🔑 Categorized Municipal Officer Accounts & Staging Credentials

| Department Category | Officer Name | Officer Email | Employee ID | Password | Role |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 🔥 **Fire & Emergency Services** | **Ketan Patel** | `fire.officer@jansetu.gov.in` | `AUTH-FIRE-01` | `FireOfficer@123` | `AUTHORITY` |
| ⚡ **Electricity & Power Board** | **Rajesh Varma** | `power.officer@jansetu.gov.in` | `AUTH-POWER-01` | `PowerOfficer@123` | `AUTHORITY` |
| 🛣️ **Roads & Infrastructure** | **Anil Kumar** | `roads.officer@jansetu.gov.in` | `AUTH-ROADS-01` | `RoadsOfficer@123` | `AUTHORITY` |
| 🗑️ **Solid Waste Management** | **Sunita Rao** | `waste.officer@jansetu.gov.in` | `AUTH-WASTE-01` | `WasteOfficer@123` | `AUTHORITY` |
| 💧 **Jal Board / Water Works** | **Suresh Patil** | `water.officer@jansetu.gov.in` | `AUTH-WATER-01` | `WaterOfficer@123` | `AUTHORITY` |
| 🚦 **Traffic & Transport** | **Vikramaditya Sharma** | `traffic.officer@jansetu.gov.in` | `AUTH-TRAFFIC-01` | `TrafficOfficer@123` | `AUTHORITY` |
| 🏛️ **City-Wide Governance HQ** | **Dr. Rameshwar Rao** | `chief.officer@jansetu.gov.in` | `AUTH-HQ-01` | `ChiefOfficer@123` | `AUTHORITY` |

---

## 🛡️ Core Responsibilities & Features of Authority Officers

1. **Direct Dispatch Governance & Worker Oversight**:
   - Monitor complaints auto-routed to field workers based on AI vision and audio diagnostics.
   - Audit worker task acceptance times, resolution efficiency, and completion quality.
   - Inspect all issues marked as **`REJECTED_BY_WORKER` (Not Genuine)** to safeguard citizen complaints.

2. **High-Priority Hazard Management**:
   - Priority queue alerts for **`CRITICAL`** cases (Fire Outbreaks, Gas Leaks, Transformer Sparks, Structural Collapses).
   - Override worker queues or reassign emergency tasks to specialist backup technicians.

3. **Verification & Reopened Issue Review**:
   - Monitor citizen feedback on resolved fixes.
   - Investigate **`REOPENED`** issues where citizens reported incomplete or unsatisfied repair work.

4. **Sector Resource & Staffing Allocation**:
   - Analyze department workload density across Hyderabad / Telangana municipal sectors.
   - Shift field worker resources to recurring problem areas or high-urgency zones.

---

## 📊 Command Dashboards & Analytics Tools

1. **🎛️ Priority Queue Command Center (`/authority`)**: Live queue with AI Priority Scores (0–100) and issue urgency counts.
2. **🚨 SLA Escalation & Incident Center (`/authority/escalations`)**: Monitoring 24s SLA countdown breaches, automatic worker reassignments, emergency bonuses (₹150), and reopened complaints.
3. **🗺️ Sector GIS Interactive Map View (`/authority/map`)**: Interactive tile map showing exact geographic pins for active complaints across municipal sectors.
4. **📈 Civic Intelligence Analytics (`/authority/analytics`)**: Response SLAs, median resolution hours, category breakdowns, and AI-generated operational recommendations.
5. **🛡️ Field Worker Accountability Scoreboard**: Real-time worker audit table tracking completed vs active vs rejected tasks per technician, along with a log of all worker rejections and verbatim explanation notes.

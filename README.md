# JANSETU (जनसेतु) — Next-Gen AI Civic Intelligence Network

> **Empowering Communities. Accelerating Resolution. Guaranteeing Accountability.**

JanSetu is an end-to-end, AI-powered civic technology platform engineered to bridge the gap between citizens, municipal authorities, and field maintenance crews. By replacing traditional slow, opaque complaint portals with multi-agent AI vision classification, dynamic severity scoring, automated department dispatch, worker proof-of-work validation, and citizen verification, JanSetu turns raw civic reports into verified, accountable real-world solutions.

---

## 🚀 Core Value Proposition: `RESOLVED ≠ CLOSED`

In traditional civic portals, authorities can unilaterally mark a complaint as "Resolved" without physical evidence or citizen validation, leading to false closures and public distrust. 

**JanSetu introduces mandatory Citizen Verification:**

```
                                      ┌───────────────────────────────────────────────────────────┐
                                      │              JANSETU CIVIC FLOW PIPELINE                  │
                                      └───────────────────────────────────────────────────────────┘

 [ CITIZEN REPORT ] ──► [ MULTI-KEY GEMINI VISION AI ] ──► [ DUP CHECK & SEVERITY ] ──► [ AUTHORITY COMMAND ]
   Photo + GPS + Voice     Categorization & Analysis         Spatial Proximity Risk        Department Auto-Assign
                                                                                                     │
                                                                                                     ▼
 [ CLOSED & VERIFIED ] ◄── [ CITIZEN VERIFICATION ] ◄── [ WORKER PROOF OF WORK ] ◄── [ WORKER DISPATCH ]
   Confetti & Analytics      Accept 🟢 / Reject 🔴        Photo Evidence + Notes      Mobile Task Assignment
```

1. **Worker Resolution**: Field workers must submit photo evidence of completed physical repairs.
2. **Citizen Inspection**: The citizen inspects before/after photos and accepts or rejects the repair.
3. **Reopen Safeguard**: If rejected, the ticket reopens instantly with high priority (`REOPENED` status), preserving a tamper-proof audit log.

---

## 🌟 Key Platform Features

### 🤖 1. Multi-Agent AI Vision & Multimodal Intelligence
- **Google Gemini 3.7 Flash Vision API**: Analyzes uploaded issue photos, extracts visual damage descriptions, automatically categorizes issues (Road Damage, Water Leakage, Fire Hazard, Garbage, Electrical Defect, Drainage, Streetlight), assesses severity (0–100 score), and calculates urgency priority.
- **Fail-Safe Key Rotation Pool**: Manages a 5-key fallback rotation (`GEMINI_API_KEY_1` through `GEMINI_API_KEY_5`) to withstand API rate limits (HTTP 429) or temporary spikes (HTTP 503).
- **Secondary AI Fallback (Groq Llama 3 70B)**: Auto-triggers if all Gemini API keys fail.
- **Stage 3 Deterministic Rule Engine**: Smart fallback ensuring 100% operational uptime and reliable departmental routing even during global network outages.
- **Out of Context Filter**: Automatically identifies non-civic photos (selfies, documents, pets, personal items) and flags them as `OUT OF CONTEXT` with high confidence.

### 📍 2. Spatial Duplicate Engine & Interactive GIS Map
- **Geospatial Duplicate Matrix**: Uses MongoDB geospatial indexing and Haversine distance matrix formulas to scan within a 300-meter radius for existing complaints in the same category.
- **Interactive GIS Map & Sticky Hover Cards**: Real-time Leaflet map displaying active civic incidents across departments with detailed hover tooltips showing:
  - **Reporter Name & Mobile**: Who filed the complaint.
  - **Timestamps & Relative Age**: Exact creation time and humanized age (e.g., `2 hrs ago`, `Just now`).
  - **Criticality & Urgency**: Visual priority badge (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).
  - **Worker Assignment Status**: Shows assigned maintenance worker or `Unassigned`.

### 🎙️ 3. Multimodal Voice & Audio Issue Reporting
- **Web Speech API Voice-to-Text**: Built-in voice dictation allowing citizens to describe issues hands-free in multiple regional languages.
- **Canvas Image Compression Engine**: Automatically scales user photos to `<=1200px` at `0.85` JPEG quality on the client side before upload, optimizing network bandwidth and memory footprint.

### 🏛️ 4. Municipal Authority Command Center
- **AI-Prioritized Work Queue**: Sorts incoming complaints dynamically by urgency score, duplicate risk, and SLA deadlines.
- **Manual Overrides**: Department heads can override AI classifications, change assigned workers, or escalate priority.
- **Automated Reassignment Daemon**: Background worker monitors unattended tickets and auto-escalates unresolved issues after 24 hours.
- **Live Analytical Insights**: Aggregates response SLAs, median resolution hours, department-level performance metrics, and hotspot activity maps.

### 👷 5. Field Worker Mobile & Web Portal
- **Real-Time Task Dashboard**: Workers view assigned jobs, navigate via location coordinates, and review AI diagnostic notes.
- **Proof-of-Work Upload**: Workers capture and submit mandatory resolution photos before moving tickets to `RESOLVED` status.

### 📲 6. Citizen Experience & Mobile Native App
- **Web & Mobile (Expo/React Native)**: Multi-platform access for citizens to capture photos, pinpoint GPS locations, track real-time resolution status, and verify completed work.
- **Twilio SMS OTP Authentication**: Instant OTP login with Twilio SMS integration and fallback development modes.
- **Interactive Verification**: Before/After photo comparison slider with confetti celebrations upon verification.

### 🎨 7. Spacious & Responsive Glassmorphic Interface
- **Modern Design System**: Polished glassmorphism styling, clean dark/light mode balance, and micro-animations.
- **Spacious Responsive Navbar**: Designed with 78px height, generous 24px link gaps, contextual authority role badges, and unified 38px utility buttons across screens.

---

## 🛠️ Technology Stack

| Tier | Technologies |
| :--- | :--- |
| **Frontend Web** | React 19, Vite, Lucide Icons, Canvas Confetti, Leaflet GIS Maps, Vanilla CSS Tokens |
| **Mobile Native App** | React Native, Expo (iOS & Android), TailwindCSS (NativeWind), Camera & Geolocation |
| **Backend REST API** | Node.js (ES Modules), Express.js, Mongoose ODM, JWT Authentication |
| **Database** | MongoDB Atlas / Mongoose (with `mongodb-memory-server` in-memory fallback) |
| **AI & Vision** | Google Gemini 3.7 Flash API, Groq Llama 3 70B, Deterministic Rule Engine |
| **SMS & Auth** | Twilio Verify API & Twilio Programmable SMS |

---

## 📁 Repository Structure

```
JanSetu/
├── backend/                        # Express.js REST API & AI Engine
│   ├── public/                     # Local photo evidence storage (`public/photos`)
│   ├── src/
│   │   ├── ai/                     # Multi-Agent AI Engine (Gemini, Groq, Prompts, Schemas)
│   │   ├── analytics/              # SLA Aggregations & Performance Metrics
│   │   ├── auth/                   # JWT & Twilio OTP Controllers
│   │   ├── authority/              # Command Center & Management APIs
│   │   ├── citizen/                # Citizen Complaint & Verification APIs
│   │   ├── department/             # Department Management APIs
│   │   ├── issues/                 # Issue State Machine & CRUD Controllers
│   │   ├── models/                 # Mongoose Data Schemas (User, Issue, Notification, Audit)
│   │   ├── notifications/          # Real-time Event Notification Services
│   │   ├── services/               # Background Daemons (Auto-reassignment escalation worker)
│   │   └── worker/                 # Worker Operations & Resolution Proof APIs
│   ├── .env                        # Environment Variables Configuration
│   ├── package.json
│   └── server.js                   # Application Entry Point
│
├── frontend/                       # React 19 Web Platform
│   ├── src/
│   │   ├── citizen/                # Citizen Portal Pages (Home, Report, Track, Feed)
│   │   ├── services/               # API Client, Auth Provider, Speech Service
│   │   ├── shared/                 # Navbar, MapContainer, Modals, Cards, Badges, i18n
│   │   └── styles/                 # Glassmorphic Design System & Tokens
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── mobile-app/                     # Expo / React Native App (iOS & Android)
│   ├── App.tsx                     # Native Mobile Entry Point
│   ├── src/                        # Screens, Navigation & Components
│   └── package.json
│
├── docs/                           # Comprehensive Architecture & API Documentation
└── README.md                       # Master Documentation
```

---

## ⚡ Quick Start & Local Setup Guide

### Prerequisites
- Node.js `v18.x` or higher
- npm `v9.x` or higher
- Git

### 1. Clone Repository
```bash
git clone https://github.com/rohanforgit/JanSetu.git
cd JanSetu
```

### 2. Configure Environment Files

**Backend Environment (`backend/.env`):**
```env
PORT=5001
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/jansetu?retryWrites=true&w=majority
GEMINI_API_KEY=your_gemini_api_key_1
GEMINI_API_KEY_2=your_gemini_api_key_2
GROQ_API_KEY=your_groq_api_key
JWT_SECRET=jansetu_super_secret_jwt_key_2026
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_VERIFY_SERVICE_SID=your_twilio_verify_service_sid
```

**Frontend Environment (`frontend/.env`):**
```env
VITE_API_BASE_URL=http://localhost:5001/api
```

### 3. Install Dependencies
```bash
# Install Backend Dependencies
cd backend
npm install

# Install Frontend Dependencies
cd ../frontend
npm install

# Install Mobile App Dependencies (Optional)
cd ../mobile-app
npm install
```

### 4. Seed Demo Data & Launch

```bash
# 1. Seed Demo Data (in backend directory)
cd backend
npm run seed

# 2. Start Backend API Server
npm run dev
```
*Backend API server runs on `http://localhost:5001`*

```bash
# 3. Start Frontend Web Application (in frontend directory)
cd ../frontend
npm run dev
```
*Frontend web app runs on `http://localhost:5173`*

---

## 🔐 Demo Credentials

Use the pre-seeded credentials below to test each role in the system:

| Portal Role | Access URL | Credentials |
| :--- | :--- | :--- |
| 🧑‍🦱 **Citizen Portal** | `http://localhost:5173/#/citizen/login` | **Phone**: `9876543210`<br>**OTP**: `123456` |
| 🏛️ **Authority Command Center** | `http://localhost:5173/#/authority/login` | **Employee ID**: `AUTH-001`<br>**Password**: `Password123!` |
| 🚒 **Fire Officer (Authority)** | `http://localhost:5173/#/authority/login` | **Employee ID**: `AUTH-FIRE-01`<br>**Password**: `Password123!` |
| 👷 **Field Worker Portal** | `http://localhost:5173/#/worker/login` | **Employee ID**: `worker-004`<br>**Password**: `Password123!` |

---

## 🌐 How to Deploy a New Backend & Frontend

Follow this guide to deploy your backend and frontend to any cloud provider.

### 1. Database Setup (MongoDB Atlas)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a Cluster (Free M0 or Paid).
2. Create a Database User with read/write access.
3. Under **Network Access**, add IP `0.0.0.0/0` (Allow Access from Anywhere).
4. Copy your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxx.mongodb.net/jansetu?retryWrites=true&w=majority
   ```

---

### 2. Deploying a New Backend (Render / Railway / AWS / DigitalOcean)

#### Option A: Render Web Service (Recommended)
1. Log in to [Render](https://render.com/) and click **New + ➔ Web Service**.
2. Connect your GitHub repository (`rohanforgit/JanSetu`).
3. Configure settings:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
4. Add Environment Variables under **Environment**:
   - `PORT` = `5001`
   - `MONGODB_URI` = `<your_mongodb_atlas_connection_string>`
   - `GEMINI_API_KEY` = `<your_gemini_api_key>`
   - `GROQ_API_KEY` = `<your_groq_api_key>`
   - `JWT_SECRET` = `jansetu_super_secret_jwt_key_2026`
5. Click **Create Web Service**. Render will output your live URL (e.g. `https://your-backend.onrender.com`).

---

### 3. Deploying a New Frontend (Vercel / Netlify / Cloudflare Pages)

#### Option A: Vercel Project (Recommended)
1. Log in to [Vercel](https://vercel.com/) and click **Add New ➔ Project**.
2. Import your GitHub repository (`rohanforgit/JanSetu`).
3. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable under **Environment Variables**:
   - `VITE_API_BASE_URL` = `https://your-backend.onrender.com/api`
5. Click **Deploy**. Vercel will build your project and generate your production URL (e.g. `https://jansetu.vercel.app`).

*Note: The frontend code automatically auto-detects `*.vercel.app` hostnames as a fallback if `VITE_API_BASE_URL` is omitted.*

---

### 4. Deploying Mobile App (Expo EAS)
```bash
cd mobile-app
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

---

## 📊 Database Schemas & Core Data Models

### Issue Schema (`Issue.js`)
```typescript
{
  issueId: String, // e.g. JAN-SEP-2026-9412
  title: String,
  description: String,
  category: "Road Damage" | "Water Leakage" | "Garbage" | "Drainage" | "Streetlight" | "Electrical Hazard" | "Fire Hazard" | "Other",
  department: String,
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  priority: Number, // 0 to 100
  status: "REPORTED" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | "REOPENED",
  location: {
    address: String,
    area: String,
    landmark: String,
    latitude: Number,
    longitude: Number
  },
  evidence: [String], // Array of photo URLs or base64
  resolutionEvidence: {
    photoUrl: String,
    notes: String,
    resolvedAt: Date
  },
  verification: {
    verifiedByCitizen: Boolean,
    citizenNotes: String,
    verifiedAt: Date
  },
  reporter: {
    userId: String,
    name: String,
    mobile: String
  },
  assignedWorker: {
    id: String,
    name: String,
    role: String,
    phone: String,
    assignedAt: Date
  },
  timeline: Array
}
```

---

## 🌐 API Route Specifications

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/citizen/send-otp` | Request OTP for mobile login | No |
| `POST` | `/api/auth/citizen/verify-otp` | Verify OTP & receive JWT | No |
| `POST` | `/api/auth/authority/login` | Municipal authority login | No |
| `POST` | `/api/issues/preview-analyze` | Unauthenticated AI Vision analysis preview | No |
| `POST` | `/api/issues` | Submit civic complaint & run AI Vision | Optional |
| `GET` | `/api/issues` | Fetch all active civic issues | No |
| `GET` | `/api/issues/:issueId` | Fetch single issue details by ID | No |
| `GET` | `/api/authority/issues` | Fetch authority work queue with SLA status | Authority JWT |
| `PUT` | `/api/authority/issues/:id/assign` | Assign worker to an issue | Authority JWT |
| `GET` | `/api/worker/tasks` | Fetch assigned tasks for field worker | Worker JWT |
| `POST` | `/api/worker/tasks/:id/resolve` | Submit photo evidence & mark resolved | Worker JWT |
| `POST` | `/api/citizen/issues/:id/verify` | Citizen accepts or rejects resolution | Citizen JWT |
| `GET` | `/api/authority/analytics/summary` | Fetch municipal SLA & performance analytics | Authority JWT |

---

## 🗺️ Roadmap & Recommended Next Steps

1. **Cloud Object Storage (S3 / Cloudinary / Supabase Storage)**:
   - Transition `backend/public/photos/` local file storage to S3 or Cloudinary for multi-region serverless scaling.
2. **Real-Time WebSockets (`Socket.io`)**:
   - Upgrade REST polling to WebSocket subscriptions for live field worker GPS tracking and immediate authority alerts.
3. **Native Mobile Push Notifications**:
   - Integrate `expo-notifications` for real-time background phone alerts when ticket status changes.
4. **Civic Karma Points & Gamification**:
   - Reward citizens with civic karma badges and public recognition for verified, non-duplicate community problem reports.

---

## 🛡️ License & Acknowledgments

Built for modern civic governance and transparent public infrastructure maintenance. Developed with Node.js, Express, React 19, Expo, Leaflet GIS, and Google Gemini 3.7 Flash AI.

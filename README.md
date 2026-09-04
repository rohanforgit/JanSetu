# JANSETU (जनसेतु) — Next-Gen Civic Intelligence Network

> **Empowering Communities. Accelerating Resolution. Guaranteeing Accountability.**

JanSetu is an end-to-end, AI-powered civic technology platform engineered to bridge the gap between citizens, municipal authorities, and field maintenance crews. By replacing traditional slow, opaque complaint portals with multi-agent AI classification, dynamic severity scoring, automated department dispatch, worker proof-of-work validation, and citizen verification, JanSetu turns raw civic reports into verified, accountable real-world solutions.

---

## 🚀 Core Value Proposition: `RESOLVED ≠ CLOSED`

In traditional civic portals, authorities can unilaterally mark a complaint as "Resolved" without physical evidence or citizen validation, leading to false closures and public distrust. 

**JanSetu introduces mandatory Citizen Verification:**

```
                                      ┌───────────────────────────────────────────────────────────┐
                                      │              JANSETU CIVIC FLOW PIPELINE                  │
                                      └───────────────────────────────────────────────────────────┘

 [ CITIZEN REPORT ] ──► [ MULTI-KEY GEMINI VISION AI ] ──► [ DUP CHECK & SEVERITY ] ──► [ AUTHORITY COMMAND ]
   Photo + GPS + Text      Categorization & Analysis         Spatial Proximity Risk        Department Auto-Assign
                                                                                                     │
                                                                                                     ▼
 [ CLOSED & VERIFIED ] ◄── [ CITIZEN VERIFICATION ] ◄── [ WORKER PROOF OF WORK ] ◄── [ WORKER DISPATCH ]
   Confetti & Analytics      Accept 🟢 / Reject 🔴        Photo Evidence + Notes      Mobile Task Assignment
```

1. **Worker Resolution**: Field workers must submit photo evidence of completed physical repairs.
2. **Citizen Inspection**: The citizen inspects before/after photos and accepts or rejects the repair.
3. **Reopen Safeguard**: If rejected, the ticket reopens instantly with high priority (`REOPENED` status), preserving a tamper-proof audit log.

---

## 🌟 Key Platform Features & System Enhancements

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
- **OTP Authentication**: Instant OTP login with Twilio SMS integration and fallback development modes.
- **Interactive Verification**: Before/After photo comparison slider with confetti celebrations upon verification.

### 🎨 7. Spacious & Responsive Glassmorphic Interface
- **Modern Design System**: Polished glassmorphism styling, clean dark/light mode balance, and micro-animations.
- **Spacious Responsive Navbar**: Designed with 78px height, generous 24px link gaps, contextual authority role badges, and unified 38px utility buttons across screens.

---

## 🛠️ Technology Stack

### **Frontend (Web)**
- **Framework**: React 19, Vite
- **Styling**: Vanilla CSS Design System with dark mode, glassmorphism, responsive grid, custom micro-animations
- **UI & Icons**: Lucide React, Canvas Confetti, Leaflet GIS Maps
- **State & Routing**: React Context API, Hash Router / React Router

### **Mobile App**
- **Framework**: React Native, Expo (iOS & Android)
- **Styling**: TailwindCSS (NativeWind)
- **Features**: Camera access, Geolocation APIs, Async Storage

### **Backend (API Server)**
- **Runtime**: Node.js (ES Modules), Express.js
- **Database**: MongoDB Atlas / Mongoose (with `mongodb-memory-server` in-memory fallback)
- **Media Handling**: Local disk evidence storage (`backend/public/photos/`) with static serving
- **Authentication**: JSON Web Tokens (JWT), bcryptjs, Twilio SMS & Verify API
- **Background Processes**: Native Node.js background daemons (Auto-reassignment escalation worker)

### **AI & Machine Learning**
- **Primary Vision Model**: Google Gemini 3.7 Flash API (`generativelanguage.googleapis.com`)
- **Fallback AI**: Groq Llama 3 70B API
- **Fallback Rule Engine**: Deterministic civic keyword and photo heuristic classifier

---

## 📁 Repository Structure

```
JanSetu/
├── backend/                        # Express.js REST API & AI Engine
│   ├── public/                     # Static file serving & local photos uploads (`public/photos`)
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
│   │   ├── services/               # Background Daemons & Services
│   │   ├── utils/                  # Seed scripts & geospatial utilities
│   │   └── worker/                 # Worker Operations & Resolution Proof APIs
│   ├── .env                        # Environment Variables Configuration
│   └── server.js                   # Application Entry Point
│
├── frontend/                       # React 19 Web Platform
│   ├── src/
│   │   ├── citizen/                # Citizen Portal Pages (Home, Report, Track, Feed)
│   │   ├── shared/
│   │   │   ├── components/         # Navbar, MapContainer, Modals, Cards, Badges
│   │   │   ├── i18n/               # Multi-language translation contexts (EN, HI, TA, TE, KN)
│   │   │   └── utils/              # Image resolvers & audio speech services
│   │   └── styles/                 # Glassmorphic Design System & Tokens
│   └── index.html
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

### 1. Clone & Configure Environment
Clone the repository and prepare the backend environment file:

```bash
git clone https://github.com/rohanforgit/JanSetu.git
cd JanSetu/backend
cp .env.example .env
```

Ensure `backend/.env` contains valid credentials:
```env
PORT=5001
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/jansetu?retryWrites=true&w=majority
GEMINI_API_KEY=your_gemini_api_key_1
GEMINI_API_KEY_2=your_gemini_api_key_2
GEMINI_API_KEY_3=your_gemini_api_key_3
GROQ_API_KEY=your_groq_api_key
JWT_SECRET=jansetu_super_secret_jwt_key_2026
```

### 2. Install Dependencies
Install dependencies for backend, frontend, and mobile-app:

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

### 3. Seed Initial Open Issues & Map Data
Populate the database with active civic complaints across municipal departments:

```bash
cd backend
npm run seed
```

### 4. Launch Development Servers

**Start Backend API (Terminal 1):**
```bash
cd backend
npm run dev
```
*Backend runs on `http://localhost:5001`*

**Start Frontend Application (Terminal 2):**
```bash
cd frontend
npm run dev
```
*Frontend runs on `http://localhost:5173` (or `http://localhost:5174`)*

---

## 🔐 Demo Credentials

Use the pre-seeded credentials below to test each portal role:

| Portal Role | Access URL | Credentials |
| :--- | :--- | :--- |
| 🧑‍🦱 **Citizen Portal** | `http://localhost:5173/#/citizen/login` | **Phone**: `9876543210`<br>**OTP**: `123456` |
| 🏛️ **Authority Command Center** | `http://localhost:5173/#/authority/login` | **Employee ID**: `AUTH-001`<br>**Password**: `Password123!` |
| 🚒 **Fire Officer (Authority)** | `http://localhost:5173/#/authority/login` | **Employee ID**: `AUTH-FIRE-01`<br>**Password**: `Password123!` |
| 👷 **Field Worker Portal** | `http://localhost:5173/#/worker/login` | **Employee ID**: `worker-004`<br>**Password**: `Password123!` |

---

## 🌐 Production Hosting & Deployment Guide

Follow this guide to deploy JanSetu to cloud environments for public access.

### 1. Database Deployment (MongoDB Atlas)
1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a Cluster (Free M0 tier or Dedicated).
3. Under **Database Access**, create a user (e.g. `jansetu_admin`) and password.
4. Under **Network Access**, add IP `0.0.0.0/0` to allow connections from your web host.
5. Copy the connection string into your `MONGODB_URI` environment variable:
   ```
   mongodb+srv://jansetu_admin:<password>@cluster0.xxx.mongodb.net/jansetu?retryWrites=true&w=majority
   ```

---

### 2. Backend Deployment (Render / Railway / AWS EC2)

#### Option A: Deploying on Render (Recommended)
1. Push your latest code to GitHub (`rohanforgit/JanSetu`).
2. Log in to [Render](https://render.com/) and click **New + ➔ Web Service**.
3. Connect your `JanSetu` GitHub repository.
4. Configure the settings:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
5. Add Environment Variables under **Environment**:
   - `PORT` = `5001` (or Render's assigned port)
   - `MONGODB_URI` = `<your_mongodb_atlas_uri>`
   - `GEMINI_API_KEY` = `<your_gemini_api_key>`
   - `GROQ_API_KEY` = `<your_groq_api_key>`
   - `JWT_SECRET` = `<random_long_string>`
6. Deploy the Web Service. Render will give you a public URL (e.g., `https://jansetu-backend.onrender.com`).

---

### 3. Frontend Deployment (Vercel / Netlify / Cloudflare Pages)

#### Option A: Deploying on Vercel
1. Log in to [Vercel](https://vercel.com/) and click **Add New ➔ Project**.
2. Select your `JanSetu` repository.
3. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable:
   - `VITE_API_BASE_URL` = `https://jansetu-backend.onrender.com/api`
5. Deploy. Vercel will generate your web app URL (e.g., `https://jansetu-civic.vercel.app`).

---

### 4. Mobile App Deployment (Expo EAS)
1. Install EAS CLI globally: `npm install -g eas-cli`
2. Log in to Expo: `eas login`
3. Configure project:
   ```bash
   cd mobile-app
   eas build:configure
   ```
4. Build APK for Android / TestFlight for iOS:
   ```bash
   eas build --platform android --profile preview
   ```

---

## 🗺️ Roadmap & Recommended Next Steps

Here is the step-by-step roadmap for future platform expansion:

1. **Cloud Media Storage (S3 / Cloudinary / Supabase Storage)**:
   - Transition `backend/public/photos/` local file storage to S3 / Cloudinary to support multi-region serverless backend scaling.
2. **Real-Time WebSockets (Socket.io)**:
   - Upgrade REST polling to WebSocket subscriptions for live field worker GPS tracking and immediate authority alerts.
3. **Twilio Production SMS**:
   - Upgrade Twilio dev mode to production credentials for worldwide citizen SMS OTP authentication.
4. **Native Mobile Push Notifications**:
   - Integrate `expo-notifications` for real-time background phone alerts when ticket status changes.
5. **Civic Leaderboards & Gamification**:
   - Reward citizens with civic karma badges and public recognition for verified, non-duplicate community problem reports.

---

## 🛡️ License & Acknowledgments

Built for modern civic governance and transparent public infrastructure maintenance. Developed with Node.js, Express, React 19, Expo, Leaflet GIS, and Google Gemini 3.7 Flash AI.

# Sentry — AI-Powered Issue Reporting & Resolution System for Large Campus

> **Department of Computer Science & Business Systems**  
> **JSPM's Rajarshi Shahu College of Engineering, Pune-411033, India**  
> **Project Team:** Devesh Meshram, Shubham Kokate, Tejas Patil, Manali Ghule  
> **Project Guide:** Dr. Neerajkumar Sathawane

---

## 📌 Executive Summary & Architecture

Large corporate and institutional campuses face significant challenges in facility management: manual reporting via phone calls/emails leads to delayed response times, poor tracking, lack of transparency, and operational blind spots.

**Sentry** is an AI-powered, full-stack dual-portal platform that combines two parallel functional pipelines:

1. **Proactive Maintenance Verification Pipeline (Computer Vision)**:
   - Fixed camera image capture at scheduled morning (08:00 AM baseline) and evening (18:00 PM checkpoint) intervals.
   - OpenCV image preprocessing (grayscale conversion, Gaussian blur filtering).
   - Structural Similarity Index Measure (**SSIM**) comparison via `scikit-image` to quantitatively detect scene changes.
   - Pushes compliance confirmation or non-compliance alerts to the administrative dashboard in real time without human inspection.

2. **Reactive User-Reported Issue Pipeline (Machine Learning)**:
   - Campus members report problems with photographic evidence, location specifics, and descriptions.
   - Convolutional Neural Network (**CNN**) classification model predicts the issue into 5 predefined classes:
     - ⚡ **Electrical** (faults, sparking switchboards, exposed wiring)
     - 💧 **Plumbing** (pipeline bursts, leaks, drainage overflow)
     - 🧱 **Structural Damage** (wall cracks, crumbling plaster, broken tiles)
     - 🧹 **Cleanliness** (overflowing waste bins, uncleaned common areas)
     - 📽️ **Equipment Failure** (projectors, HVAC/fan failure, lab apparatus)
   - Intelligent task assignment and priority routing to maintenance squads with SLA countdowns.
   - Full 4-stage resolution lifecycle: **`Reported` ──> `In Progress` ──> `Resolved` ──> `Closed`**.

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | HTML5, CSS3, ES6+ JavaScript | Cyber/dark campus aesthetic, responsive layout, custom design tokens |
| **Backend API** | Node.js, Express.js | REST API, Multer multipart upload, JWT stateless authentication |
| **Database** | Resilient Hybrid Store | MongoDB/Mongoose support with embedded resilient persistent JSON database |
| **AI / ML Service** | Python, Flask, CORS | 5-class transfer learning feature classification, SLA estimation, routing |
| **Computer Vision** | OpenCV, scikit-image, Pillow | Gaussian blur filtering, structural similarity (SSIM), thermal difference heatmaps |

---

## 🚀 Quick Start Guide

### 1. One-Click Launch (Windows)
Double click `run_system.bat` in the project root directory. It automatically:
- Boots the Python AI/CV Microservice on `http://localhost:5001`
- Boots the Node.js Express Backend on `http://localhost:5000`
- Launches the application in your default web browser

### 2. Manual Terminal Launch

**Terminal 1 — Python AI Microservice:**
```bash
python ai_service/app.py
# Runs on http://localhost:5001
```

**Terminal 2 — Node.js Express Backend:**
```bash
node backend/server.js
# Runs on http://localhost:5000
```

**Terminal 3 — Run Automated Unit Tests:**
```bash
python -m unittest ai_service/test_service.py
```

---

## 🌐 Application Portals

- **Landing Page & Gateway:** [http://localhost:5000](http://localhost:5000)
- **Campus Individual Portal:** [http://localhost:5000/client/campus-portal.html](http://localhost:5000/client/campus-portal.html)
  - Submit issues with photographic evidence and real-time AI classification preview
  - Interactive 4-stage lifecycle tracker (`Reported` -> `In Progress` -> `Resolved` -> `Closed`)
  - One-click sample test loaders (Electrical, Plumbing, Structural, Cleanliness, Equipment)
- **Administrator Dashboard:** [http://localhost:5000/client/admin-portal.html](http://localhost:5000/client/admin-portal.html)
  - Proactive Maintenance Verification Console with side-by-side morning/evening views, SSIM scores, and thermal difference heatmaps
  - Active Issues Management with team assignment and status transition controls
  - Real-time analytics, category distributions, and campus hotspot frequency mapping

---

## 📡 REST API Reference

### AI Microservice (`http://localhost:5001`)
- `GET /health`: Health and engine status
- `POST /compare-images`: SSIM comparison of morning & evening images; returns score, delta %, verdict, and heatmap data URI
- `POST /predict-issue`: Classifies photograph into one of 5 classes and infers severity & maintenance team
- `GET /sample-pairs`: Pre-generated test image pairs for demonstration

### Backend API (`http://localhost:5000/api`)
- `GET /api/health`: Backend server status
- `GET /api/issues`: List all issues with filtering (`status`, `category`, `search`)
- `POST /api/issues`: Create new issue with photo upload and AI triage
- `PATCH /api/issues/:id/status`: Advance issue lifecycle state
- `PATCH /api/issues/:id/assign`: Re-assign team and priority
- `GET /api/verification/zones`: List monitored campus zones
- `GET /api/verification/logs`: Historical SSIM verification logs
- `POST /api/verification/verify`: Execute SSIM check on a campus zone
- `GET /api/analytics/summary`: Real-time KPI summaries, category breakdown, and hotspot counts

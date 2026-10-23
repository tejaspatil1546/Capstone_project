/**
 * Sentry Backend - Maintenance Verification Routes (Computer Vision SSIM)
 * /api/verification
 * Compliant with research paper Section 2, 5 & Fig. System Workflow
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { readDb, writeDb } = require('../config/db');
const { upload } = require('../middleware/upload');
const { verifyMaintenancePair } = require('../services/aiServiceClient');

const MONITORED_ZONES = [
  {
    id: "zone-cafe-01",
    name: "Main Cafeteria (Zone 1)",
    camera: "CAM-NORTH-01",
    schedule: "08:00 AM / 18:00 PM",
    building: "Central Dining Complex",
    status: "Verified Compliant",
    lastScore: 0.8423
  },
  {
    id: "zone-court-04",
    name: "Central Courtyard (Zone 4)",
    camera: "CAM-QUAD-04",
    schedule: "08:30 AM / 18:30 PM",
    building: "Campus Quadrangle",
    status: "Non-Compliant Alert",
    lastScore: 0.9867
  },
  {
    id: "zone-lib-02",
    name: "Central Library Reading Hall (Zone 2)",
    camera: "CAM-LIB-02",
    schedule: "09:00 AM / 19:00 PM",
    building: "Knowledge Resource Centre",
    status: "Verified Compliant",
    lastScore: 0.8120
  },
  {
    id: "zone-lab-03",
    name: "Robotics & IoT Laboratory (Zone 3)",
    camera: "CAM-LAB-03",
    schedule: "08:15 AM / 17:45 PM",
    building: "Engineering Block A",
    status: "Verified Compliant",
    lastScore: 0.7950
  }
];

// GET /api/verification/zones
router.get('/zones', (req, res) => {
  return res.json({ zones: MONITORED_ZONES });
});

// GET /api/verification/logs
router.get('/logs', (req, res) => {
  const db = readDb();
  const logs = [...db.verificationLogs].sort((a, b) => new Date(b.verifiedAt) - new Date(a.verifiedAt));
  return res.json({ count: logs.length, logs });
});

// POST /api/verification/verify
// Accepts 'morning' and 'evening' uploads or a predefined zoneId
router.post('/verify', upload.fields([
  { name: 'morning', maxCount: 1 },
  { name: 'evening', maxCount: 1 }
]), async (req, res) => {
  try {
    const { zoneId, zoneName } = req.body;

    let morningPath = null;
    let eveningPath = null;

    if (req.files && req.files.morning && req.files.evening) {
      morningPath = req.files.morning[0].path;
      eveningPath = req.files.evening[0].path;
    } else if (zoneId === 'zone-court-04') {
      morningPath = path.join(__dirname, '..', 'uploads', 'courtyard_morning.jpg');
      eveningPath = path.join(__dirname, '..', 'uploads', 'courtyard_evening.jpg');
    } else {
      // Default to cafeteria pair
      morningPath = path.join(__dirname, '..', 'uploads', 'cafeteria_morning.jpg');
      eveningPath = path.join(__dirname, '..', 'uploads', 'cafeteria_evening.jpg');
    }

    if (!fs.existsSync(morningPath) || !fs.existsSync(eveningPath)) {
      return res.status(400).json({
        error: 'Target comparison images not found on server.'
      });
    }

    // Call Python SSIM engine
    const cvResult = await verifyMaintenancePair(morningPath, eveningPath);

    const logEntry = {
      id: 'VER-' + new Date().getFullYear() + '-' + Math.floor(100 + Math.random() * 900),
      zoneId: zoneId || 'zone-custom-01',
      zoneName: zoneName || 'Selected Campus Zone',
      date: new Date().toISOString().split('T')[0],
      morningTimestamp: '08:00 AM',
      eveningTimestamp: '18:00 PM',
      ssimScore: cvResult.ssim_score,
      cleanlinessDelta: cvResult.cleanliness_delta_percent,
      isCompliant: cvResult.is_compliant,
      verdict: cvResult.verdict,
      complianceLevel: cvResult.compliance_level,
      statusMessage: cvResult.status_message,
      diffHeatmap: cvResult.diff_heatmap,
      verifiedAt: new Date().toISOString()
    };

    const db = readDb();
    db.verificationLogs.unshift(logEntry);
    writeDb(db);

    return res.json({
      message: 'SSIM Verification completed successfully.',
      verification: logEntry
    });

  } catch (err) {
    console.error('Error during SSIM verification:', err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;

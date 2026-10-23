/**
 * Sentry Backend - Issue Management Routes
 * /api/issues
 * Compliant with research paper Section 2, 5 & Fig. System Architecture
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const { readDb, writeDb } = require('../config/db');
const { upload } = require('../middleware/upload');
const { classifyIssue } = require('../services/aiServiceClient');

// GET /api/issues
router.get('/', (req, res) => {
  const { status, category, urgency, search } = req.query;
  const db = readDb();
  let issues = [...db.issues];

  if (status && status !== 'All') {
    issues = issues.filter(i => i.status.toLowerCase() === status.toLowerCase());
  }
  if (category && category !== 'All') {
    issues = issues.filter(i => i.category.toLowerCase() === category.toLowerCase());
  }
  if (urgency && urgency !== 'All') {
    issues = issues.filter(i => i.urgency.toLowerCase() === urgency.toLowerCase());
  }
  if (search) {
    const q = search.toLowerCase();
    issues = issues.filter(i =>
      i.title.toLowerCase().includes(q) ||
      i.description.toLowerCase().includes(q) ||
      i.location.toLowerCase().includes(q) ||
      i.id.toLowerCase().includes(q)
    );
  }

  // Sort newest first
  issues.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return res.json({ count: issues.length, issues });
});

// GET /api/issues/:id
router.get('/:id', (req, res) => {
  const db = readDb();
  const issue = db.issues.find(i => i.id.toUpperCase() === req.params.id.toUpperCase());
  if (!issue) {
    return res.status(404).json({ error: `Issue ${req.params.id} not found.` });
  }
  return res.json({ issue });
});

// POST /api/issues (Submit new complaint with photo)
router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const { title, description, location, urgency, manualCategory } = req.body;

    if (!title || !description || !location) {
      return res.status(400).json({ error: 'Title, description, and location are required.' });
    }

    let imageUrl = '/uploads/sample_cleanliness.jpg';
    let localImagePath = null;

    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
      localImagePath = req.file.path;
      const standaloneUploads = path.join(__dirname, '..', '..', 'standalone_frontend', 'uploads');
      if (fs.existsSync(standaloneUploads)) {
        try {
          fs.copyFileSync(localImagePath, path.join(standaloneUploads, req.file.filename));
        } catch (copyErr) {
          console.warn('Could not mirror photo to standalone_frontend:', copyErr.message);
        }
      }
    }


    // Call Python AI classification microservice
    let aiResult = null;
    if (localImagePath) {
      aiResult = await classifyIssue(localImagePath, `${title} ${description}`);
    } else {
      aiResult = await classifyIssue(
        path.join(__dirname, '..', 'uploads', 'sample_cleanliness.jpg'),
        `${title} ${description}`
      );
    }

    const predictedCategory = manualCategory && manualCategory !== 'auto'
      ? manualCategory
      : aiResult.predicted_category;

    const issueId = 'SEN-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);

    const newIssue = {
      id: issueId,
      title: title.trim(),
      description: description.trim(),
      category: predictedCategory,
      aiConfidence: aiResult.confidence,
      classProbabilities: aiResult.class_probabilities,
      urgency: urgency || aiResult.severity || 'Medium',
      severity: aiResult.severity || 'Medium',
      location: location.trim(),
      zone: location.split(',')[0].trim(),
      status: 'Reported',
      assignedTeam: aiResult.assigned_team,
      assignedTeamContact: aiResult.assigned_team_contact,
      estimatedSlaHours: aiResult.estimated_sla_hours,
      imageUrl: imageUrl,
      reportedBy: {
        name: req.body.reporterName || 'Campus Individual',
        email: req.body.reporterEmail || 'user@campus.edu',
        department: req.body.reporterDepartment || 'Campus Member'
      },

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [
        {
          status: 'Reported',
          timestamp: new Date().toISOString(),
          note: `Issue logged with AI classification into [${predictedCategory}] (${aiResult.confidence}% confidence). Auto-routed to ${aiResult.assigned_team}.`
        }
      ]
    };

    const db = readDb();
    db.issues.unshift(newIssue);
    writeDb(db);

    return res.status(201).json({
      message: 'Issue submitted successfully and routed to maintenance team.',
      issue: newIssue,
      aiAnalysis: aiResult
    });

  } catch (err) {
    console.error('Error submitting issue:', err);
    return res.status(500).json({ error: err.message });
  }
});

// PATCH /api/issues/:id/status (Transition status: Reported -> In Progress -> Resolved -> Closed)
router.patch('/:id/status', (req, res) => {
  const { status, note } = req.body;
  const validStatuses = ['Reported', 'In Progress', 'Resolved', 'Closed'];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
    });
  }

  const db = readDb();
  const issueIndex = db.issues.findIndex(i => i.id.toUpperCase() === req.params.id.toUpperCase());

  if (issueIndex === -1) {
    return res.status(404).json({ error: 'Issue not found.' });
  }

  const issue = db.issues[issueIndex];
  const oldStatus = issue.status;
  issue.status = status;
  issue.updatedAt = new Date().toISOString();

  issue.history.push({
    status: status,
    timestamp: new Date().toISOString(),
    note: note || `Status transitioned from ${oldStatus} to ${status}. Notification dispatched to reporting user.`
  });

  writeDb(db);

  return res.json({
    message: `Issue ${issue.id} updated to ${status}.`,
    issue
  });
});

// PATCH /api/issues/:id/assign (Re-route team & priority)
router.patch('/:id/assign', (req, res) => {
  const { assignedTeam, urgency } = req.body;
  const db = readDb();
  const issue = db.issues.find(i => i.id.toUpperCase() === req.params.id.toUpperCase());

  if (!issue) {
    return res.status(404).json({ error: 'Issue not found.' });
  }

  if (assignedTeam) issue.assignedTeam = assignedTeam;
  if (urgency) issue.urgency = urgency;
  issue.updatedAt = new Date().toISOString();

  issue.history.push({
    status: issue.status,
    timestamp: new Date().toISOString(),
    note: `Assignment updated: Team -> ${issue.assignedTeam}, Urgency -> ${issue.urgency}.`
  });

  writeDb(db);

  return res.json({
    message: 'Assignment updated successfully.',
    issue
  });
});

module.exports = router;

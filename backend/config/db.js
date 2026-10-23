/**
 * Sentry Backend - Resilient Data Store
 * Provides persistent local JSON file-based database with seed datasets,
 * perfectly mirroring MongoDB collections (users, issues, verificationLogs).
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const SEED_DATA = {
  users: [
    {
      id: "usr-admin-01",
      name: "Dr. Neerajkumar Sathawane (Campus Admin)",
      email: "admin@campus.edu",
      password: "$2a$10$L.NqQ3PKco3XCHqpRdrLSuG3uoMv7AgGHDrvRBk96boNcv7euLmr2", // admin123
      role: "admin",
      department: "Facility Operations & Maintenance Oversight",
      createdAt: new Date().toISOString()
    },
    {
      id: "usr-student-01",
      name: "Tejas Patil (Student)",
      email: "tejas@campus.edu",
      password: "$2a$10$3g.lA8DL0trN0lljfCfp/.U/03toNXyJGRQfXFGJk/eoA/XUv8lBO", // student123
      role: "user",
      department: "Computer Science & Business Systems",
      studentId: "JSPM-CSBS-2026-042",
      createdAt: new Date().toISOString()
    },
    {
      id: "usr-student-02",
      name: "Devesh Meshram (Student)",
      email: "devesh@campus.edu",
      password: "$2a$10$3g.lA8DL0trN0lljfCfp/.U/03toNXyJGRQfXFGJk/eoA/XUv8lBO", // student123
      role: "user",
      department: "Computer Science & Business Systems",
      studentId: "JSPM-CSBS-2026-018",
      createdAt: new Date().toISOString()
    },
    {
      id: "usr-student-03",
      name: "Shubham Kokate (Student)",
      email: "shubham@campus.edu",
      password: "$2a$10$3g.lA8DL0trN0lljfCfp/.U/03toNXyJGRQfXFGJk/eoA/XUv8lBO", // student123
      role: "user",
      department: "Computer Science & Business Systems",
      studentId: "JSPM-CSBS-2026-035",
      createdAt: new Date().toISOString()
    },
    {
      id: "usr-student-04",
      name: "Manali Ghule (Student)",
      email: "manali@campus.edu",
      password: "$2a$10$3g.lA8DL0trN0lljfCfp/.U/03toNXyJGRQfXFGJk/eoA/XUv8lBO", // student123
      role: "user",
      department: "Computer Science & Business Systems",
      studentId: "JSPM-CSBS-2026-022",
      createdAt: new Date().toISOString()
    }
  ],

  issues: [
    {
      id: "SEN-2026-1042",
      title: "Exposed High-Voltage Wires near Lab 304",
      description: "Switchboard cover is broken with exposed red and black wires sparking when fans are turned on.",
      category: "Electrical",
      aiConfidence: 94.2,
      urgency: "High",
      severity: "High",
      location: "Academic Block B, 3rd Floor, Corridor outside Lab 304",
      zone: "Block B",
      status: "In Progress",
      assignedTeam: "Electrical Maintenance Squad",
      assignedTeamContact: "ext. 401",
      estimatedSlaHours: 4,
      imageUrl: "/uploads/sample_electrical.jpg",
      reportedBy: {
        id: "usr-student-01",
        name: "Tejas Patil",
        email: "tejas@campus.edu"
      },
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      history: [
        {
          status: "Reported",
          timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
          note: "Issue logged via Campus Portal with CNN photo classification."
        },
        {
          status: "In Progress",
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
          note: "Assigned to Electrical Maintenance Squad. Technician dispatched."
        }
      ]
    },
    {
      id: "SEN-2026-1038",
      title: "Continuous Main Pipe Water Leakage",
      description: "Major water leak beneath washroom pipeline causing slippery puddles on central staircase.",
      category: "Plumbing",
      aiConfidence: 98.7,
      urgency: "High",
      severity: "High",
      location: "Science Building, Ground Floor Restroom Area",
      zone: "Science Block",
      status: "Resolved",
      assignedTeam: "Plumbing & Drainage Division",
      assignedTeamContact: "ext. 402",
      estimatedSlaHours: 6,
      imageUrl: "/uploads/sample_plumbing.jpg",
      reportedBy: {
        id: "usr-student-01",
        name: "Tejas Patil",
        email: "tejas@campus.edu"
      },
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      history: [
        {
          status: "Reported",
          timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
          note: "Complaint submitted."
        },
        {
          status: "In Progress",
          timestamp: new Date(Date.now() - 3600000 * 20).toISOString(),
          note: "Plumbing squad isolated valve and replaced gasket seal."
        },
        {
          status: "Resolved",
          timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
          note: "Pipe pressure tested and sealed. Standing water cleared."
        }
      ]
    },
    {
      id: "SEN-2026-1035",
      title: "Deep Wall Fissure & Plaster Damage",
      description: "Corridor pillar has visible horizontal cracks following heavy rains.",
      category: "Structural Damage",
      aiConfidence: 89.5,
      urgency: "Medium",
      severity: "Medium",
      location: "Library Annex, 2nd Floor Stairway",
      zone: "Library",
      status: "Reported",
      assignedTeam: "Civil Infrastructure & Works",
      assignedTeamContact: "ext. 403",
      estimatedSlaHours: 24,
      imageUrl: "/uploads/sample_structural.jpg",
      reportedBy: {
        id: "usr-student-01",
        name: "Tejas Patil",
        email: "tejas@campus.edu"
      },
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      history: [
        {
          status: "Reported",
          timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
          note: "Awaiting civil inspection team review."
        }
      ]
    },
    {
      id: "SEN-2026-1029",
      title: "Overflowing Waste Bin at Quadrangle Entrance",
      description: "Recycling and organic waste containers filled beyond capacity with litter around benches.",
      category: "Cleanliness",
      aiConfidence: 96.1,
      urgency: "Medium",
      severity: "Medium",
      location: "Central Courtyard & Food Court Entrance",
      zone: "Courtyard",
      status: "Closed",
      assignedTeam: "Sanitation & Campus Hygiene Services",
      assignedTeamContact: "ext. 404",
      estimatedSlaHours: 2,
      imageUrl: "/uploads/sample_cleanliness.jpg",
      reportedBy: {
        id: "usr-student-01",
        name: "Tejas Patil",
        email: "tejas@campus.edu"
      },
      createdAt: new Date(Date.now() - 3600000 * 30).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 26).toISOString(),
      history: [
        {
          status: "Reported",
          timestamp: new Date(Date.now() - 3600000 * 30).toISOString(),
          note: "Reported by student."
        },
        {
          status: "In Progress",
          timestamp: new Date(Date.now() - 3600000 * 28).toISOString(),
          note: "Sanitation team deployed."
        },
        {
          status: "Resolved",
          timestamp: new Date(Date.now() - 3600000 * 27).toISOString(),
          note: "Bins emptied and disinfected."
        },
        {
          status: "Closed",
          timestamp: new Date(Date.now() - 3600000 * 26).toISOString(),
          note: "Verified by reporting user."
        }
      ]
    },
    {
      id: "SEN-2026-1022",
      title: "Ceiling Multimedia Projector Not Powering On",
      description: "Projector in Seminar Hall A shuts down after 30 seconds with overheat LED flashing.",
      category: "Equipment Failure",
      aiConfidence: 91.3,
      urgency: "Low",
      severity: "Low",
      location: "Main Auditorium, Seminar Hall A",
      zone: "Auditorium",
      status: "In Progress",
      assignedTeam: "Lab & Smart Campus IT Facilities",
      assignedTeamContact: "ext. 405",
      estimatedSlaHours: 8,
      imageUrl: "/uploads/sample_equipment.jpg",
      reportedBy: {
        id: "usr-student-01",
        name: "Tejas Patil",
        email: "tejas@campus.edu"
      },
      createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
      history: [
        {
          status: "Reported",
          timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
          note: "Reported before afternoon guest lecture."
        },
        {
          status: "In Progress",
          timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
          note: "Exhaust fan component ordered for replacement."
        }
      ]
    }
  ],
  verificationLogs: [
    {
      id: "VER-2026-081",
      zoneId: "zone-cafe-01",
      zoneName: "Main Cafeteria (Zone 1)",
      date: new Date().toISOString().split('T')[0],
      morningTimestamp: "08:00 AM",
      eveningTimestamp: "18:00 PM",
      ssimScore: 0.8423,
      cleanlinessDelta: 8.74,
      isCompliant: true,
      verdict: "COMPLIANT",
      complianceLevel: "Passed",
      statusMessage: "VERIFIED: Physical maintenance and cleaning confirmed by structural scene delta.",
      verifiedAt: new Date().toISOString()
    },
    {
      id: "VER-2026-080",
      zoneId: "zone-court-04",
      zoneName: "Central Courtyard (Zone 4)",
      date: new Date().toISOString().split('T')[0],
      morningTimestamp: "08:30 AM",
      eveningTimestamp: "18:30 PM",
      ssimScore: 0.9867,
      cleanlinessDelta: 0.42,
      isCompliant: false,
      verdict: "NON-COMPLIANT",
      complianceLevel: "Critical Alert",
      statusMessage: "ALERT: Scheduled maintenance not detected. Area remained static throughout the day.",
      verifiedAt: new Date().toISOString()
    }
  ]
};

function readDb() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(SEED_DATA, null, 2));
    return SEED_DATA;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading db.json, restoring seed data:', err.message);
    fs.writeFileSync(DB_FILE, JSON.stringify(SEED_DATA, null, 2));
    return SEED_DATA;
  }
}

function writeDb(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

module.exports = {
  readDb,
  writeDb
};

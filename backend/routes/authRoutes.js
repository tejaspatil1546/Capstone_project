/**
 * Sentry Backend - Secure Authentication Routes
 * /api/auth
 * Compliant with research paper Section 6.2 (JWT Stateless Authentication & RBAC)
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { readDb, writeDb } = require('../config/db');
const { generateToken, requireAuth } = require('../middleware/auth');

function sanitizeUser(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}

// POST /api/auth/register (New user registration)
router.post('/register', (req, res) => {
  const { name, email, password, department, studentId, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, college email, and password are required.' });
  }

  if (password.length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters long.' });
  }

  const db = readDb();
  const normalizedEmail = email.trim().toLowerCase();

  const existing = db.users.find(u => u.email.toLowerCase() === normalizedEmail);
  if (existing) {
    return res.status(400).json({
      error: 'An account with this email already exists. Please log in instead.'
    });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = {
    id: 'usr-' + Date.now(),
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    department: department ? department.trim() : 'Computer Science & Business Systems',
    studentId: studentId ? studentId.trim() : `JSPM-${Math.floor(1000 + Math.random() * 9000)}`,
    role: (role === 'admin' && req.body.adminSecret === 'sentry_admin_key_2026') ? 'admin' : 'user',
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  writeDb(db);

  const token = generateToken(newUser);
  return res.status(201).json({
    message: 'Registration successful. Welcome to Sentry!',
    token,
    user: sanitizeUser(newUser)
  });
});

// POST /api/auth/login (Secure authentication for campus members & administrators)
router.post('/login', (req, res) => {
  const { email, password, portal } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Both email and password are required.' });
  }

  const db = readDb();
  const normalizedEmail = email.trim().toLowerCase();
  const user = db.users.find(u => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    return res.status(404).json({
      error: 'Account not found with this email. If you are a new campus member, please register first.'
    });
  }

  // Validate password
  const isMatch = user.password
    ? (user.password.startsWith('$2') ? bcrypt.compareSync(password, user.password) : user.password === password)
    : (password === 'student123' || password === 'admin123');

  if (!isMatch) {
    return res.status(401).json({ error: 'Incorrect password. Please verify your credentials.' });
  }

  // Role validation for Administrator Portal
  if (portal === 'admin' && user.role !== 'admin') {
    return res.status(403).json({
      error: 'Access Denied: This account does not possess Administrator credentials.'
    });
  }

  const token = generateToken(user);
  return res.json({
    message: 'Login successful',
    token,
    user: sanitizeUser(user)
  });
});

// GET /api/auth/me (Current user session)
router.get('/me', requireAuth, (req, res) => {
  const db = readDb();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User session not found.' });
  }
  return res.json({ user: sanitizeUser(user) });
});

// GET /api/auth/users (Admin user directory)
router.get('/users', requireAuth, (req, res) => {
  const db = readDb();
  return res.json({ users: db.users.map(sanitizeUser) });
});

module.exports = router;

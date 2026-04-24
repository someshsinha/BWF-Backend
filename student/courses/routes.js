const express = require('express');
const router = express.Router();

const {
  getTodayCourses,
  submitTask,
  markUnderReview,
  verifyTask,
  rejectTask
} = require('./controller');

const {
  authenticateToken,
  authorizeRoles,
  authorizeSelfOrAdmin
} = require('../../auth/middleware');

// ── Student ───────────────────────────────────────────────────────────────────

// Get today's tasks grouped by status + session progress
router.get(
  '/:auth_id',
  authenticateToken,
  authorizeRoles('student', 'admin'),
  authorizeSelfOrAdmin,
  getTodayCourses
);

// Student marks a task as done
router.post(
  '/:auth_id/tasks/:taskId/submit',
  authenticateToken,
  authorizeRoles('student'),
  authorizeSelfOrAdmin,
  submitTask
);

// ── Warden / Admin ────────────────────────────────────────────────────────────
// Note: no authorizeSelfOrAdmin here — wardens act on any student's tasks

// Warden picks up task for review
router.put(
  '/tasks/:taskId/review',
  authenticateToken,
  authorizeRoles('warden', 'admin'),
  markUnderReview
);

// Warden approves task
router.put(
  '/tasks/:taskId/verify',
  authenticateToken,
  authorizeRoles('warden', 'admin'),
  verifyTask
);

// Warden rejects task with feedback
router.put(
  '/tasks/:taskId/reject',
  authenticateToken,
  authorizeRoles('warden', 'admin'),
  rejectTask
);

module.exports = router;
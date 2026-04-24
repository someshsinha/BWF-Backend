const express = require('express');
const router = express.Router();

const { getDashboard, logMood, thankMentor } = require('./controller');
const {
  authenticateToken,
  authorizeRoles,
  authorizeSelfOrAdmin
} = require('../../auth/middleware');

// Full dashboard data for Home page
router.get(
  '/:auth_id',
  authenticateToken,
  authorizeRoles('student', 'admin'),
  authorizeSelfOrAdmin,
  getDashboard
);

// Student logs their mood for today
router.post(
  '/:auth_id/mood',
  authenticateToken,
  authorizeRoles('student'),
  authorizeSelfOrAdmin,
  logMood
);

// Student taps "Say thanks" on mentor note
router.post(
  '/:auth_id/mentor-note/:noteId/thanks',
  authenticateToken,
  authorizeRoles('student'),
  authorizeSelfOrAdmin,
  thankMentor
);

module.exports = router;
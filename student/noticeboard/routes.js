const express = require('express');
const router = express.Router();

const {
  getNotices,
  getUnreadBadge,
  markRead,
  markAllRead,
  dismissNotice
} = require('./controller');

const {
  authenticateToken,
  authorizeRoles,
  authorizeSelfOrAdmin
} = require('../../auth/middleware');

// Paginated notice list with per-student read/dismiss state merged in
router.get(
  '/:auth_id',
  authenticateToken,
  authorizeRoles('student', 'admin'),
  authorizeSelfOrAdmin,
  getNotices
);

// Bell badge count only — lightweight, no notice data
router.get(
  '/:auth_id/unread-count',
  authenticateToken,
  authorizeRoles('student', 'admin'),
  authorizeSelfOrAdmin,
  getUnreadBadge
);

// Student opens/reads a notice
router.post(
  '/:auth_id/notices/:noticeId/read',
  authenticateToken,
  authorizeRoles('student'),
  authorizeSelfOrAdmin,
  markRead
);

// "Mark all read" button
router.post(
  '/:auth_id/read-all',
  authenticateToken,
  authorizeRoles('student'),
  authorizeSelfOrAdmin,
  markAllRead
);

// X button on a notice card
router.delete(
  '/:auth_id/notices/:noticeId',
  authenticateToken,
  authorizeRoles('student'),
  authorizeSelfOrAdmin,
  dismissNotice
);

module.exports = router;
const Notice = require('../models/notice');
const NoticeInteraction = require('../models/noticeInteraction');
const { getNoticesForStudent, getUnreadCount } = require('./service');

const VALID_CATEGORIES = ['academic', 'events', 'welfare', 'general'];

// GET /api/student/noticeboard/:auth_id
// Query params:
//   category — "academic" | "events" | "welfare" | "general" | "all"  (default: "all")
//   page     — default 1
//   limit    — default 10, max 20
async function getNotices(req, res) {
  const { auth_id } = req.params;
  let { category = 'all', page = 1, limit = 10 } = req.query;

  page  = Math.max(1, parseInt(page, 10)  || 1);
  limit = Math.min(20, Math.max(1, parseInt(limit, 10) || 10));

  if (category !== 'all' && !VALID_CATEGORIES.includes(category)) {
    return res.status(400).json({
      message: `category must be one of: all, ${VALID_CATEGORIES.join(', ')}`
    });
  }

  try {
    const { notices, total } = await getNoticesForStudent(auth_id, { category, page, limit });
    const unreadCount = await getUnreadCount(auth_id);

    return res.status(200).json({
      notices,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      unreadCount
    });

  } catch (err) {
    console.error('NOTICEBOARD FETCH ERROR:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// GET /api/student/noticeboard/:auth_id/unread-count
// Cheap endpoint just for refreshing the bell badge without re-fetching all notices.
async function getUnreadBadge(req, res) {
  const { auth_id } = req.params;

  try {
    const unreadCount = await getUnreadCount(auth_id);
    return res.status(200).json({ unreadCount });

  } catch (err) {
    console.error('UNREAD COUNT ERROR:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// POST /api/student/noticeboard/:auth_id/notices/:noticeId/read
// Fires when student expands a notice ("Read more" click).
async function markRead(req, res) {
  const { auth_id, noticeId } = req.params;

  try {
    const notice = await Notice.findById(noticeId).lean();
    if (!notice) return res.status(404).json({ message: 'Notice not found' });

    await NoticeInteraction.findOneAndUpdate(
      { auth_id, noticeId },
      { isRead: true },
      { upsert: true, new: true }
    );

    return res.status(200).json({ message: 'Marked as read' });

  } catch (err) {
    console.error('MARK READ ERROR:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// POST /api/student/noticeboard/:auth_id/read-all
// "Mark all read" button — bulk marks every active notice as read.
async function markAllRead(req, res) {
  const { auth_id } = req.params;

  try {
    const allActive = await Notice.find({ isActive: true }, '_id').lean();

    if (!allActive.length) {
      return res.status(200).json({ message: 'No active notices', count: 0 });
    }

    await Promise.all(
      allActive.map(n =>
        NoticeInteraction.findOneAndUpdate(
          { auth_id, noticeId: n._id },
          { isRead: true },
          { upsert: true }
        )
      )
    );

    return res.status(200).json({
      message: 'All notices marked as read',
      count: allActive.length
    });

  } catch (err) {
    console.error('MARK ALL READ ERROR:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// DELETE /api/student/noticeboard/:auth_id/notices/:noticeId
// X button on a notice card — hides it from this student's board only.
// Also marks as read since they clearly saw it before dismissing.
async function dismissNotice(req, res) {
  const { auth_id, noticeId } = req.params;

  try {
    const notice = await Notice.findById(noticeId).lean();
    if (!notice) return res.status(404).json({ message: 'Notice not found' });

    await NoticeInteraction.findOneAndUpdate(
      { auth_id, noticeId },
      { isDismissed: true, isRead: true },
      { upsert: true, new: true }
    );

    return res.status(200).json({ message: 'Notice dismissed' });

  } catch (err) {
    console.error('DISMISS ERROR:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  getNotices,
  getUnreadBadge,
  markRead,
  markAllRead,
  dismissNotice
};
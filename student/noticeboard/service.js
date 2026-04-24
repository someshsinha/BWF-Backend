const Notice = require('../models/notice');
const NoticeInteraction = require('../models/noticeInteraction');

// Fetches paginated notices and merges this student's read/dismissed state in.
// Uses two simple queries instead of a $lookup aggregation — easier to reason
// about and keeps response payload small.
async function getNoticesForStudent(auth_id, { category, page, limit }) {
  const query = { isActive: true };
  if (category && category !== 'all') {
    query.category = category;
  }

  const skip = (page - 1) * limit;

  const [notices, total] = await Promise.all([
    Notice.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notice.countDocuments(query)
  ]);

  if (!notices.length) {
    return { notices: [], total };
  }

  // Fetch only this student's interactions for exactly these notice IDs
  const noticeIds = notices.map(n => n._id);
  const interactions = await NoticeInteraction.find({
    auth_id,
    noticeId: { $in: noticeIds }
  }).lean();

  // Build a lookup map for O(1) merge
  const interactionMap = {};
  interactions.forEach(i => {
    interactionMap[i.noticeId.toString()] = i;
  });

  // Merge state into each notice, then strip out dismissed ones
  const enriched = notices
    .map(notice => {
      const interaction = interactionMap[notice._id.toString()] || {};
      return {
        ...notice,
        isRead:      interaction.isRead      || false,
        isDismissed: interaction.isDismissed || false
      };
    })
    .filter(n => !n.isDismissed);

  return { notices: enriched, total };
}

// How many active notices the student hasn't read or dismissed.
// This drives the bell badge number.
async function getUnreadCount(auth_id) {
  const allActive = await Notice.find({ isActive: true }, '_id').lean();
  const allIds = allActive.map(n => n._id);

  if (!allIds.length) return 0;

  const interacted = await NoticeInteraction.find({
    auth_id,
    noticeId: { $in: allIds },
    $or: [{ isRead: true }, { isDismissed: true }]
  }, 'noticeId').lean();

  const interactedSet = new Set(interacted.map(i => i.noticeId.toString()));
  return allIds.filter(id => !interactedSet.has(id.toString())).length;
}

module.exports = { getNoticesForStudent, getUnreadCount };
const Schedule = require('../models/schedule');
const Assignment = require('../models/assignment');
const MentorNote = require('../models/mentorNote');

// Returns today's date as "YYYY-MM-DD" string.
// Used consistently across all queries so everything is date-aligned.
function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

// Today's schedule for this student, sorted by start time, capped at 10.
async function getTodaySchedule(auth_id) {
  const today = getTodayString();
  return Schedule.find({ auth_id, date: today })
    .sort({ startTime: 1 })
    .limit(10)
    .lean();
}

// Up to 5 assignments sorted by soonest due date — dashboard shows 2 but
// sending 5 gives frontend flexibility without another request.
async function getRecentAssignments(auth_id) {
  return Assignment.find({ auth_id })
    .sort({ dueDate: 1 })
    .limit(5)
    .lean();
}

// Most recent mentor note for this student.
async function getLatestMentorNote(auth_id) {
  return MentorNote.findOne({ auth_id })
    .sort({ createdAt: -1 })
    .lean();
}

module.exports = {
  getTodayString,
  getTodaySchedule,
  getRecentAssignments,
  getLatestMentorNote
};
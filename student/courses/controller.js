const Task = require('../models/task');

function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

// Groups flat task array into the four UI sections.
function groupTasksByStatus(tasks) {
  return {
    todo:               tasks.filter(t => t.status === 'todo'),
    student_submitted:  tasks.filter(t => t.status === 'student_submitted'),
    under_review:       tasks.filter(t => t.status === 'under_review'),
    verified:           tasks.filter(t => t.status === 'verified')
  };
}

// Fetches all tasks for a student on a given date and returns them grouped.
// Session progress ("1 of 4 done") is derived from task counts —
// no separate DeviceSession collection needed.
async function getTodayTasks(auth_id, date) {
  const tasks = await Task.find({ auth_id, scheduledDate: date })
    .sort({ createdAt: 1 })
    .lean();

  const grouped = groupTasksByStatus(tasks);

  return {
    grouped,
    session: {
      completedSessions: grouped.verified.length,
      totalSessions: tasks.length
    }
  };
}

module.exports = { getTodayString, getTodayTasks };
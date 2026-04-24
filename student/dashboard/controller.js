const MoodLog = require('../models/moodLog');
const MentorNote = require('../models/mentorNote');
const {
  getTodayString,
  getTodaySchedule,
  getRecentAssignments,
  getLatestMentorNote
} = require('./service');

// GET /api/student/dashboard/:auth_id
// Returns everything the Home page needs in a single request.
// All DB queries run in parallel — one round trip, not five.
// Inspiration is handled entirely on the frontend (you already have the array there).
async function getDashboard(req, res) {
  const { auth_id } = req.params;

  try {
    const today = getTodayString();

    const [schedule, assignments, mentorNote, todayMood] = await Promise.all([
      getTodaySchedule(auth_id),
      getRecentAssignments(auth_id),
      getLatestMentorNote(auth_id),
      MoodLog.findOne({ auth_id, date: today }).lean()
    ]);

    return res.status(200).json({
      today,
      schedule,
      assignments,
      mentorNote: mentorNote || null,
      todayMood: todayMood ? todayMood.mood : null
    });

  } catch (err) {
    console.error('DASHBOARD ERROR:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// POST /api/student/dashboard/:auth_id/mood
// Student taps Happy / Okay / Need Help.
// Upserts on (auth_id + date) — tapping again today just updates, no duplicate.
async function logMood(req, res) {
  const { auth_id } = req.params;
  const { mood } = req.body;

  const validMoods = ['happy', 'okay', 'need_help'];
  if (!mood || !validMoods.includes(mood)) {
    return res.status(400).json({
      message: 'mood must be one of: happy, okay, need_help'
    });
  }

  try {
    const today = getTodayString();

    const log = await MoodLog.findOneAndUpdate(
      { auth_id, date: today },
      { mood },
      { upsert: true, new: true }
    );

    return res.status(200).json({ mood: log.mood, date: log.date });

  } catch (err) {
    console.error('MOOD LOG ERROR:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// POST /api/student/dashboard/:auth_id/mentor-note/:noteId/thanks
// Student taps "Say thanks" on the mentor note card.
async function thankMentor(req, res) {
  const { auth_id, noteId } = req.params;

  try {
    const note = await MentorNote.findOne({ _id: noteId, auth_id });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    note.thanked = true;
    await note.save();

    return res.status(200).json({ message: 'Thanks recorded' });

  } catch (err) {
    console.error('THANK MENTOR ERROR:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { getDashboard, logMood, thankMentor };
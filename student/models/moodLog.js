const mongoose = require('mongoose');

const moodLogSchema = new mongoose.Schema(
  {
    auth_id: {
      type: String,
      required: true,
      index: true
    },
    mood: {
      type: String,
      enum: ['happy', 'okay', 'need_help'],
      required: true
    },
    // "YYYY-MM-DD" — one record per student per day
    date: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

// Prevents duplicate mood entries for the same student on the same day
moodLogSchema.index({ auth_id: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('MoodLog', moodLogSchema);
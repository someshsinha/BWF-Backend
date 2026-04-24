const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema(
  {
    auth_id: {
      type: String,
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true
    },
    sessionType: {
      type: String,
      enum: ['class', 'workshop', 'training', 'other'],
      default: 'class'
    },
    // Stored as "YYYY-MM-DD" string — avoids timezone issues across devices
    date: {
      type: String,
      required: true,
      index: true
    },
    // e.g. "10:00 AM"
    startTime: {
      type: String,
      required: true
    },
    // optional video call link
    joinLink: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Schedule', scheduleSchema);
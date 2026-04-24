const mongoose = require('mongoose');

const mentorNoteSchema = new mongoose.Schema(
  {
    auth_id: {
      type: String,
      required: true,
      index: true
    },
    // Stored directly so dashboard renders without an extra join
    mentorName: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    // flips to true when student taps "Say thanks"
    thanked: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('MentorNote', mentorNoteSchema);
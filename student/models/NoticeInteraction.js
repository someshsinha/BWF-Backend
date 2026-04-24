const mongoose = require('mongoose');

// Tracks per-student read/dismissed state for notices.
// Kept as its own collection instead of embedding student arrays inside Notice —
// embedding would make every notice document grow with every student, which
// hurts both query performance and response payload size.

const noticeInteractionSchema = new mongoose.Schema(
  {
    auth_id: {
      type: String,
      required: true,
      index: true
    },
    noticeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Notice',
      required: true
    },
    isRead: {
      type: Boolean,
      default: false
    },
    // dismissed = student hit X, notice is hidden from their board
    isDismissed: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// One interaction document per student per notice — no duplicates
noticeInteractionSchema.index({ auth_id: 1, noticeId: 1 }, { unique: true });

module.exports = mongoose.model('NoticeInteraction', noticeInteractionSchema);
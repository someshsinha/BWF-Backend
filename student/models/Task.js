const mongoose = require('mongoose');

// Status flow:
//
//   todo  ──[student: I'm Done!]──►  student_submitted
//                                           │
//                               [warden: picks up for review]
//                                           │
//                                           ▼
//                                     under_review
//                                      │         │
//                              [verify]           [reject]
//                                 │                   │
//                                 ▼                   ▼
//                             verified           todo (with rejectionNote)

const taskSchema = new mongoose.Schema(
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
    subject: {
      type: String,
      required: true
    },
    // frontend maps this string to a tile icon/color
    // e.g. "book" | "math" | "science" | "history" | "default"
    iconType: {
      type: String,
      default: 'default'
    },
    // "YYYY-MM-DD"
    scheduledDate: {
      type: String,
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ['todo', 'student_submitted', 'under_review', 'verified'],
      default: 'todo'
    },
    // warden fills this when rejecting — student sees it so they know what to fix
    rejectionNote: {
      type: String,
      default: null
    },
    // state transition timestamps for audit trail
    submittedAt:     { type: Date, default: null },
    reviewStartedAt: { type: Date, default: null },
    verifiedAt:      { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
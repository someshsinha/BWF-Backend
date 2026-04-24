const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
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
    // "YYYY-MM-DD"
    dueDate: {
      type: String,
      required: true
    },
    // high → red dot, medium/low → green dot on dashboard card
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Assignment', assignmentSchema);
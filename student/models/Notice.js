const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    body: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['academic', 'events', 'welfare', 'general'],
      required: true,
      index: true
    },
    // display string shown on the card, e.g. "18 Mar 2026"
    publishedDate: {
      type: String,
      required: true
    },
    // set to false to soft-delete a notice without removing it from DB
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notice', noticeSchema);
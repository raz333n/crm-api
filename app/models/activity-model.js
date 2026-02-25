const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    type: {
      type: String,
      enum: ["task", "call", "meeting", "appointment", "event"],
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
    },

    dueDate: {
      type: Date,
      required: true,
    },

    startTime: Date,
    endTime: Date,

    isAllDay: {
      type: Boolean,
      default: true,
    },

    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Useful index for calendar queries
activitySchema.index({ assignedTo: 1, dueDate: 1 });

module.exports = mongoose.model("Activity", activitySchema);
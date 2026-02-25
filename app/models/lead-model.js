const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    phone: String,
    company: String,

    source: {
      type: String,
      enum: ["website", "referral", "cold-call", "social", "other"],
      default: "other",
    },

    stage: {
        type: String,
        enum: [
            "new",
            "contacted",
            "qualified",
            "proposal",
            "negotiation",
            "won",
            "lost"
        ],
        default: "new"
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    notes: String
  },
  { timestamps: true }
);

const Lead = mongoose.model("Lead", leadSchema);

module.exports = Lead;
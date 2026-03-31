import mongoose from "mongoose";

const attemptQuestionSnapshotSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true
    },
    questionText: {
      type: String,
      required: true
    },
    options: [
      {
        optionId: {
          type: String,
          required: true
        },
        text: {
          type: String,
          required: true
        },
        isCorrect: {
          type: Boolean,
          required: true
        }
      }
    ],
    selectedOptionId: {
      type: String,
      default: null
    },
    markedForReview: {
      type: Boolean,
      default: false
    },
    visited: {
      type: Boolean,
      default: false
    },
    answeredAt: {
      type: Date,
      default: null
    },
    timeSpentSeconds: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  { _id: false }
);

const attemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ["in_progress", "submitted", "expired"],
      default: "in_progress",
      index: true
    },
    startedAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true
    },
    submittedAt: {
      type: Date,
      default: null
    },
    snapshot: {
      type: [attemptQuestionSnapshotSchema],
      required: true
    },
    score: {
      type: Number,
      default: 0
    },
    totalCorrect: {
      type: Number,
      default: 0
    },
    totalWrong: {
      type: Number,
      default: 0
    },
    totalUnanswered: {
      type: Number,
      default: 0
    },
    totalTimeSpentSeconds: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

attemptSchema.index({ user: 1, exam: 1, status: 1 });
attemptSchema.index({ user: 1, createdAt: -1 });
attemptSchema.index({ status: 1, expiresAt: 1 });

const Attempt = mongoose.model("Attempt", attemptSchema);

export default Attempt;

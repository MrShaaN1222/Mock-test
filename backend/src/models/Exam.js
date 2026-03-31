import mongoose from "mongoose";

const examSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    description: {
      type: String,
      default: ""
    },
    categories: {
      type: [String],
      required: true,
      validate: {
        validator(value) {
          return Array.isArray(value) && value.length > 0;
        },
        message: "At least one category is required"
      },
      index: true
    },
    totalQuestions: {
      type: Number,
      required: true,
      min: 1
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: 1
    },
    marksPerQuestion: {
      type: Number,
      default: 2,
      min: 0
    },
    negativeMarks: {
      type: Number,
      default: 0.5,
      min: 0
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

examSchema.index({ isPublished: 1, createdAt: -1 });
examSchema.index({ categories: 1, isPublished: 1 });

const Exam = mongoose.model("Exam", examSchema);

export default Exam;

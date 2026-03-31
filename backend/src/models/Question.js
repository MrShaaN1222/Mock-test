import mongoose from "mongoose";

const optionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true
    },
    isCorrect: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  { _id: false }
);

const questionSchema = new mongoose.Schema(
  {
    questionText: {
      type: String,
      required: true,
      trim: true
    },
    options: {
      type: [optionSchema],
      validate: {
        validator(value) {
          return Array.isArray(value) && value.length >= 2;
        },
        message: "Question must have at least two options"
      },
      required: true
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
      index: true
    },
    explanation: {
      type: String,
      default: ""
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

questionSchema.index({ category: 1, difficulty: 1 });
questionSchema.index({ createdAt: -1 });

questionSchema.path("options").validate(function hasOneCorrect(options) {
  const correctCount = options.filter((option) => option.isCorrect).length;
  return correctCount === 1;
}, "Question must have exactly one correct option");

const Question = mongoose.model("Question", questionSchema);

export default Question;

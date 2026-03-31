import Exam from "../models/Exam.js";
import Question from "../models/Question.js";
import ApiError from "../utils/ApiError.js";
import { sanitizeText } from "../utils/request.js";

export function normalizeQuestionRecords(records) {
  if (!Array.isArray(records) || records.length === 0) {
    throw new ApiError(400, "Import payload must be a non-empty JSON array");
  }

  return records.map((item) => ({
    questionText: sanitizeText(item.questionText, { maxLen: 500 }),
    category: sanitizeText(item.category, { maxLen: 80 }),
    difficulty: ["easy", "medium", "hard"].includes(item.difficulty) ? item.difficulty : "medium",
    explanation: sanitizeText(item.explanation || "", { maxLen: 800 }),
    isActive: typeof item.isActive === "boolean" ? item.isActive : true,
    options: (item.options || []).map((option) => ({
      text: sanitizeText(option?.text, { maxLen: 300 }),
      isCorrect: Boolean(option?.isCorrect)
    }))
  }));
}

export async function bulkImportQuestions(records, { replace = false } = {}) {
  const payload = normalizeQuestionRecords(records);
  if (replace) {
    await Question.deleteMany({});
  }
  const inserted = await Question.insertMany(payload);
  return { insertedCount: inserted.length };
}

export function normalizeExamRecords(records, createdBy) {
  if (!Array.isArray(records) || records.length === 0) {
    throw new ApiError(400, "Import payload must be a non-empty JSON array");
  }
  if (!createdBy) {
    throw new ApiError(400, "createdBy is required");
  }

  return records.map((item) => ({
    title: sanitizeText(item.title, { maxLen: 200 }),
    description: sanitizeText(item.description || "", { maxLen: 500 }),
    categories: Array.isArray(item.categories)
      ? item.categories.map((category) => sanitizeText(category, { maxLen: 80 })).filter(Boolean)
      : [],
    totalQuestions: Number(item.totalQuestions || 0),
    durationMinutes: Number(item.durationMinutes || 0),
    marksPerQuestion: Number(item.marksPerQuestion ?? 2),
    negativeMarks: Number(item.negativeMarks ?? 0.5),
    isPublished: Boolean(item.isPublished),
    createdBy
  }));
}

export async function bulkImportExams(records, { replace = false, createdBy } = {}) {
  const payload = normalizeExamRecords(records, createdBy);
  if (replace) {
    await Exam.deleteMany({});
  }
  const inserted = await Exam.insertMany(payload);
  return { insertedCount: inserted.length };
}

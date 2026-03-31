import mongoose from "mongoose";
import Question from "../models/Question.js";
import ApiError from "../utils/ApiError.js";
import { bulkImportQuestions } from "../services/bulkImportService.js";
import { parseBooleanQuery, parsePagination, sanitizeText } from "../utils/request.js";

function extractImportRecords(body) {
  if (Array.isArray(body)) return body;
  if (body && Array.isArray(body.items)) return body.items;
  return null;
}

export async function createQuestion(req, res, next) {
  try {
    const payload = {
      ...req.body,
      questionText: sanitizeText(req.body?.questionText, { maxLen: 500 }),
      category: sanitizeText(req.body?.category, { maxLen: 80 }),
      explanation: sanitizeText(req.body?.explanation, { maxLen: 800 }),
      options: (req.body?.options || []).map((option) => ({
        ...option,
        text: sanitizeText(option?.text, { maxLen: 300 })
      }))
    };
    const question = await Question.create(payload);
    return res.status(201).json(question);
  } catch (error) {
    return next(error);
  }
}

export async function listQuestions(req, res, next) {
  try {
    const { category, difficulty, isActive } = req.query;
    const { page, limit, skip } = parsePagination(req.query);
    const filter = {};

    if (category) filter.category = sanitizeText(category, { maxLen: 80 });
    if (difficulty) filter.difficulty = difficulty;
    if (typeof isActive !== "undefined") filter.isActive = parseBooleanQuery(isActive);

    const [items, total] = await Promise.all([
      Question.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Question.countDocuments(filter)
    ]);
    return res.status(200).json({
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1
      }
    });
  } catch (error) {
    return next(error);
  }
}

export async function getQuestionById(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid question id");
    }

    const question = await Question.findById(id);
    if (!question) {
      throw new ApiError(404, "Question not found");
    }

    return res.status(200).json(question);
  } catch (error) {
    return next(error);
  }
}

export async function updateQuestion(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid question id");
    }

    const payload = {
      ...req.body
    };
    if (typeof req.body?.questionText !== "undefined") {
      payload.questionText = sanitizeText(req.body.questionText, { maxLen: 500 });
    }
    if (typeof req.body?.category !== "undefined") {
      payload.category = sanitizeText(req.body.category, { maxLen: 80 });
    }
    if (typeof req.body?.explanation !== "undefined") {
      payload.explanation = sanitizeText(req.body.explanation, { maxLen: 800 });
    }
    if (Array.isArray(req.body?.options)) {
      payload.options = req.body.options.map((option) => ({
        ...option,
        text: sanitizeText(option?.text, { maxLen: 300 })
      }));
    }

    const question = await Question.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true
    });

    if (!question) {
      throw new ApiError(404, "Question not found");
    }

    return res.status(200).json(question);
  } catch (error) {
    return next(error);
  }
}

export async function importQuestions(req, res, next) {
  try {
    const records = extractImportRecords(req.body);
    if (!records) {
      throw new ApiError(400, "Send a JSON array or { \"items\": [...], \"replace\": false }");
    }
    const replace =
      (typeof req.body === "object" && req.body !== null && !Array.isArray(req.body) && req.body.replace === true) ||
      req.query.replace === "true";

    const result = await bulkImportQuestions(records, { replace });
    return res.status(201).json({
      message: "Questions imported",
      insertedCount: result.insertedCount,
      replacedAll: replace
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteQuestion(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid question id");
    }

    const question = await Question.findByIdAndDelete(id);
    if (!question) {
      throw new ApiError(404, "Question not found");
    }

    return res.status(200).json({ message: "Question deleted successfully" });
  } catch (error) {
    return next(error);
  }
}

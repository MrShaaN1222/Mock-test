import mongoose from "mongoose";
import Exam from "../models/Exam.js";
import ApiError from "../utils/ApiError.js";
import { parseBooleanQuery, parsePagination, sanitizeText } from "../utils/request.js";

export async function createExam(req, res, next) {
  try {
    const payload = {
      ...req.body,
      title: sanitizeText(req.body?.title, { maxLen: 200 }),
      description: sanitizeText(req.body?.description, { maxLen: 500 }),
      categories: (req.body?.categories || []).map((category) => sanitizeText(category, { maxLen: 80 })),
      createdBy: req.user.sub
    };
    const exam = await Exam.create(payload);
    return res.status(201).json(exam);
  } catch (error) {
    return next(error);
  }
}

export async function listExams(req, res, next) {
  try {
    const { isPublished } = req.query;
    const { page, limit, skip } = parsePagination(req.query);
    const filter = {};

    if (typeof isPublished !== "undefined") filter.isPublished = parseBooleanQuery(isPublished);

    const [items, total] = await Promise.all([
      Exam.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate("createdBy", "name email role"),
      Exam.countDocuments(filter)
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

export async function getExamById(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid exam id");
    }

    const exam = await Exam.findById(id).populate("createdBy", "name email role");
    if (!exam) {
      throw new ApiError(404, "Exam not found");
    }

    return res.status(200).json(exam);
  } catch (error) {
    return next(error);
  }
}

export async function updateExam(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid exam id");
    }

    const payload = {
      ...req.body
    };
    if (typeof req.body?.title !== "undefined") {
      payload.title = sanitizeText(req.body.title, { maxLen: 200 });
    }
    if (typeof req.body?.description !== "undefined") {
      payload.description = sanitizeText(req.body.description, { maxLen: 500 });
    }
    if (Array.isArray(req.body?.categories)) {
      payload.categories = req.body.categories.map((category) => sanitizeText(category, { maxLen: 80 }));
    }

    const exam = await Exam.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true
    }).populate("createdBy", "name email role");

    if (!exam) {
      throw new ApiError(404, "Exam not found");
    }

    return res.status(200).json(exam);
  } catch (error) {
    return next(error);
  }
}

export async function deleteExam(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid exam id");
    }

    const exam = await Exam.findByIdAndDelete(id);
    if (!exam) {
      throw new ApiError(404, "Exam not found");
    }

    return res.status(200).json({ message: "Exam deleted successfully" });
  } catch (error) {
    return next(error);
  }
}

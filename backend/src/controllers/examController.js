import mongoose from "mongoose";
import Exam from "../models/Exam.js";
import ApiError from "../utils/ApiError.js";

export async function createExam(req, res, next) {
  try {
    const payload = {
      ...req.body,
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
    const filter = {};

    if (typeof isPublished !== "undefined") filter.isPublished = isPublished === "true";

    const exams = await Exam.find(filter).sort({ createdAt: -1 }).populate("createdBy", "name email role");
    return res.status(200).json(exams);
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

    const exam = await Exam.findByIdAndUpdate(id, req.body, {
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

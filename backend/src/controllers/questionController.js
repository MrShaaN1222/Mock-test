import mongoose from "mongoose";
import Question from "../models/Question.js";
import ApiError from "../utils/ApiError.js";

export async function createQuestion(req, res, next) {
  try {
    const question = await Question.create(req.body);
    return res.status(201).json(question);
  } catch (error) {
    return next(error);
  }
}

export async function listQuestions(req, res, next) {
  try {
    const { category, difficulty, isActive } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (typeof isActive !== "undefined") filter.isActive = isActive === "true";

    const questions = await Question.find(filter).sort({ createdAt: -1 });
    return res.status(200).json(questions);
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

    const question = await Question.findByIdAndUpdate(id, req.body, {
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

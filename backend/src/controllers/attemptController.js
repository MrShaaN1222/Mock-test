import {
  getAttemptAnalytics,
  getAttemptHistory,
  getExamStartData,
  listPublishedExams,
  saveAttemptProgress,
  startAttempt,
  submitAttempt
} from "../services/attemptService.js";
import {
  validateAttemptSavePayload,
  validateAttemptStartPayload,
  validateAttemptSubmitPayload
} from "../utils/validators.js";

export async function listAvailableExams(req, res, next) {
  try {
    const exams = await listPublishedExams();
    return res.status(200).json(exams);
  } catch (error) {
    return next(error);
  }
}

export async function startExamView(req, res, next) {
  try {
    const data = await getExamStartData({
      examId: req.params.id,
      userId: req.user.sub
    });
    return res.status(200).json(data);
  } catch (error) {
    return next(error);
  }
}

export async function startAttemptController(req, res, next) {
  try {
    validateAttemptStartPayload(req.body);
    const result = await startAttempt({
      examId: req.body.examId,
      userId: req.user.sub
    });
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function saveAttemptController(req, res, next) {
  try {
    validateAttemptSavePayload(req.body);
    const result = await saveAttemptProgress({
      attemptId: req.body.attemptId,
      userId: req.user.sub,
      questionId: req.body.questionId,
      selectedOptionId: req.body.selectedOptionId,
      markedForReview: req.body.markedForReview,
      visited: req.body.visited,
      timeSpentDeltaSeconds: req.body.timeSpentDeltaSeconds
    });
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function submitAttemptController(req, res, next) {
  try {
    validateAttemptSubmitPayload(req.body);
    const result = await submitAttempt({
      attemptId: req.body.attemptId,
      userId: req.user.sub
    });
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function attemptHistoryController(req, res, next) {
  try {
    const result = await getAttemptHistory({
      userId: req.user.sub,
      query: req.query
    });
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function attemptAnalyticsController(req, res, next) {
  try {
    const result = await getAttemptAnalytics({
      userId: req.user.sub
    });
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

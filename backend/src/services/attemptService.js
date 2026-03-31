import mongoose from "mongoose";
import Attempt from "../models/Attempt.js";
import Exam from "../models/Exam.js";
import Question from "../models/Question.js";
import ApiError from "../utils/ApiError.js";
import { parsePagination } from "../utils/request.js";

function shuffleArray(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function toStudentSnapshot(snapshot) {
  return snapshot.map((question) => ({
    questionId: question.questionId,
    questionText: question.questionText,
    options: question.options.map((option) => ({
      optionId: option.optionId,
      text: option.text
    })),
    selectedOptionId: question.selectedOptionId,
    markedForReview: question.markedForReview,
    visited: question.visited,
    answeredAt: question.answeredAt,
    timeSpentSeconds: question.timeSpentSeconds
  }));
}

function summarizeAttempt(attempt, exam) {
  return {
    id: attempt._id,
    examId: exam._id,
    title: exam.title,
    durationMinutes: exam.durationMinutes,
    marksPerQuestion: exam.marksPerQuestion,
    negativeMarks: exam.negativeMarks,
    status: attempt.status,
    startedAt: attempt.startedAt,
    expiresAt: attempt.expiresAt,
    submittedAt: attempt.submittedAt,
    score: attempt.score,
    totalCorrect: attempt.totalCorrect,
    totalWrong: attempt.totalWrong,
    totalUnanswered: attempt.totalUnanswered,
    totalTimeSpentSeconds: attempt.totalTimeSpentSeconds,
    snapshot: toStudentSnapshot(attempt.snapshot)
  };
}

export function calculateAttemptMetrics(snapshot, marksPerQuestion, negativeMarks) {
  let totalCorrect = 0;
  let totalWrong = 0;
  let totalUnanswered = 0;

  for (const item of snapshot) {
    if (!item.selectedOptionId) {
      totalUnanswered += 1;
      continue;
    }

    const selected = item.options.find((option) => option.optionId === item.selectedOptionId);
    if (!selected) {
      totalUnanswered += 1;
      continue;
    }

    if (selected.isCorrect) {
      totalCorrect += 1;
    } else {
      totalWrong += 1;
    }
  }

  const score = Number((totalCorrect * marksPerQuestion - totalWrong * negativeMarks).toFixed(2));

  return { score, totalCorrect, totalWrong, totalUnanswered };
}

export async function autoSubmitIfExpired(attempt, exam) {
  if (!attempt || attempt.status !== "in_progress") {
    return attempt;
  }

  if (attempt.expiresAt > new Date()) {
    return attempt;
  }

  return submitAttempt({
    attemptId: attempt._id.toString(),
    userId: attempt.user.toString(),
    forceExpiredStatus: true,
    preloadedExam: exam
  });
}

export async function listPublishedExams() {
  return Exam.find({ isPublished: true })
    .select("title description totalQuestions durationMinutes marksPerQuestion negativeMarks categories")
    .sort({ createdAt: -1 });
}

export async function getExamStartData({ examId, userId }) {
  if (!mongoose.Types.ObjectId.isValid(examId)) {
    throw new ApiError(400, "Invalid exam id");
  }

  const exam = await Exam.findOne({ _id: examId, isPublished: true });
  if (!exam) {
    throw new ApiError(404, "Exam not found or not published");
  }

  let attempt = await Attempt.findOne({
    user: userId,
    exam: exam._id,
    status: "in_progress"
  }).sort({ createdAt: -1 });

  attempt = await autoSubmitIfExpired(attempt, exam);

  return {
    exam: {
      id: exam._id,
      title: exam.title,
      description: exam.description,
      categories: exam.categories,
      totalQuestions: exam.totalQuestions,
      durationMinutes: exam.durationMinutes,
      marksPerQuestion: exam.marksPerQuestion,
      negativeMarks: exam.negativeMarks
    },
    inProgressAttempt: attempt ? summarizeAttempt(attempt, exam) : null
  };
}

export async function startAttempt({ examId, userId }) {
  if (!mongoose.Types.ObjectId.isValid(examId)) {
    throw new ApiError(400, "Invalid exam id");
  }

  const exam = await Exam.findOne({ _id: examId, isPublished: true });
  if (!exam) {
    throw new ApiError(404, "Exam not found or not published");
  }

  let existing = await Attempt.findOne({
    user: userId,
    exam: exam._id,
    status: "in_progress"
  }).sort({ createdAt: -1 });

  existing = await autoSubmitIfExpired(existing, exam);
  if (existing && existing.status === "in_progress") {
    return summarizeAttempt(existing, exam);
  }

  const questions = await Question.find({
    category: { $in: exam.categories },
    isActive: true
  }).lean();

  if (questions.length < exam.totalQuestions) {
    throw new ApiError(400, "Not enough active questions available for this exam");
  }

  const pickedQuestions = shuffleArray(questions).slice(0, exam.totalQuestions);
  const snapshot = pickedQuestions.map((question) => {
    const shuffledOptions = shuffleArray(question.options).map((option, index) => ({
      optionId: `opt_${index + 1}`,
      text: option.text,
      isCorrect: option.isCorrect
    }));

    return {
      questionId: question._id,
      questionText: question.questionText,
      options: shuffledOptions
    };
  });

  const startedAt = new Date();
  const expiresAt = new Date(startedAt.getTime() + exam.durationMinutes * 60 * 1000);

  const attempt = await Attempt.create({
    user: userId,
    exam: exam._id,
    snapshot,
    startedAt,
    expiresAt
  });

  return summarizeAttempt(attempt, exam);
}

export async function saveAttemptProgress({
  attemptId,
  userId,
  questionId,
  selectedOptionId,
  markedForReview,
  visited,
  timeSpentDeltaSeconds
}) {
  if (!mongoose.Types.ObjectId.isValid(attemptId)) {
    throw new ApiError(400, "Invalid attempt id");
  }
  if (!mongoose.Types.ObjectId.isValid(questionId)) {
    throw new ApiError(400, "Invalid question id");
  }

  const attempt = await Attempt.findOne({
    _id: attemptId,
    user: userId
  });
  if (!attempt) {
    throw new ApiError(404, "Attempt not found");
  }

  const exam = await Exam.findById(attempt.exam);
  if (!exam) {
    throw new ApiError(404, "Exam not found");
  }

  const currentAttempt = await autoSubmitIfExpired(attempt, exam);
  if (currentAttempt.status !== "in_progress") {
    return summarizeAttempt(currentAttempt, exam);
  }

  const questionState = currentAttempt.snapshot.find(
    (item) => item.questionId.toString() === questionId.toString()
  );
  if (!questionState) {
    throw new ApiError(404, "Question not found in this attempt");
  }

  if (typeof selectedOptionId !== "undefined") {
    if (selectedOptionId === null || selectedOptionId === "") {
      questionState.selectedOptionId = null;
      questionState.answeredAt = null;
    } else {
      const optionExists = questionState.options.some((option) => option.optionId === selectedOptionId);
      if (!optionExists) {
        throw new ApiError(400, "Invalid selected option id");
      }
      questionState.selectedOptionId = selectedOptionId;
      questionState.answeredAt = new Date();
    }
  }

  if (typeof markedForReview === "boolean") {
    questionState.markedForReview = markedForReview;
  }

  if (typeof visited === "boolean") {
    questionState.visited = visited;
  }

  if (typeof timeSpentDeltaSeconds === "number" && Number.isFinite(timeSpentDeltaSeconds)) {
    questionState.timeSpentSeconds = Math.max(0, questionState.timeSpentSeconds + timeSpentDeltaSeconds);
  }

  currentAttempt.totalTimeSpentSeconds = currentAttempt.snapshot.reduce(
    (sum, item) => sum + (item.timeSpentSeconds || 0),
    0
  );

  await currentAttempt.save();
  return summarizeAttempt(currentAttempt, exam);
}

export async function submitAttempt({ attemptId, userId, forceExpiredStatus = false, preloadedExam = null }) {
  if (!mongoose.Types.ObjectId.isValid(attemptId)) {
    throw new ApiError(400, "Invalid attempt id");
  }

  const attempt = await Attempt.findOne({
    _id: attemptId,
    user: userId
  });
  if (!attempt) {
    throw new ApiError(404, "Attempt not found");
  }

  const exam = preloadedExam || (await Exam.findById(attempt.exam));
  if (!exam) {
    throw new ApiError(404, "Exam not found");
  }

  if (attempt.status !== "in_progress") {
    return summarizeAttempt(attempt, exam);
  }

  const { score, totalCorrect, totalWrong, totalUnanswered } = calculateAttemptMetrics(
    attempt.snapshot,
    exam.marksPerQuestion,
    exam.negativeMarks
  );

  attempt.totalCorrect = totalCorrect;
  attempt.totalWrong = totalWrong;
  attempt.totalUnanswered = totalUnanswered;
  attempt.score = score;
  attempt.totalTimeSpentSeconds = attempt.snapshot.reduce(
    (sum, item) => sum + (item.timeSpentSeconds || 0),
    0
  );
  attempt.status = forceExpiredStatus ? "expired" : "submitted";
  attempt.submittedAt = new Date();

  await attempt.save();

  return summarizeAttempt(attempt, exam);
}

export async function getAttemptHistory({ userId, query }) {
  const { page, limit, skip } = parsePagination(query, { page: 1, limit: 10, maxLimit: 50 });
  const baseFilter = {
    user: userId,
    status: { $in: ["submitted", "expired"] }
  };

  const [items, total] = await Promise.all([
    Attempt.find(baseFilter)
      .sort({ submittedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("exam", "title categories totalQuestions marksPerQuestion")
      .lean(),
    Attempt.countDocuments(baseFilter)
  ]);

  return {
    items: items.map((attempt) => {
      const totalQuestions = attempt.snapshot?.length || attempt.exam?.totalQuestions || 0;
      const maxScore = totalQuestions * (attempt.exam?.marksPerQuestion || 0);
      return {
        id: attempt._id,
        examId: attempt.exam?._id,
        title: attempt.exam?.title || "Exam",
        categories: attempt.exam?.categories || [],
        score: attempt.score,
        maxScore,
        totalCorrect: attempt.totalCorrect,
        totalWrong: attempt.totalWrong,
        totalUnanswered: attempt.totalUnanswered,
        totalTimeSpentSeconds: attempt.totalTimeSpentSeconds,
        status: attempt.status,
        submittedAt: attempt.submittedAt || attempt.updatedAt
      };
    }),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1
    }
  };
}

export async function getAttemptAnalytics({ userId }) {
  const attempts = await Attempt.find({
    user: userId,
    status: { $in: ["submitted", "expired"] }
  })
    .sort({ submittedAt: -1, createdAt: -1 })
    .populate("exam", "title categories totalQuestions marksPerQuestion")
    .lean();

  const trend = attempts.slice(0, 10).reverse().map((attempt) => {
    const totalQuestions = attempt.snapshot?.length || attempt.exam?.totalQuestions || 0;
    return {
      id: attempt._id,
      title: attempt.exam?.title || "Exam",
      score: attempt.score,
      maxScore: totalQuestions * (attempt.exam?.marksPerQuestion || 0),
      submittedAt: attempt.submittedAt || attempt.updatedAt
    };
  });

  const correctness = attempts.reduce(
    (acc, attempt) => {
      acc.correct += attempt.totalCorrect || 0;
      acc.wrong += attempt.totalWrong || 0;
      acc.unanswered += attempt.totalUnanswered || 0;
      return acc;
    },
    { correct: 0, wrong: 0, unanswered: 0 }
  );

  const totalTimeSpentSeconds = attempts.reduce((sum, attempt) => sum + (attempt.totalTimeSpentSeconds || 0), 0);
  const averageScore = attempts.length
    ? Number((attempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / attempts.length).toFixed(2))
    : 0;

  const questionIds = [
    ...new Set(
      attempts.flatMap((attempt) => (attempt.snapshot || []).map((item) => item.questionId?.toString()).filter(Boolean))
    )
  ];
  const questions = questionIds.length
    ? await Question.find({ _id: { $in: questionIds } }).select("_id category").lean()
    : [];
  const categoryMap = new Map(questions.map((item) => [item._id.toString(), item.category || "Uncategorized"]));

  const sectionBuckets = new Map();
  for (const attempt of attempts) {
    for (const item of attempt.snapshot || []) {
      const category = categoryMap.get(item.questionId?.toString()) || "Uncategorized";
      const selected = (item.options || []).find((option) => option.optionId === item.selectedOptionId);
      const bucket = sectionBuckets.get(category) || { category, correct: 0, wrong: 0, unanswered: 0, timeSpent: 0 };
      if (!item.selectedOptionId || !selected) {
        bucket.unanswered += 1;
      } else if (selected.isCorrect) {
        bucket.correct += 1;
      } else {
        bucket.wrong += 1;
      }
      bucket.timeSpent += item.timeSpentSeconds || 0;
      sectionBuckets.set(category, bucket);
    }
  }

  return {
    attemptsCount: attempts.length,
    averageScore,
    correctness,
    scoreTrend: trend,
    sectionWiseStats: [...sectionBuckets.values()],
    timeSpentSummary: {
      totalSeconds: totalTimeSpentSeconds,
      averageSecondsPerAttempt: attempts.length ? Math.round(totalTimeSpentSeconds / attempts.length) : 0
    }
  };
}

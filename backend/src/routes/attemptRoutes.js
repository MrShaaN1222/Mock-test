import { Router } from "express";
import {
  attemptAnalyticsController,
  attemptHistoryController,
  listAvailableExams,
  saveAttemptController,
  startAttemptController,
  startExamView,
  submitAttemptController
} from "../controllers/attemptController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const attemptRouter = Router();

attemptRouter.use(authMiddleware);

attemptRouter.get("/exams", listAvailableExams);
attemptRouter.get("/attempt/history", attemptHistoryController);
attemptRouter.get("/attempt/analytics", attemptAnalyticsController);
attemptRouter.get("/exam/:id/start", startExamView);
attemptRouter.post("/attempt/start", startAttemptController);
attemptRouter.post("/attempt/save", saveAttemptController);
attemptRouter.post("/attempt/submit", submitAttemptController);

export default attemptRouter;

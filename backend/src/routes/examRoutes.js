import { Router } from "express";
import {
  createExam,
  deleteExam,
  getExamById,
  importExams,
  listExams,
  updateExam
} from "../controllers/examController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const examRouter = Router();

examRouter.use(authMiddleware, roleMiddleware("admin"));

examRouter.post("/import", importExams);
examRouter.get("/", listExams);
examRouter.get("/:id", getExamById);
examRouter.post("/", createExam);
examRouter.put("/:id", updateExam);
examRouter.delete("/:id", deleteExam);

export default examRouter;

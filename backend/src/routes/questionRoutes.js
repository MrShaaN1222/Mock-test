import { Router } from "express";
import {
  createQuestion,
  deleteQuestion,
  getQuestionById,
  importQuestions,
  listQuestions,
  updateQuestion
} from "../controllers/questionController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const questionRouter = Router();

questionRouter.use(authMiddleware, roleMiddleware("admin"));

questionRouter.post("/import", importQuestions);
questionRouter.get("/", listQuestions);
questionRouter.get("/:id", getQuestionById);
questionRouter.post("/", createQuestion);
questionRouter.put("/:id", updateQuestion);
questionRouter.delete("/:id", deleteQuestion);

export default questionRouter;

import { Router } from "express";
import authRouter from "./authRoutes.js";
import questionRouter from "./questionRoutes.js";
import examRouter from "./examRoutes.js";
import userRouter from "./userRoutes.js";
import attemptRouter from "./attemptRoutes.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/questions", questionRouter);
router.use("/admin/exams", examRouter);
router.use("/users", userRouter);

router.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "ssc-cbt-backend",
    timestamp: new Date().toISOString()
  });
});

router.get("/", (_req, res) => {
  res.status(200).json({
    message: "SSC CBT API root"
  });
});

router.use("/", attemptRouter);

export default router;

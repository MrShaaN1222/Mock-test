import { Router } from "express";
import {
  adminOnlyController,
  loginController,
  meController,
  registerController
} from "../controllers/authController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const authRouter = Router();

authRouter.post("/register", registerController);
authRouter.post("/login", loginController);

authRouter.get("/me", authMiddleware, meController);
authRouter.get("/admin-check", authMiddleware, roleMiddleware("admin"), adminOnlyController);

export default authRouter;

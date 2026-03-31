import { Router } from "express";
import {
  blockUser,
  getUserById,
  listUsers,
  unblockUser,
  updateUser
} from "../controllers/userController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const userRouter = Router();

userRouter.use(authMiddleware, roleMiddleware("admin"));

userRouter.get("/", listUsers);
userRouter.get("/:id", getUserById);
userRouter.patch("/:id", updateUser);
userRouter.patch("/:id/block", blockUser);
userRouter.patch("/:id/unblock", unblockUser);

export default userRouter;

import { login, register } from "../services/authService.js";
import { validateAuthPayload } from "../utils/validators.js";

export async function registerController(req, res, next) {
  try {
    validateAuthPayload(req.body, "register");
    const result = await register(req.body);
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function loginController(req, res, next) {
  try {
    validateAuthPayload(req.body, "login");
    const result = await login(req.body);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

export function meController(req, res) {
  return res.status(200).json({
    user: req.user
  });
}

export function adminOnlyController(_req, res) {
  return res.status(200).json({
    message: "Admin authorization check passed"
  });
}

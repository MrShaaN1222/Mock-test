import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";

export function notFoundHandler(req, _res, next) {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
}

export function errorHandler(err, req, res, _next) {
  const elapsedMs = req.requestStartedAt ? Date.now() - req.requestStartedAt : undefined;

  if (err instanceof ApiError) {
    console.warn(
      JSON.stringify({
        level: "warn",
        event: "handled_api_error",
        method: req.method,
        path: req.originalUrl,
        statusCode: err.statusCode,
        message: err.message,
        elapsedMs
      })
    );
    return res.status(err.statusCode).json({
      message: err.message,
      details: err.details
    });
  }

  if (err instanceof mongoose.Error.ValidationError) {
    console.warn(
      JSON.stringify({
        level: "warn",
        event: "mongoose_validation_error",
        method: req.method,
        path: req.originalUrl,
        statusCode: 400,
        elapsedMs
      })
    );
    return res.status(400).json({
      message: "Validation failed",
      details: err.errors
    });
  }

  if (err?.name === "JsonWebTokenError" || err?.name === "TokenExpiredError") {
    console.warn(
      JSON.stringify({
        level: "warn",
        event: "auth_token_error",
        method: req.method,
        path: req.originalUrl,
        statusCode: 401,
        elapsedMs
      })
    );
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }

  console.error(
    JSON.stringify({
      level: "error",
      event: "unhandled_error",
      method: req.method,
      path: req.originalUrl,
      statusCode: 500,
      elapsedMs,
      message: err?.message || "Internal server error"
    })
  );
  return res.status(500).json({
    message: "Internal server error"
  });
}

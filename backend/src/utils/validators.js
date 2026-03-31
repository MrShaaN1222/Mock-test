import ApiError from "./ApiError.js";

export function validateAuthPayload(payload, mode) {
  const email = payload?.email?.trim()?.toLowerCase();
  const password = payload?.password;
  const name = payload?.name?.trim();

  if (!email || !password || (mode === "register" && !name)) {
    throw new ApiError(
      400,
      mode === "register" ? "Name, email and password are required" : "Email and password are required"
    );
  }

  if (!email.includes("@")) {
    throw new ApiError(400, "Please provide a valid email");
  }

  if (String(password).length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters");
  }
}

export function validateAttemptStartPayload(payload) {
  if (!payload?.examId) {
    throw new ApiError(400, "examId is required");
  }
}

export function validateAttemptSavePayload(payload) {
  if (!payload?.attemptId || !payload?.questionId) {
    throw new ApiError(400, "attemptId and questionId are required");
  }

  if (
    typeof payload?.timeSpentDeltaSeconds !== "undefined" &&
    (typeof payload.timeSpentDeltaSeconds !== "number" || !Number.isFinite(payload.timeSpentDeltaSeconds))
  ) {
    throw new ApiError(400, "timeSpentDeltaSeconds must be a valid number");
  }
}

export function validateAttemptSubmitPayload(payload) {
  if (!payload?.attemptId) {
    throw new ApiError(400, "attemptId is required");
  }
}

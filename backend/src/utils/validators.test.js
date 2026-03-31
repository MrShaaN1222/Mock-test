import test from "node:test";
import assert from "node:assert/strict";
import { validateAuthPayload, validateAttemptSavePayload } from "./validators.js";

test("validateAuthPayload accepts valid login payload", () => {
  assert.doesNotThrow(() => {
    validateAuthPayload({ email: "student@example.com", password: "secret123" }, "login");
  });
});

test("validateAuthPayload rejects weak password", () => {
  assert.throws(() => {
    validateAuthPayload({ email: "student@example.com", password: "123" }, "login");
  });
});

test("validateAttemptSavePayload rejects invalid timeSpentDeltaSeconds", () => {
  assert.throws(() => {
    validateAttemptSavePayload({
      attemptId: "x",
      questionId: "y",
      timeSpentDeltaSeconds: "not-number"
    });
  });
});

import test from "node:test";
import assert from "node:assert/strict";
import { calculateAttemptMetrics } from "./attemptService.js";

test("calculateAttemptMetrics computes score and counts", () => {
  const snapshot = [
    {
      selectedOptionId: "a",
      options: [
        { optionId: "a", isCorrect: true },
        { optionId: "b", isCorrect: false }
      ]
    },
    {
      selectedOptionId: "b",
      options: [
        { optionId: "a", isCorrect: true },
        { optionId: "b", isCorrect: false }
      ]
    },
    {
      selectedOptionId: null,
      options: [
        { optionId: "a", isCorrect: true },
        { optionId: "b", isCorrect: false }
      ]
    }
  ];

  const result = calculateAttemptMetrics(snapshot, 2, 0.5);
  assert.equal(result.totalCorrect, 1);
  assert.equal(result.totalWrong, 1);
  assert.equal(result.totalUnanswered, 1);
  assert.equal(result.score, 1.5);
});

test("calculateAttemptMetrics treats invalid selected option as unanswered", () => {
  const snapshot = [
    {
      selectedOptionId: "missing",
      options: [{ optionId: "a", isCorrect: true }]
    }
  ];

  const result = calculateAttemptMetrics(snapshot, 2, 0.5);
  assert.equal(result.totalCorrect, 0);
  assert.equal(result.totalWrong, 0);
  assert.equal(result.totalUnanswered, 1);
  assert.equal(result.score, 0);
});

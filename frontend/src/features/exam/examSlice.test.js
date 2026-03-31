import { describe, expect, it } from "vitest";
import examReducer, {
  decrementTimer,
  fetchAvailableExamsThunk,
  resetExamRuntime,
  setQuestionState,
  setTimerSecondsLeft
} from "./examSlice";

describe("examSlice reducer", () => {
  it("handles available exams fetch success", () => {
    const action = fetchAvailableExamsThunk.fulfilled(
      [{ id: "exam-1", title: "Mock Exam", durationMinutes: 60 }],
      "request-id",
      { token: "token" }
    );
    const state = examReducer(undefined, action);
    expect(state.status).toBe("succeeded");
    expect(state.exams).toHaveLength(1);
    expect(state.exams[0].title).toBe("Mock Exam");
  });

  it("decrements timer by one second", () => {
    let state = examReducer(undefined, setTimerSecondsLeft(10));
    state = examReducer(state, decrementTimer());
    expect(state.timerSecondsLeft).toBe(9);
  });

  it("updates a question state in snapshot", () => {
    const seeded = {
      ...examReducer(undefined, { type: "@@INIT" }),
      currentAttempt: {
        snapshot: [
          {
            questionId: "q1",
            selectedOptionId: null,
            markedForReview: false
          }
        ]
      }
    };

    const state = examReducer(
      seeded,
      setQuestionState({
        questionId: "q1",
        updates: {
          selectedOptionId: "opt_2",
          markedForReview: true
        }
      })
    );

    expect(state.currentAttempt.snapshot[0].selectedOptionId).toBe("opt_2");
    expect(state.currentAttempt.snapshot[0].markedForReview).toBe(true);
  });

  it("resets runtime state", () => {
    const dirty = {
      ...examReducer(undefined, { type: "@@INIT" }),
      selectedExam: { id: "exam-1" },
      currentAttempt: { id: "attempt-1" },
      result: { score: 12 },
      timerSecondsLeft: 123,
      tabSwitchCount: 3
    };

    const state = examReducer(dirty, resetExamRuntime());
    expect(state.selectedExam).toBeNull();
    expect(state.currentAttempt).toBeNull();
    expect(state.result).toBeNull();
    expect(state.timerSecondsLeft).toBe(0);
    expect(state.tabSwitchCount).toBe(0);
  });
});

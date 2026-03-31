import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiClient, withAuth } from "../../api/client";

export const fetchAvailableExamsThunk = createAsyncThunk(
  "exam/fetchAvailable",
  async ({ token }) => {
    return apiClient.get("/exams", withAuth(token));
  }
);

export const fetchExamStartThunk = createAsyncThunk("exam/fetchStart", async ({ token, examId }) => {
  return apiClient.get(`/exam/${examId}/start`, withAuth(token));
});

export const startAttemptThunk = createAsyncThunk("exam/startAttempt", async ({ token, examId }) => {
  return apiClient.post("/attempt/start", { examId }, withAuth(token));
});

export const saveAttemptThunk = createAsyncThunk(
  "exam/saveAttempt",
  async ({ token, payload }, { rejectWithValue }) => {
    try {
      return await apiClient.post("/attempt/save", payload, withAuth(token));
    } catch (error) {
      return rejectWithValue(error.message || "Failed to save attempt");
    }
  }
);

export const submitAttemptThunk = createAsyncThunk(
  "exam/submitAttempt",
  async ({ token, attemptId }, { rejectWithValue }) => {
    try {
      return await apiClient.post("/attempt/submit", { attemptId }, withAuth(token));
    } catch (error) {
      return rejectWithValue(error.message || "Failed to submit attempt");
    }
  }
);

const examSlice = createSlice({
  name: "exam",
  initialState: {
    exams: [],
    selectedExam: null,
    currentAttempt: null,
    result: null,
    timerSecondsLeft: 0,
    autosaveQueue: [],
    tabSwitchCount: 0,
    status: "idle",
    error: null
  },
  reducers: {
    setCurrentAttempt(state, action) {
      state.currentAttempt = action.payload;
    },
    setTimerSecondsLeft(state, action) {
      state.timerSecondsLeft = action.payload;
    },
    enqueueAutosave(state, action) {
      state.autosaveQueue.push(action.payload);
    },
    clearAutosaveQueue(state) {
      state.autosaveQueue = [];
    },
    decrementTimer(state) {
      if (state.timerSecondsLeft > 0) {
        state.timerSecondsLeft -= 1;
      }
    },
    setQuestionState(state, action) {
      const { questionId, updates } = action.payload;
      if (!state.currentAttempt?.snapshot) return;
      const question = state.currentAttempt.snapshot.find((item) => item.questionId === questionId);
      if (!question) return;
      Object.assign(question, updates);
    },
    incrementTabSwitchCount(state) {
      state.tabSwitchCount += 1;
    },
    resetExamRuntime(state) {
      state.selectedExam = null;
      state.currentAttempt = null;
      state.result = null;
      state.timerSecondsLeft = 0;
      state.autosaveQueue = [];
      state.tabSwitchCount = 0;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAvailableExamsThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAvailableExamsThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.exams = action.payload || [];
      })
      .addCase(fetchAvailableExamsThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch exams";
      })
      .addCase(fetchExamStartThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchExamStartThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.selectedExam = action.payload.exam;
        state.currentAttempt = action.payload.inProgressAttempt;
        if (action.payload.inProgressAttempt) {
          const expiresAtMs = new Date(action.payload.inProgressAttempt.expiresAt).getTime();
          state.timerSecondsLeft = Math.max(0, Math.floor((expiresAtMs - Date.now()) / 1000));
        }
      })
      .addCase(fetchExamStartThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to load exam";
      })
      .addCase(startAttemptThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(startAttemptThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentAttempt = action.payload;
        const expiresAtMs = new Date(action.payload.expiresAt).getTime();
        state.timerSecondsLeft = Math.max(0, Math.floor((expiresAtMs - Date.now()) / 1000));
      })
      .addCase(startAttemptThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to start attempt";
      })
      .addCase(saveAttemptThunk.fulfilled, (state, action) => {
        state.currentAttempt = action.payload;
      })
      .addCase(saveAttemptThunk.rejected, (state, action) => {
        state.error = action.payload || action.error.message || "Autosave failed";
      })
      .addCase(submitAttemptThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(submitAttemptThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentAttempt = action.payload;
        state.result = action.payload;
      })
      .addCase(submitAttemptThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message || "Submit failed";
      });
  }
});

export const {
  setCurrentAttempt,
  setTimerSecondsLeft,
  enqueueAutosave,
  clearAutosaveQueue,
  decrementTimer,
  setQuestionState,
  incrementTabSwitchCount,
  resetExamRuntime
} = examSlice.actions;
export default examSlice.reducer;

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import ExamActions from "../../components/exam/ExamActions";
import QuestionNavigator from "../../components/exam/QuestionNavigator";
import QuestionPanel from "../../components/exam/QuestionPanel";
import SubmitConfirmModal from "../../components/exam/SubmitConfirmModal";
import ErrorState from "../../components/common/ErrorState";
import {
  decrementTimer,
  fetchExamStartThunk,
  incrementTabSwitchCount,
  saveAttemptThunk,
  setQuestionState,
  submitAttemptThunk
} from "../../features/exam/examSlice";

function formatSeconds(total) {
  const m = Math.floor(total / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(total % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

export default function ExamPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeIndex, setActiveIndex] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const { accessToken } = useSelector((state) => state.auth);
  const { selectedExam, currentAttempt, timerSecondsLeft, tabSwitchCount, error } = useSelector(
    (state) => state.exam
  );

  useEffect(() => {
    if (!currentAttempt && accessToken && examId) {
      dispatch(fetchExamStartThunk({ token: accessToken, examId }));
    }
  }, [accessToken, currentAttempt, dispatch, examId]);

  useEffect(() => {
    if (!currentAttempt?.id) return undefined;
    const interval = setInterval(() => {
      dispatch(decrementTimer());
    }, 1000);
    return () => clearInterval(interval);
  }, [currentAttempt?.id, dispatch]);

  useEffect(() => {
    if (timerSecondsLeft !== 0 || !currentAttempt?.id) return;
    dispatch(submitAttemptThunk({ token: accessToken, attemptId: currentAttempt.id })).then((action) => {
      if (!action.error) navigate("/student/result");
    });
  }, [accessToken, currentAttempt?.id, dispatch, navigate, timerSecondsLeft]);

  useEffect(() => {
    function onVisibilityChange() {
      if (document.hidden) {
        dispatch(incrementTabSwitchCount());
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [dispatch]);

  const questions = useMemo(() => currentAttempt?.snapshot || [], [currentAttempt?.snapshot]);
  const activeQuestion = questions[activeIndex];

  if (!selectedExam || !currentAttempt) {
    return <ErrorState message="Attempt not found. Start exam from instructions page." />;
  }

  async function persistQuestion(questionId, payload) {
    await dispatch(
      saveAttemptThunk({
        token: accessToken,
        payload: {
          attemptId: currentAttempt.id,
          questionId,
          ...payload
        }
      })
    );
  }

  async function handleSelectOption(optionId) {
    if (!activeQuestion) return;
    dispatch(
      setQuestionState({
        questionId: activeQuestion.questionId,
        updates: { selectedOptionId: optionId, visited: true }
      })
    );
    await persistQuestion(activeQuestion.questionId, {
      selectedOptionId: optionId,
      visited: true
    });
  }

  async function handleSaveAndNext() {
    if (!activeQuestion) return;
    await persistQuestion(activeQuestion.questionId, {
      selectedOptionId: activeQuestion.selectedOptionId,
      visited: true,
      markedForReview: activeQuestion.markedForReview,
      timeSpentDeltaSeconds: 5
    });
    setActiveIndex((index) => Math.min(questions.length - 1, index + 1));
  }

  async function handleMarkForReview() {
    if (!activeQuestion) return;
    const nextValue = !activeQuestion.markedForReview;
    dispatch(
      setQuestionState({
        questionId: activeQuestion.questionId,
        updates: { markedForReview: nextValue, visited: true }
      })
    );
    await persistQuestion(activeQuestion.questionId, {
      markedForReview: nextValue,
      visited: true
    });
  }

  async function handleClearResponse() {
    if (!activeQuestion) return;
    dispatch(
      setQuestionState({
        questionId: activeQuestion.questionId,
        updates: { selectedOptionId: null, visited: true }
      })
    );
    await persistQuestion(activeQuestion.questionId, {
      selectedOptionId: null,
      visited: true
    });
  }

  function handlePrev() {
    setActiveIndex((index) => Math.max(0, index - 1));
  }

  function handleNext() {
    setActiveIndex((index) => Math.min(questions.length - 1, index + 1));
  }

  async function handleSubmit() {
    const action = await dispatch(
      submitAttemptThunk({
        token: accessToken,
        attemptId: currentAttempt.id
      })
    );
    if (!action.error) {
      navigate("/student/result");
    }
  }

  return (
    <section style={{ display: "grid", gap: "14px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>{selectedExam.title}</h2>
        <div>
          <strong>Time Left: {formatSeconds(timerSecondsLeft)}</strong>
        </div>
      </header>

      {timerSecondsLeft <= 60 && (
        <div style={{ color: "#b91c1c", fontWeight: 700 }}>Warning: less than 1 minute remaining.</div>
      )}

      <div
        style={{
          padding: "8px 10px",
          border: "1px solid #fde68a",
          borderRadius: "8px",
          backgroundColor: "#fffbeb",
          color: "#92400e"
        }}
      >
        Tab switch detected: {tabSwitchCount}
      </div>

      {error && <ErrorState message={error} />}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "20px" }}>
        <QuestionPanel
          question={activeQuestion}
          questionNumber={activeIndex + 1}
          onSelectOption={handleSelectOption}
        />
        <QuestionNavigator questions={questions} activeIndex={activeIndex} onJump={setActiveIndex} />
      </div>

      <ExamActions
        onPrev={handlePrev}
        onNext={handleNext}
        onSaveAndNext={handleSaveAndNext}
        onMarkForReview={handleMarkForReview}
        onClearResponse={handleClearResponse}
        onSubmit={() => setShowSubmitModal(true)}
      />

      <SubmitConfirmModal
        open={showSubmitModal}
        onCancel={() => setShowSubmitModal(false)}
        onConfirm={handleSubmit}
      />
    </section>
  );
}

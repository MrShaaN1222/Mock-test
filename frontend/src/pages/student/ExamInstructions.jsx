import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import ErrorState from "../../components/common/ErrorState";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { fetchExamStartThunk, startAttemptThunk } from "../../features/exam/examSlice";

export default function ExamInstructions() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { accessToken } = useSelector((state) => state.auth);
  const { selectedExam, currentAttempt, status, error } = useSelector((state) => state.exam);

  useEffect(() => {
    if (accessToken && examId) {
      dispatch(fetchExamStartThunk({ token: accessToken, examId }));
    }
  }, [accessToken, dispatch, examId]);

  async function handleStart() {
    const resultAction = await dispatch(startAttemptThunk({ token: accessToken, examId }));
    if (!resultAction.error) {
      navigate(`/student/exam/${examId}`);
    }
  }

  return (
    <section style={{ display: "grid", gap: "12px" }}>
      <h2>Exam Instructions</h2>
      {status === "loading" && <LoadingSpinner label="Loading exam instructions..." />}
      {error && <ErrorState message={error} />}
      {selectedExam && (
        <>
          <p>
            <strong>{selectedExam.title}</strong>
          </p>
          <ul>
            <li>Total Questions: {selectedExam.totalQuestions}</li>
            <li>Duration: {selectedExam.durationMinutes} minutes</li>
            <li>Marks Per Question: {selectedExam.marksPerQuestion}</li>
            <li>Negative Marks: {selectedExam.negativeMarks}</li>
          </ul>
          <ol>
            <li>Use Save & Next after choosing an option.</li>
            <li>You can mark questions for review.</li>
            <li>Switching tabs will be tracked.</li>
            <li>Exam auto-submits when timer expires.</li>
          </ol>
          <div style={{ display: "flex", gap: "8px" }}>
            <Link to="/student">Back</Link>
            {currentAttempt?.status === "in_progress" ? (
              <button type="button" onClick={() => navigate(`/student/exam/${examId}`)}>
                Resume Attempt
              </button>
            ) : (
              <button type="button" onClick={handleStart}>
                Start Exam
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
}

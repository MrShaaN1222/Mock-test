import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { resetExamRuntime } from "../../features/exam/examSlice";

export default function ResultPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const result = useSelector((state) => state.exam.result);

  if (!result) {
    return (
      <section>
        <h2>No Result Found</h2>
        <button type="button" onClick={() => navigate("/student")}>
          Back to Dashboard
        </button>
      </section>
    );
  }

  const maxScore = result.snapshot.length * result.marksPerQuestion;

  return (
    <section style={{ display: "grid", gap: "10px" }}>
      <h2>Exam Result</h2>
      <p>Status: {result.status}</p>
      <p>
        Score: <strong>{result.score}</strong> / {maxScore}
      </p>
      <p>Correct: {result.totalCorrect}</p>
      <p>Wrong: {result.totalWrong}</p>
      <p>Unanswered: {result.totalUnanswered}</p>
      <p>Time Spent: {result.totalTimeSpentSeconds} seconds</p>
      <Link
        to="/student"
        onClick={() => {
          dispatch(resetExamRuntime());
        }}
      >
        Back to Dashboard
      </Link>
    </section>
  );
}

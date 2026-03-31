import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorState from "../../components/common/ErrorState";
import { fetchAvailableExamsThunk } from "../../features/exam/examSlice";

export default function StudentDashboard() {
  const dispatch = useDispatch();
  const { accessToken } = useSelector((state) => state.auth);
  const { exams, status, error } = useSelector((state) => state.exam);

  useEffect(() => {
    if (accessToken) {
      dispatch(fetchAvailableExamsThunk({ token: accessToken }));
    }
  }, [accessToken, dispatch]);

  return (
    <section>
      <h2>Student Dashboard</h2>
      <p>Available exams</p>
      <p>
        <Link to="/student/analytics">View performance analytics</Link>
      </p>
      {status === "loading" && <LoadingSpinner label="Loading exams..." />}
      {error && <ErrorState message={error} />}
      {status === "succeeded" && exams.length === 0 && (
        <p>No published exams available yet. Ask admin to publish an exam.</p>
      )}
      <ul style={{ display: "grid", gap: "10px", paddingLeft: "18px" }}>
        {exams.map((exam) => {
          const examId = exam._id || exam.id;
          return (
            <li key={examId || exam.title}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "10px",
                  flexWrap: "wrap"
                }}
              >
                <div>
                  <strong>{exam.title}</strong> - {exam.durationMinutes} min
                </div>
                {examId ? (
                  <Link to={`/student/exam/${examId}/instructions`}>Start / Instructions</Link>
                ) : (
                  <span>Exam unavailable</span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

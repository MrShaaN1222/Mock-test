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
      {status === "loading" && <LoadingSpinner label="Loading exams..." />}
      {error && <ErrorState message={error} />}
      <ul>
        {exams.map((exam) => (
          <li key={exam._id || exam.id}>
            {exam.title} - {exam.durationMinutes} min
            {" | "}
            <Link to={`/student/exam/${exam._id || exam.id}/instructions`}>Start / Instructions</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

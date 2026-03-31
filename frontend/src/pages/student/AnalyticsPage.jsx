import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { apiClient, withAuth } from "../../api/client";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorState from "../../components/common/ErrorState";

export default function AnalyticsPage() {
  const { accessToken } = useSelector((state) => state.auth);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!accessToken) return;

    async function loadAnalytics() {
      setStatus("loading");
      setError("");
      try {
        const [analyticsRes, historyRes] = await Promise.all([
          apiClient.get("/attempt/analytics", withAuth(accessToken)),
          apiClient.get("/attempt/history?page=1&limit=10", withAuth(accessToken))
        ]);
        setAnalytics(analyticsRes);
        setHistory(historyRes.items || []);
        setStatus("succeeded");
      } catch (err) {
        setError(err.message || "Failed to load analytics");
        setStatus("failed");
      }
    }

    loadAnalytics();
  }, [accessToken]);

  if (status === "loading") return <LoadingSpinner label="Loading analytics..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <section style={{ display: "grid", gap: "12px" }}>
      <h2>Performance Analytics</h2>
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
        <p>Attempts: {analytics?.attemptsCount ?? 0}</p>
        <p>Average Score: {analytics?.averageScore ?? 0}</p>
        <p>Total Time: {analytics?.timeSpentSummary?.totalSeconds ?? 0}s</p>
      </div>

      <div>
        <h3>Correctness Breakdown</h3>
        <p>Correct: {analytics?.correctness?.correct ?? 0}</p>
        <p>Wrong: {analytics?.correctness?.wrong ?? 0}</p>
        <p>Unanswered: {analytics?.correctness?.unanswered ?? 0}</p>
      </div>

      <div>
        <h3>Recent Score Trend</h3>
        <ul>
          {(analytics?.scoreTrend || []).map((item) => (
            <li key={item.id}>
              {item.title}: {item.score}/{item.maxScore}
            </li>
          ))}
          {(!analytics?.scoreTrend || analytics.scoreTrend.length === 0) && <li>No attempts yet.</li>}
        </ul>
      </div>

      <div>
        <h3>Section-wise Stats</h3>
        <ul>
          {(analytics?.sectionWiseStats || []).map((item) => (
            <li key={item.category}>
              {item.category} - C:{item.correct} W:{item.wrong} U:{item.unanswered} Time:{item.timeSpent}s
            </li>
          ))}
          {(!analytics?.sectionWiseStats || analytics.sectionWiseStats.length === 0) && <li>No section data yet.</li>}
        </ul>
      </div>

      <div>
        <h3>Attempt History</h3>
        <ul>
          {history.map((item) => (
            <li key={item.id}>
              {item.title} - {item.score}/{item.maxScore} ({item.status})
            </li>
          ))}
          {history.length === 0 && <li>No history available.</li>}
        </ul>
      </div>
    </section>
  );
}

import { Link } from "react-router-dom";

export default function AdminDashboard() {
  return (
    <section>
      <h2>Admin Dashboard</h2>
      <p>Manage questions, exams, and users from one place.</p>
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "14px" }}>
        <Link to="/admin/questions">Question Manager</Link>
        <Link to="/admin/exams">Exam Manager</Link>
        <Link to="/admin/users">User Manager</Link>
      </div>
    </section>
  );
}

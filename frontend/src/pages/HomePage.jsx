import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <section>
      <h1>SSC CBT Platform</h1>
      <p>Application shell is ready. Register as a student or login to continue.</p>
      <div style={{ display: "flex", gap: "10px" }}>
        <Link to="/register">Student Register</Link>
        <Link to="/login">Login</Link>
      </div>
    </section>
  );
}

import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <section>
      <h1>SSC CBT Platform</h1>
      <p>Application shell is ready. Please login to continue.</p>
      <div style={{ display: "flex", gap: "10px" }}>
        <Link to="/login">Login</Link>
      </div>
    </section>
  );
}

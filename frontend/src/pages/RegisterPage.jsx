import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate } from "react-router-dom";
import ErrorState from "../components/common/ErrorState";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { registerThunk } from "../features/auth/authSlice";

export default function RegisterPage() {
  const dispatch = useDispatch();
  const { accessToken, status, error } = useSelector((state) => state.auth);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (accessToken) {
    return <Navigate to="/student" replace />;
  }

  async function onSubmit(event) {
    event.preventDefault();
    await dispatch(registerThunk({ name, email, password }));
  }

  return (
    <section style={{ maxWidth: "420px" }}>
      <h2>Student Registration</h2>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: "10px" }}>
        <input
          type="text"
          placeholder="Full name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <button type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Creating account..." : "Create Student Account"}
        </button>
      </form>
      <p style={{ marginTop: "10px" }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
      {status === "loading" && <LoadingSpinner label="Registering..." />}
      {error && <ErrorState message={error} />}
    </section>
  );
}

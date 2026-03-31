import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate } from "react-router-dom";
import ErrorState from "../components/common/ErrorState";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { loginThunk } from "../features/auth/authSlice";

export default function LoginPage() {
  const dispatch = useDispatch();
  const { accessToken, user, status, error } = useSelector((state) => state.auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (accessToken) {
    return <Navigate to={user?.role === "admin" ? "/admin" : "/student"} replace />;
  }

  async function onSubmit(event) {
    event.preventDefault();
    await dispatch(loginThunk({ email, password }));
  }

  return (
    <section style={{ maxWidth: "420px" }}>
      <h2>Login</h2>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: "10px" }}>
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
          {status === "loading" ? "Signing in..." : "Sign In"}
        </button>
      </form>
      <p style={{ marginTop: "10px" }}>
        New student? <Link to="/register">Create account</Link>
      </p>
      {status === "loading" && <LoadingSpinner label="Authenticating..." />}
      {error && <ErrorState message={error} />}
    </section>
  );
}

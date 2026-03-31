import { Link, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../features/auth/authSlice";

export default function DashboardLayout() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  return (
    <div style={{ minHeight: "100vh", fontFamily: "Arial, sans-serif", backgroundColor: "#f8fafc" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "14px 20px",
          borderBottom: "1px solid #e2e8f0",
          backgroundColor: "#ffffff"
        }}
      >
        <div>
          <strong>SSC CBT</strong>
          <span style={{ marginLeft: "10px", color: "#64748b" }}>
            {user?.name} ({user?.role})
          </span>
        </div>
        <nav style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {user?.role === "admin" ? <Link to="/admin">Admin</Link> : <Link to="/student">Student</Link>}
          <button type="button" onClick={() => dispatch(logout())}>
            Logout
          </button>
        </nav>
      </header>
      <main style={{ maxWidth: "980px", margin: "0 auto", padding: "20px" }}>
        <Outlet />
      </main>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { apiClient, withAuth } from "../../api/client";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorState from "../../components/common/ErrorState";
import StatusToast from "../../components/common/StatusToast";

export default function UserManager() {
  const { accessToken, user: currentUser } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ role: "", isBlocked: "" });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [editingId, setEditingId] = useState("");
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("student");

  useEffect(() => {
    if (!accessToken) return;
    fetchUsers();
  }, [accessToken]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  async function fetchUsers() {
    setStatus("loading");
    setError("");
    try {
      const params = new URLSearchParams();
      if (filters.role) params.set("role", filters.role);
      if (filters.isBlocked !== "") params.set("isBlocked", filters.isBlocked);
      const query = params.toString() ? `?${params.toString()}` : "";
      const data = await apiClient.get(`/users${query}`, withAuth(accessToken));
      setUsers(data || []);
      setStatus("succeeded");
    } catch (err) {
      setError(err.message || "Failed to load users");
      setStatus("failed");
    }
  }

  function startEdit(targetUser) {
    setEditingId(targetUser._id);
    setEditName(targetUser.name || "");
    setEditRole(targetUser.role || "student");
  }

  function cancelEdit() {
    setEditingId("");
    setEditName("");
    setEditRole("student");
  }

  async function handleUpdate(userId) {
    if (!editName.trim()) {
      setToast({ type: "error", message: "Name is required" });
      return;
    }
    try {
      const updated = await apiClient.patch(
        `/users/${userId}`,
        { name: editName.trim(), role: editRole },
        withAuth(accessToken)
      );
      setUsers((prev) => prev.map((item) => (item._id === userId ? updated : item)));
      cancelEdit();
      setToast({ type: "success", message: "User updated successfully" });
    } catch (err) {
      setToast({ type: "error", message: err.message || "Failed to update user" });
    }
  }

  async function toggleBlock(targetUser) {
    if (targetUser._id === currentUser?._id) {
      setToast({ type: "error", message: "You cannot block your own account" });
      return;
    }
    const endpoint = targetUser.isBlocked ? `/users/${targetUser._id}/unblock` : `/users/${targetUser._id}/block`;
    try {
      const response = await apiClient.patch(endpoint, {}, withAuth(accessToken));
      const updatedUser = response.user || targetUser;
      setUsers((prev) => prev.map((item) => (item._id === targetUser._id ? updatedUser : item)));
      setToast({
        type: "success",
        message: targetUser.isBlocked ? "User unblocked successfully" : "User blocked successfully"
      });
    } catch (err) {
      setToast({ type: "error", message: err.message || "Status update failed" });
    }
  }

  return (
    <section>
      <h2>User Manager</h2>

      <div style={{ display: "flex", gap: "8px", margin: "14px 0" }}>
        <select value={filters.role} onChange={(event) => setFilters((prev) => ({ ...prev, role: event.target.value }))}>
          <option value="">All roles</option>
          <option value="student">Student</option>
          <option value="admin">Admin</option>
        </select>
        <select
          value={filters.isBlocked}
          onChange={(event) => setFilters((prev) => ({ ...prev, isBlocked: event.target.value }))}
        >
          <option value="">All status</option>
          <option value="true">Blocked</option>
          <option value="false">Active</option>
        </select>
        <button type="button" onClick={fetchUsers}>
          Apply filters
        </button>
      </div>

      {status === "loading" && <LoadingSpinner label="Loading users..." />}
      {error && <ErrorState message={error} />}

      <div style={{ overflowX: "auto" }}>
        <table width="100%" cellPadding="8" style={{ borderCollapse: "collapse", backgroundColor: "#fff" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #e2e8f0", textAlign: "left" }}>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((item) => {
              const isEditing = editingId === item._id;
              return (
                <tr key={item._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td>
                    {isEditing ? (
                      <input value={editName} onChange={(event) => setEditName(event.target.value)} />
                    ) : (
                      item.name
                    )}
                  </td>
                  <td>{item.email}</td>
                  <td>
                    {isEditing ? (
                      <select value={editRole} onChange={(event) => setEditRole(event.target.value)}>
                        <option value="student">Student</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      item.role
                    )}
                  </td>
                  <td>{item.isBlocked ? "Blocked" : "Active"}</td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    {isEditing ? (
                      <>
                        <button type="button" onClick={() => handleUpdate(item._id)}>
                          Save
                        </button>{" "}
                        <button type="button" onClick={cancelEdit}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button type="button" onClick={() => startEdit(item)}>
                          Edit
                        </button>{" "}
                        <button type="button" onClick={() => toggleBlock(item)}>
                          {item.isBlocked ? "Unblock" : "Block"}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
            {users.length === 0 && (
              <tr>
                <td colSpan="5" style={{ color: "#64748b" }}>
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <StatusToast toast={toast} onClose={() => setToast(null)} />
    </section>
  );
}

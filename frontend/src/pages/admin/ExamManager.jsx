import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { apiClient, withAuth } from "../../api/client";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorState from "../../components/common/ErrorState";
import StatusToast from "../../components/common/StatusToast";

const initialForm = {
  title: "",
  description: "",
  categories: "",
  totalQuestions: 25,
  durationMinutes: 60,
  marksPerQuestion: 2,
  negativeMarks: 0.5,
  isPublished: false
};

export default function ExamManager() {
  const { accessToken } = useSelector((state) => state.auth);
  const [exams, setExams] = useState([]);
  const [filters, setFilters] = useState({ isPublished: "" });
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [importReplace, setImportReplace] = useState(false);
  const examImportInputRef = useRef(null);

  useEffect(() => {
    if (!accessToken) return;
    fetchExams();
  }, [accessToken]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  async function fetchExams() {
    setStatus("loading");
    setError("");
    try {
      const params = new URLSearchParams();
      if (filters.isPublished !== "") params.set("isPublished", filters.isPublished);
      const query = params.toString() ? `?${params.toString()}` : "";
      const data = await apiClient.get(`/admin/exams${query}`, withAuth(accessToken));
      setExams(data.items || data || []);
      setStatus("succeeded");
    } catch (err) {
      setError(err.message || "Failed to load exams");
      setStatus("failed");
    }
  }

  function resetForm() {
    setForm(initialForm);
    setEditingId("");
  }

  function validateExam() {
    if (!form.title.trim()) return "Title is required";
    const categories = form.categories
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    if (!categories.length) return "At least one category is required";
    if (Number(form.totalQuestions) < 1) return "Total questions must be at least 1";
    if (Number(form.durationMinutes) < 1) return "Duration must be at least 1 minute";
    if (Number(form.marksPerQuestion) < 0) return "Marks per question cannot be negative";
    if (Number(form.negativeMarks) < 0) return "Negative marks cannot be negative";
    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationError = validateExam();
    if (validationError) {
      setToast({ type: "error", message: validationError });
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      categories: form.categories
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      totalQuestions: Number(form.totalQuestions),
      durationMinutes: Number(form.durationMinutes),
      marksPerQuestion: Number(form.marksPerQuestion),
      negativeMarks: Number(form.negativeMarks),
      isPublished: form.isPublished
    };

    try {
      if (editingId) {
        await apiClient.put(`/admin/exams/${editingId}`, payload, withAuth(accessToken));
        setToast({ type: "success", message: "Exam updated successfully" });
      } else {
        await apiClient.post("/admin/exams", payload, withAuth(accessToken));
        setToast({ type: "success", message: "Exam created successfully" });
      }
      resetForm();
      fetchExams();
    } catch (err) {
      setToast({ type: "error", message: err.message || "Failed to save exam" });
    }
  }

  function startEdit(exam) {
    setEditingId(exam._id);
    setForm({
      title: exam.title || "",
      description: exam.description || "",
      categories: (exam.categories || []).join(", "),
      totalQuestions: exam.totalQuestions || 1,
      durationMinutes: exam.durationMinutes || 1,
      marksPerQuestion: typeof exam.marksPerQuestion === "number" ? exam.marksPerQuestion : 2,
      negativeMarks: typeof exam.negativeMarks === "number" ? exam.negativeMarks : 0.5,
      isPublished: !!exam.isPublished
    });
  }

  async function handleExamImportFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !accessToken) return;

    let parsed;
    try {
      parsed = JSON.parse(await file.text());
    } catch {
      setToast({ type: "error", message: "Invalid JSON file" });
      return;
    }

    let items;
    let fromFileReplace = false;
    if (Array.isArray(parsed)) {
      items = parsed;
    } else if (parsed && Array.isArray(parsed.items)) {
      items = parsed.items;
      fromFileReplace = Boolean(parsed.replace);
    } else {
      setToast({ type: "error", message: "JSON must be an array or { items: [...] }" });
      return;
    }

    const replace = importReplace || fromFileReplace;
    if (replace) {
      const ok = window.confirm("Replace ALL existing exams before import? This cannot be undone.");
      if (!ok) return;
    }

    try {
      const result = await apiClient.post(
        "/admin/exams/import",
        { replace, items },
        withAuth(accessToken)
      );
      setToast({
        type: "success",
        message: `Imported ${result.insertedCount} exam(s)${replace ? " (replaced all first)" : ""}`
      });
      fetchExams();
    } catch (err) {
      setToast({ type: "error", message: err.message || "Import failed" });
    }
  }

  async function handleDelete(examId) {
    const confirmed = window.confirm("Delete this exam?");
    if (!confirmed) return;
    try {
      await apiClient.delete(`/admin/exams/${examId}`, withAuth(accessToken));
      setExams((prev) => prev.filter((item) => item._id !== examId));
      setToast({ type: "success", message: "Exam deleted successfully" });
      if (editingId === examId) {
        resetForm();
      }
    } catch (err) {
      setToast({ type: "error", message: err.message || "Delete failed" });
    }
  }

  return (
    <section>
      <h2>Exam Manager</h2>

      <div style={{ display: "flex", gap: "8px", margin: "14px 0" }}>
        <select
          value={filters.isPublished}
          onChange={(event) => setFilters({ isPublished: event.target.value })}
        >
          <option value="">All exams</option>
          <option value="true">Published</option>
          <option value="false">Draft</option>
        </select>
        <button type="button" onClick={fetchExams}>
          Apply filters
        </button>
        <input
          ref={examImportInputRef}
          type="file"
          accept="application/json,.json"
          style={{ display: "none" }}
          onChange={handleExamImportFile}
        />
        <label style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <input
            type="checkbox"
            checked={importReplace}
            onChange={(event) => setImportReplace(event.target.checked)}
          />
          Replace all on import
        </label>
        <button type="button" onClick={() => examImportInputRef.current?.click()}>
          Import exams (JSON)
        </button>
      </div>

      {status === "loading" && <LoadingSpinner label="Loading exams..." />}
      {error && <ErrorState message={error} />}

      <form onSubmit={handleSubmit} style={{ border: "1px solid #e2e8f0", padding: "12px", borderRadius: "8px" }}>
        <h3 style={{ marginTop: 0 }}>{editingId ? "Edit exam" : "Create exam"}</h3>
        <div style={{ display: "grid", gap: "8px" }}>
          <input
            type="text"
            placeholder="Exam title"
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
          />
          <textarea
            rows={2}
            placeholder="Description"
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          />
          <input
            type="text"
            placeholder="Categories (comma separated)"
            value={form.categories}
            onChange={(event) => setForm((prev) => ({ ...prev, categories: event.target.value }))}
          />
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <input
              type="number"
              min="1"
              placeholder="Total questions"
              value={form.totalQuestions}
              onChange={(event) => setForm((prev) => ({ ...prev, totalQuestions: event.target.value }))}
            />
            <input
              type="number"
              min="1"
              placeholder="Duration (minutes)"
              value={form.durationMinutes}
              onChange={(event) => setForm((prev) => ({ ...prev, durationMinutes: event.target.value }))}
            />
            <input
              type="number"
              min="0"
              step="0.1"
              placeholder="Marks per question"
              value={form.marksPerQuestion}
              onChange={(event) => setForm((prev) => ({ ...prev, marksPerQuestion: event.target.value }))}
            />
            <input
              type="number"
              min="0"
              step="0.1"
              placeholder="Negative marks"
              value={form.negativeMarks}
              onChange={(event) => setForm((prev) => ({ ...prev, negativeMarks: event.target.value }))}
            />
            <label>
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(event) => setForm((prev) => ({ ...prev, isPublished: event.target.checked }))}
              />{" "}
              Published
            </label>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button type="submit">{editingId ? "Update exam" : "Create exam"}</button>
            {editingId && (
              <button type="button" onClick={resetForm}>
                Cancel edit
              </button>
            )}
          </div>
        </div>
      </form>

      <div style={{ marginTop: "16px", overflowX: "auto" }}>
        <table width="100%" cellPadding="8" style={{ borderCollapse: "collapse", backgroundColor: "#fff" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #e2e8f0", textAlign: "left" }}>
              <th>Title</th>
              <th>Categories</th>
              <th>Questions</th>
              <th>Duration</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {exams.map((exam) => (
              <tr key={exam._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td>{exam.title}</td>
                <td>{(exam.categories || []).join(", ")}</td>
                <td>{exam.totalQuestions}</td>
                <td>{exam.durationMinutes} min</td>
                <td>{exam.isPublished ? "Published" : "Draft"}</td>
                <td style={{ whiteSpace: "nowrap" }}>
                  <button type="button" onClick={() => startEdit(exam)}>
                    Edit
                  </button>{" "}
                  <button type="button" onClick={() => handleDelete(exam._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {exams.length === 0 && (
              <tr>
                <td colSpan="6" style={{ color: "#64748b" }}>
                  No exams found.
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

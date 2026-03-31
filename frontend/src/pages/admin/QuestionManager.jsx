import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { apiClient, withAuth } from "../../api/client";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorState from "../../components/common/ErrorState";
import StatusToast from "../../components/common/StatusToast";

const initialForm = {
  questionText: "",
  category: "",
  difficulty: "medium",
  explanation: "",
  isActive: true,
  options: [
    { text: "", isCorrect: true },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false }
  ]
};

export default function QuestionManager() {
  const { accessToken } = useSelector((state) => state.auth);
  const [questions, setQuestions] = useState([]);
  const [filters, setFilters] = useState({ category: "", difficulty: "", isActive: "" });
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!accessToken) return;
    fetchQuestions();
  }, [accessToken]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  async function fetchQuestions() {
    setStatus("loading");
    setError("");
    try {
      const params = new URLSearchParams();
      if (filters.category) params.set("category", filters.category);
      if (filters.difficulty) params.set("difficulty", filters.difficulty);
      if (filters.isActive !== "") params.set("isActive", filters.isActive);
      const query = params.toString() ? `?${params.toString()}` : "";
      const data = await apiClient.get(`/questions${query}`, withAuth(accessToken));
      setQuestions(data || []);
      setStatus("succeeded");
    } catch (err) {
      setError(err.message || "Failed to load questions");
      setStatus("failed");
    }
  }

  const categories = useMemo(() => {
    return [...new Set(questions.map((item) => item.category).filter(Boolean))];
  }, [questions]);

  function setCorrectOption(index) {
    setForm((prev) => ({
      ...prev,
      options: prev.options.map((option, i) => ({ ...option, isCorrect: i === index }))
    }));
  }

  function validateQuestion() {
    if (!form.questionText.trim()) return "Question text is required";
    if (!form.category.trim()) return "Category is required";
    const optionTexts = form.options.map((option) => option.text.trim()).filter(Boolean);
    if (optionTexts.length < 2) return "At least two options are required";
    const correctCount = form.options.filter((option) => option.isCorrect && option.text.trim()).length;
    if (correctCount !== 1) return "Exactly one correct option is required";
    return "";
  }

  function resetForm() {
    setForm(initialForm);
    setEditingId("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationError = validateQuestion();
    if (validationError) {
      setToast({ type: "error", message: validationError });
      return;
    }

    const payload = {
      ...form,
      questionText: form.questionText.trim(),
      category: form.category.trim(),
      explanation: form.explanation.trim(),
      options: form.options
        .map((option) => ({ text: option.text.trim(), isCorrect: option.isCorrect }))
        .filter((option) => option.text)
    };

    try {
      if (editingId) {
        await apiClient.put(`/questions/${editingId}`, payload, withAuth(accessToken));
        setToast({ type: "success", message: "Question updated successfully" });
      } else {
        await apiClient.post("/questions", payload, withAuth(accessToken));
        setToast({ type: "success", message: "Question created successfully" });
      }
      resetForm();
      fetchQuestions();
    } catch (err) {
      setToast({ type: "error", message: err.message || "Failed to save question" });
    }
  }

  function startEdit(question) {
    const existingOptions = question.options || [];
    const normalizedOptions = Array.from({ length: 4 }, (_, index) => {
      const option = existingOptions[index];
      return option ? { text: option.text || "", isCorrect: !!option.isCorrect } : { text: "", isCorrect: false };
    });
    if (!normalizedOptions.some((option) => option.isCorrect)) {
      normalizedOptions[0].isCorrect = true;
    }
    setEditingId(question._id);
    setForm({
      questionText: question.questionText || "",
      category: question.category || "",
      difficulty: question.difficulty || "medium",
      explanation: question.explanation || "",
      isActive: typeof question.isActive === "boolean" ? question.isActive : true,
      options: normalizedOptions
    });
  }

  async function handleDelete(questionId) {
    const confirmed = window.confirm("Delete this question?");
    if (!confirmed) return;
    try {
      await apiClient.delete(`/questions/${questionId}`, withAuth(accessToken));
      setQuestions((prev) => prev.filter((item) => item._id !== questionId));
      setToast({ type: "success", message: "Question deleted successfully" });
      if (editingId === questionId) {
        resetForm();
      }
    } catch (err) {
      setToast({ type: "error", message: err.message || "Delete failed" });
    }
  }

  return (
    <section>
      <h2>Question Manager</h2>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", margin: "14px 0" }}>
        <input
          type="text"
          placeholder="Filter by category"
          value={filters.category}
          onChange={(event) => setFilters((prev) => ({ ...prev, category: event.target.value }))}
        />
        <select
          value={filters.difficulty}
          onChange={(event) => setFilters((prev) => ({ ...prev, difficulty: event.target.value }))}
        >
          <option value="">All difficulty</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <select
          value={filters.isActive}
          onChange={(event) => setFilters((prev) => ({ ...prev, isActive: event.target.value }))}
        >
          <option value="">All status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <button type="button" onClick={fetchQuestions}>
          Apply filters
        </button>
      </div>

      {status === "loading" && <LoadingSpinner label="Loading questions..." />}
      {error && <ErrorState message={error} />}

      <form onSubmit={handleSubmit} style={{ border: "1px solid #e2e8f0", padding: "12px", borderRadius: "8px" }}>
        <h3 style={{ marginTop: 0 }}>{editingId ? "Edit question" : "Create question"}</h3>
        <div style={{ display: "grid", gap: "8px" }}>
          <textarea
            rows={3}
            placeholder="Question text"
            value={form.questionText}
            onChange={(event) => setForm((prev) => ({ ...prev, questionText: event.target.value }))}
          />
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <input
              type="text"
              list="question-categories"
              placeholder="Category"
              value={form.category}
              onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
            />
            <datalist id="question-categories">
              {categories.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
            <select
              value={form.difficulty}
              onChange={(event) => setForm((prev) => ({ ...prev, difficulty: event.target.value }))}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <label>
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))}
              />{" "}
              Active
            </label>
          </div>
          {form.options.map((option, index) => (
            <div key={`option-${index}`} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <input
                type="radio"
                checked={option.isCorrect}
                onChange={() => setCorrectOption(index)}
                name="correctOption"
              />
              <input
                type="text"
                placeholder={`Option ${index + 1}`}
                value={option.text}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    options: prev.options.map((item, i) =>
                      i === index ? { ...item, text: event.target.value } : item
                    )
                  }))
                }
                style={{ flex: 1 }}
              />
            </div>
          ))}
          <textarea
            rows={2}
            placeholder="Explanation (optional)"
            value={form.explanation}
            onChange={(event) => setForm((prev) => ({ ...prev, explanation: event.target.value }))}
          />
          <div style={{ display: "flex", gap: "8px" }}>
            <button type="submit">{editingId ? "Update question" : "Create question"}</button>
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
              <th>Question</th>
              <th>Category</th>
              <th>Difficulty</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((question) => (
              <tr key={question._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td>{question.questionText}</td>
                <td>{question.category}</td>
                <td>{question.difficulty}</td>
                <td>{question.isActive ? "Active" : "Inactive"}</td>
                <td style={{ whiteSpace: "nowrap" }}>
                  <button type="button" onClick={() => startEdit(question)}>
                    Edit
                  </button>{" "}
                  <button type="button" onClick={() => handleDelete(question._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {questions.length === 0 && (
              <tr>
                <td colSpan="5" style={{ color: "#64748b" }}>
                  No questions found.
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

export default function StatusToast({ toast, onClose }) {
  if (!toast) {
    return null;
  }

  const isError = toast.type === "error";

  return (
    <div
      style={{
        position: "fixed",
        right: "20px",
        bottom: "20px",
        backgroundColor: isError ? "#fee2e2" : "#dcfce7",
        color: isError ? "#991b1b" : "#166534",
        border: `1px solid ${isError ? "#fecaca" : "#bbf7d0"}`,
        borderRadius: "8px",
        padding: "10px 12px",
        minWidth: "260px",
        zIndex: 40,
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)"
      }}
      role="status"
      aria-live="polite"
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center" }}>
        <span>{toast.message}</span>
        <button
          type="button"
          onClick={onClose}
          style={{ border: "none", background: "transparent", color: "inherit", cursor: "pointer" }}
        >
          x
        </button>
      </div>
    </div>
  );
}

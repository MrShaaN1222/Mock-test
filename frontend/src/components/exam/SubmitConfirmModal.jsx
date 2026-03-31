export default function SubmitConfirmModal({ open, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.4)",
        display: "grid",
        placeItems: "center",
        zIndex: 1000
      }}
    >
      <div style={{ backgroundColor: "#fff", padding: "18px", borderRadius: "10px", width: "350px" }}>
        <h3>Submit Exam?</h3>
        <p>Are you sure you want to submit your attempt?</p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" onClick={onConfirm} style={{ backgroundColor: "#1d4ed8", color: "#fff" }}>
            Confirm Submit
          </button>
        </div>
      </div>
    </div>
  );
}

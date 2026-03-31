export default function ExamActions({
  onPrev,
  onNext,
  onSaveAndNext,
  onMarkForReview,
  onClearResponse,
  onSubmit
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
      <button type="button" onClick={onPrev}>
        Prev
      </button>
      <button type="button" onClick={onNext}>
        Next
      </button>
      <button type="button" onClick={onSaveAndNext}>
        Save & Next
      </button>
      <button type="button" onClick={onMarkForReview}>
        Mark for Review
      </button>
      <button type="button" onClick={onClearResponse}>
        Clear Response
      </button>
      <button type="button" onClick={onSubmit} style={{ backgroundColor: "#1d4ed8", color: "#fff" }}>
        Submit
      </button>
    </div>
  );
}

function getQuestionColor(question) {
  if (question.markedForReview) return "#f59e0b";
  if (question.selectedOptionId) return "#16a34a";
  return "#dc2626";
}

export default function QuestionNavigator({ questions, activeIndex, onJump }) {
  return (
    <aside>
      <h4>Question Navigator</h4>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {questions.map((question, index) => (
          <button
            key={question.questionId}
            type="button"
            onClick={() => onJump(index)}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "999px",
              border: index === activeIndex ? "2px solid #1d4ed8" : "1px solid #94a3b8",
              backgroundColor: getQuestionColor(question),
              color: "#fff"
            }}
            title={`Question ${index + 1}`}
          >
            {index + 1}
          </button>
        ))}
      </div>
      <div style={{ marginTop: "12px", fontSize: "12px", color: "#475569" }}>
        <div>Green: Answered</div>
        <div>Red: Not Answered</div>
        <div>Orange: Marked for Review</div>
      </div>
    </aside>
  );
}

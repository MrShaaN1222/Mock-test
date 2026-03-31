export default function OptionList({ question, onSelectOption }) {
  return (
    <div style={{ display: "grid", gap: "8px" }}>
      {question.options.map((option) => {
        const checked = question.selectedOptionId === option.optionId;
        return (
          <label
            key={option.optionId}
            style={{
              display: "flex",
              gap: "8px",
              alignItems: "center",
              padding: "10px",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              backgroundColor: checked ? "#eff6ff" : "#fff"
            }}
          >
            <input
              type="radio"
              name={`question-${question.questionId}`}
              checked={checked}
              onChange={() => onSelectOption(option.optionId)}
            />
            <span>{option.text}</span>
          </label>
        );
      })}
    </div>
  );
}

import OptionList from "./OptionList";

export default function QuestionPanel({ question, questionNumber, onSelectOption }) {
  if (!question) return null;

  return (
    <section style={{ display: "grid", gap: "12px" }}>
      <h3>
        Question {questionNumber}: {question.questionText}
      </h3>
      <OptionList question={question} onSelectOption={onSelectOption} />
    </section>
  );
}

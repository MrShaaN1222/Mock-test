export default function ErrorState({ message = "Something went wrong." }) {
  return (
    <div
      style={{
        backgroundColor: "#fee2e2",
        color: "#991b1b",
        border: "1px solid #fecaca",
        borderRadius: "8px",
        padding: "12px 14px"
      }}
    >
      {message}
    </div>
  );
}

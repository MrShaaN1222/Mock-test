export default function LoadingSpinner({ label = "Loading..." }) {
  return (
    <div style={{ padding: "16px", color: "#4b5563" }}>
      <span>{label}</span>
    </div>
  );
}

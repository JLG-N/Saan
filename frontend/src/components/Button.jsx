export function Button({ children, onClick, variant = "primary", block, disabled }) {
  return (
    <button
      className={`sn-btn ${variant === "secondary" ? "outline" : ""}`}
      style={block ? { display: "block", width: "100%" } : undefined}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

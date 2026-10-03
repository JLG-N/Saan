export function Button({ children, onClick, variant = "primary", block, disabled, type = "button", danger = false }) {
  return (
    <button
      type={type}
      className={`sn-btn ${variant === "secondary" ? "outline" : ""} ${danger ? "danger" : ""}`.trim()}
      style={block ? { display: "block", width: "100%" } : undefined}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

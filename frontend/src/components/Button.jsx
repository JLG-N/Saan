export function Button({ children, onClick, variant = "primary", block, disabled, type = "button" }) {
  return (
    <button
      type={type}
      className={`sn-btn ${variant === "secondary" ? "outline" : ""}`}
      style={block ? { display: "block", width: "100%" } : undefined}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

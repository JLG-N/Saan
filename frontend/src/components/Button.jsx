export function Button({ children, onClick, variant = "primary", block, disabled, type = "button", danger = false, style }) {
  return (
    <button
      type={type}
      className={`sn-btn ${variant === "secondary" ? "outline" : ""} ${danger ? "danger" : ""}`.trim()}
      style={block ? { display: "block", width: "100%", ...style } : style}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export function StatusBadge({ status }) {
  return <span className={`sn-tag ${status === "ready" ? "" : "draft"}`}>{status === "ready" ? "Ready" : "Draft"}</span>;
}

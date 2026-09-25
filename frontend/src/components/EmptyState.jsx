import { Button } from "./Button";

export function EmptyState({ message, actionLabel, onAction }) {
  return (
    <div className="sn-empty">
      <div className="sn-h1">Nothing here yet</div>
      <div className="sn-dim" style={{ margin: "var(--space-2) 0 var(--space-4)" }}>{message}</div>
      {actionLabel && <Button onClick={onAction}>{actionLabel}</Button>}
    </div>
  );
}

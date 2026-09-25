import { useState, useEffect } from "react";
import { api } from "../api/api";
import { NavBar, Button, ErrorBanner, EmptyState, StatusBadge } from "../components";

export function MyPlansScreen({ token, user, goTo, viewPlan, startNewPlan }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    api
      .plans(token)
      .then((data) => { if (!cancelled) setPlans(data.plans); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [token]);

  return (
    <div>
      <NavBar view="myPlans" goTo={goTo} user={user} />
      <div className="sn-row sn-row-tight" style={{ alignItems: "center", marginBottom: "var(--space-4)" }}>
        <div className="sn-h1" style={{ flex: 3 }}>My Plans</div>
        <div style={{ flex: "none" }}><Button onClick={startNewPlan}>+ New plan</Button></div>
      </div>
      <ErrorBanner message={error} />
      {loading ? (
        <div className="sn-loading">Loading plans…</div>
      ) : plans.length === 0 ? (
        <EmptyState message="No plans yet — build your first one." actionLabel="+ New plan" onAction={startNewPlan} />
      ) : (
        <div className="sn-stack">
          {plans.map((p) => (
            <div key={p.id} className="sn-list-row sn-clickable" onClick={() => viewPlan(p.id)}>
              <span>{p.title} — {p.spots.length} spot{p.spots.length !== 1 ? "s" : ""}</span>
              <StatusBadge status={p.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

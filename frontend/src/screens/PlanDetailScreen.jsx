import { useState, useEffect } from "react";
import { api } from "../api/api";
import { ErrorBanner, StatusBadge, Button } from "../components";

export function PlanDetailScreen({ planId, token, goTo }) {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [shared, setShared] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .plan(planId, token)
      .then((data) => { if (!cancelled) setPlan(data.plan); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [planId, token]);

  if (loading) return <div className="sn-loading">Loading plan…</div>;
  if (!plan) return <ErrorBanner message={error || "Plan not found."} />;

  const handleShare = () => {
    setShared(true);
    setTimeout(() => setShared(false), 1800);
  };

  return (
    <div>
      <span className="sn-breadcrumb" onClick={() => goTo("myPlans")}>← My Plans</span>
      {shared && <div className="sn-box filled" style={{ display: "inline-block", marginBottom: "var(--space-3)", fontWeight: "bold" }}>Link copied!</div>}
      <div className="sn-row sn-row-tight" style={{ alignItems: "center", marginBottom: "var(--space-4)" }}>
        <div style={{ flex: 3 }}>
          <span className="sn-h1" style={{ display: "inline" }}>{plan.title}</span>{" "}
          <StatusBadge status={plan.status} />
        </div>
        <div style={{ flex: "none" }}><Button onClick={handleShare}>Share</Button></div>
        <div style={{ flex: "none" }}><Button variant="secondary" onClick={() => goTo("planBuilder", plan.id)}>Edit</Button></div>
      </div>

      <div className="sn-layout-2col-rev">
        <div className="sn-placeholder-img" style={{ height: 260 }}>map placeholder</div>
        <div className="sn-stack">
          {plan.spots.length === 0 ? (
            <div className="sn-dim">No spots in this plan yet.</div>
          ) : (
            plan.spots.map((s, i) => (
              <div key={s.id} className="sn-list-row">
                <span>{i + 1} · {s.name}</span>
                <span className="sn-dim">{s.price_range}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

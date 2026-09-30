import { useState, useEffect } from "react";
import { api } from "../api/api";
import { ErrorBanner, RatingStars } from "../components";

// Public, read-only view of a plan someone shared. No login, no token, no edit controls.
export function SharedPlanScreen({ shareToken }) {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    api
      .sharedPlan(shareToken)
      .then((data) => { if (!cancelled) setPlan(data.plan); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [shareToken]);

  const goHome = () => { window.location.href = "/"; };

  if (loading) return <div className="sn-loading">Loading plan…</div>;

  if (!plan) {
    return (
      <div>
        <ErrorBanner message={error || "This plan link isn't valid or is no longer shared."} />
        <span className="sn-link" onClick={goHome}>Go to Saan</span>
      </div>
    );
  }

  return (
    <div>
      <div className="sn-dim" style={{ marginBottom: "var(--space-2)" }}>
        {plan.ownerFirstName ? `${plan.ownerFirstName} shared a plan with you` : "A plan shared with you"}
      </div>
      <div className="sn-h1" style={{ marginBottom: "var(--space-4)" }}>{plan.title}</div>

      <div className="sn-layout-2col-rev">
        <div className="sn-placeholder-img" style={{ height: 260 }}>map placeholder</div>
        <div className="sn-stack">
          {plan.spots.map((s, i) => (
            <div key={s.id} className="sn-list-row" style={{ alignItems: "flex-start" }}>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>{i + 1} · {s.name}</div>
                <div className="sn-dim">{s.category} · {s.address}</div>
                <RatingStars rating={s.avg_rating} />
              </div>
              <span className="sn-dim">{s.price_range}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="sn-footer-bar">
        <span>Made with Saan — </span>
        <span className="sn-link" onClick={goHome}>plan your own outing</span>
      </div>
    </div>
  );
}

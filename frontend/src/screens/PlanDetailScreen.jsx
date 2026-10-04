import { useState, useEffect } from "react";
import { api } from "../api/api";
import { ErrorBanner, StatusBadge, Button } from "../components";
import { PlanMap } from "../components/PlanMap";

function buildShareUrl(shareToken) {
  return `${window.location.origin}/p/${shareToken}`;
}

export function PlanDetailScreen({ planId, token, goTo }) {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [shareUrl, setShareUrl] = useState("");   
  const [shareBusy, setShareBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedSpotId, setSelectedSpotId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    setPlan(null);
    setShareUrl("");
    api
      .plan(planId, token)
      .then((data) => {
        if (cancelled) return;
        setPlan(data.plan);
        setSelectedSpotId(null);
        if (data.plan.share_token) setShareUrl(buildShareUrl(data.plan.share_token));
      })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [planId, token]);

  if (loading) return <div className="sn-loading">Loading plan…</div>;
  if (!plan) return <ErrorBanner message={error || "Plan not found."} />;

  const copyLink = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      if (!ok) throw new Error("copy failed");
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleShare = async () => {
    setError("");
    setShareBusy(true);
    try {
      const { shareToken } = await api.sharePlan(plan.id, token);
      const url = buildShareUrl(shareToken);
      setShareUrl(url);
      try {
        await copyLink(url);
      } catch {
        
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setShareBusy(false);
    }
  };

  const handleStopSharing = async () => {
    setError("");
    setShareBusy(true);
    try {
      await api.unsharePlan(plan.id, token);
      setShareUrl("");
    } catch (err) {
      setError(err.message);
    } finally {
      setShareBusy(false);
    }
  };

  return (
    <div>
      <span className="sn-breadcrumb" onClick={() => goTo("myPlans")}>My Plans</span>
      <ErrorBanner message={error} />
      <div className="sn-row sn-row-tight" style={{ alignItems: "center", marginBottom: "var(--space-4)" }}>
        <div style={{ flex: 3 }}>
          <span className="sn-h1" style={{ display: "inline" }}>{plan.title}</span>{" "}
          <StatusBadge status={plan.status} />
        </div>
        <div style={{ flex: "none" }}><Button onClick={handleShare} disabled={shareBusy}>{shareUrl ? "Copy link" : "Share"}</Button></div>
        <div style={{ flex: "none" }}><Button variant="secondary" onClick={() => goTo("planBuilder", plan.id)}>Edit</Button></div>
      </div>

      {shareUrl && (
        <div className="sn-box filled" style={{ marginBottom: "var(--space-4)" }}>
          <span className="sn-label">Anyone with this link can view this plan (read-only)</span>
          <div className="sn-row sn-row-tight" style={{ alignItems: "center" }}>
            <input className="sn-input" readOnly value={shareUrl} onFocus={(e) => e.target.select()} />
            <div style={{ flex: "none" }}><Button variant="secondary" onClick={() => copyLink(shareUrl).catch(() => {})}>{copied ? "Copied!" : "Copy"}</Button></div>
            <div style={{ flex: "none" }}><Button variant="secondary" onClick={handleStopSharing} disabled={shareBusy}>Stop sharing</Button></div>
          </div>
        </div>
      )}

      <div className="sn-layout-2col-rev">
        <PlanMap spots={plan.spots} selectedSpotId={selectedSpotId} onClearSelection={() => setSelectedSpotId(null)} />
        <div className="sn-stack">
          {plan.spots.length === 0 ? (
            <div className="sn-dim">No spots in this plan yet.</div>
          ) : (
            plan.spots.map((s, i) => (
              <button
                key={s.id}
                type="button"
                className={`sn-list-row sn-map-stop${selectedSpotId === s.id ? " selected" : ""}`}
                aria-pressed={selectedSpotId === s.id}
                onClick={() => setSelectedSpotId((currentId) => currentId === s.id ? null : s.id)}
              >
                <span>{i + 1} · {s.name}</span>
                <span className="sn-dim">{s.price_range}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

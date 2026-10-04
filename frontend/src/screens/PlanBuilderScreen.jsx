import { useState, useEffect, useCallback } from "react";
import { api } from "../api/api";
import { ErrorBanner, Button } from "../components";

export function PlanBuilderScreen({ planId, token, goTo }) {
  const [plan, setPlan] = useState(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [deletingPlan, setDeletingPlan] = useState(false);

  const [availableSpots, setAvailableSpots] = useState([]);
  const [search, setSearch] = useState("");

  const loadPlan = useCallback(() => {
    setLoading(true);
    return api
      .plan(planId, token)
      .then((data) => { setPlan(data.plan); setTitle(data.plan.title); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [planId, token]);

  useEffect(() => { loadPlan(); }, [loadPlan]);

  useEffect(() => {
    let cancelled = false;
    api
      .spots({ q: search })
      .then((data) => { if (!cancelled) setAvailableSpots(data.spots); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [search]);

  if (loading) return <div className="sn-loading">Loading plan…</div>;
  if (!plan) return <ErrorBanner message={error || "Plan not found."} />;

  const inPlanIds = plan.spots.map((s) => s.id);
  const addableSpots = availableSpots.filter((s) => !inPlanIds.includes(s.id));

  const handleTitleBlur = async () => {
    if (title.trim() && title !== plan.title) {
      try {
        await api.updatePlanTitle(planId, title.trim(), token);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const addSpot = async (spotId) => {
    setBusy(true);
    try {
      const data = await api.addSpotToPlan(planId, spotId, token);
      setPlan(data.plan);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const removeSpot = async (spotId) => {
    setBusy(true);
    try {
      const data = await api.removeSpotFromPlan(planId, spotId, token);
      setPlan(data.plan);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const move = async (index, dir) => {
    const ids = plan.spots.map((s) => s.id);
    const target = index + dir;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    setBusy(true);
    try {
      const data = await api.reorderPlan(planId, ids, token);
      setPlan(data.plan);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const deleteCurrentPlan = async () => {
    if (!window.confirm(`Delete "${plan.title}"? This cannot be undone.`)) return;

    setDeletingPlan(true);
    try {
      await api.deletePlan(planId, token);
      goTo("myPlans");
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingPlan(false);
    }
  };

  return (
    <div>
      <span className="sn-breadcrumb" onClick={() => goTo("planDetail", planId)}>Back to plan</span>
      <ErrorBanner message={error} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "var(--space-3)", marginBottom: "var(--space-6)" }}>
        <div style={{ flex: 1 }}>
          <span className="sn-label">Plan title</span>
          <input
            className="sn-input"
            style={{ fontWeight: "bold" }}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
          />
        </div>
        <Button
          danger
          disabled={deletingPlan || busy}
          onClick={deleteCurrentPlan}
          style={{ minHeight: "52px", width: "150px", display: "inline-flex", alignItems: "center", justifyContent: "center", paddingTop: "10px", paddingBottom: "10px" }}
        >
          {deletingPlan ? "Deleting…" : "Delete plan"}
        </Button>
      </div>

      <div className="sn-layout-2col-rev">
        <div>
          <div className="sn-h2">Add spots</div>
          <input
            className="sn-input"
            placeholder="Search spots to add…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ margin: "var(--space-3) 0" }}
          />
          <div className="sn-stack" style={{ maxHeight: 360, overflowY: "auto" }}>
            {addableSpots.map((s) => (
              <div key={s.id} className="sn-list-row sn-clickable" onClick={() => addSpot(s.id)}>
                <span>{s.name}</span>
                <span className="sn-dim">{s.price_range} · {s.category}</span>
              </div>
            ))}
            {addableSpots.length === 0 && <div className="sn-dim">No matching spots.</div>}
          </div>
        </div>

        <div>
          <div className="sn-h2">Itinerary</div>
          <div className="sn-stack" style={{ margin: "var(--space-3) 0" }}>
            {plan.spots.length === 0 && <div className="sn-dim">Nothing added yet.</div>}
            {plan.spots.map((s, i) => (
              <div key={s.id} className="sn-list-row">
                <span>{i + 1} · {s.name}</span>
                <span style={{ display: "flex", gap: "var(--space-1)" }}>
                  <span className="sn-mini-btn" onClick={() => move(i, -1)}>▲</span>
                  <span className="sn-mini-btn" onClick={() => move(i, 1)}>▼</span>
                  <span className="sn-mini-btn" onClick={() => removeSpot(s.id)}>✕</span>
                </span>
              </div>
            ))}
          </div>
          <Button block disabled={busy} onClick={() => goTo("planDetail", planId)}>Done</Button>
        </div>
      </div>
    </div>
  );
}

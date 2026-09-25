import { useState, useEffect } from "react";
import { api } from "../api/api";
import { ErrorBanner, RatingStars, Button } from "../components";

export function SpotDetailScreen({ spotId, token, goTo, addToPlan, addBusy }) {
  const [spot, setSpot] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .spot(spotId)
      .then((data) => { if (!cancelled) { setSpot(data.spot); setReviews(data.reviews); } })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [spotId]);

  if (loading) return <div className="sn-loading">Loading spot…</div>;
  if (error) return <ErrorBanner message={error} />;
  if (!spot) return null;

  return (
    <div>
      <span className="sn-breadcrumb" onClick={() => goTo("discover")}>← Back to Discover</span>
      <div className="sn-layout-2col-rev" style={{ marginBottom: "var(--space-6)" }}>
        <div className="sn-placeholder-img" style={{ height: 280 }}>large photo</div>
        <div className="sn-stack">
          <div>
            <div className="sn-h1">{spot.name}</div>
            <RatingStars rating={spot.avg_rating} /> <span className="sn-dim">{Number(spot.avg_rating).toFixed(1)} · {spot.price_range} · {spot.category}</span>
          </div>
          <div className="sn-box">{spot.address}</div>
          <Button onClick={() => addToPlan(spot.id)} disabled={addBusy}>{addBusy ? "Adding…" : "Add to plan"}</Button>
        </div>
      </div>

      <div className="sn-h2">Reviews</div>
      <div className="sn-stack" style={{ marginTop: "var(--space-3)" }}>
        {reviews.length === 0 ? (
          <div className="sn-dim">No reviews yet.</div>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="sn-box">
              {r.user_name} — <RatingStars rating={r.rating} /> — "{r.comment}"
            </div>
          ))
        )}
      </div>
    </div>
  );
}

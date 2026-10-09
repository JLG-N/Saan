import { useState, useEffect } from "react";
import { api } from "../api/api";
import { ErrorBanner, RatingStars, Button } from "../components";

export function SpotDetailScreen({ spotId, token, user, goTo, addToPlan, addBusy }) {
  const [spot, setSpot] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [reviewBusy, setReviewBusy] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState(null);
  const [reviewError, setReviewError] = useState("");
  const [reviewNotice, setReviewNotice] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [plansLoaded, setPlansLoaded] = useState(false);
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    setSpot(null);
    setReviews([]);
    api
      .spot(spotId)
      .then((data) => {
        if (!cancelled) {
          setSpot(data.spot);
          setReviews(data.spot.reviews || []);
        }
      })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [spotId]);

  if (loading) return <div className="sn-loading">Loading spot…</div>;
  if (error) return <ErrorBanner message={error} />;
  if (!spot) return null;

  const openPlanPicker = async () => {
    setPickerOpen(true);
    setPlanLoading(true);
    setPlanError("");
    setPlansLoaded(false);
    try {
      const data = await api.plans(token);
      setPlans(data.plans);
      setSelectedPlanId(data.plans[0]?.id || "__new__");
      setPlansLoaded(true);
    } catch (err) {
      setPlanError(err.message);
    } finally {
      setPlanLoading(false);
    }
  };

  const submitAddToPlan = async () => {
    setPlanError("");
    try {
      await addToPlan(spot.id, selectedPlanId);
    } catch (err) {
      setPlanError(err.message);
    }
  };

  const submitReview = async (event) => {
    event.preventDefault();
    setReviewError("");
    setReviewNotice("");
    setReviewBusy(true);
    try {
      const { review } = await api.createReview(spotId, Number(rating), comment.trim(), token);
      const updatedReviews = [{ ...review, user_name: user?.name || "You" }, ...reviews];
      const average = updatedReviews.reduce((sum, item) => sum + Number(item.rating), 0) / updatedReviews.length;
      setReviews(updatedReviews);
      setSpot((current) => ({ ...current, avg_rating: Math.round(average * 10) / 10 }));
      setComment("");
      setReviewNotice("Review posted.");
    } catch (err) {
      setReviewError(err.message);
    } finally {
      setReviewBusy(false);
    }
  };

  const deleteReview = async (reviewId) => {
    if (!window.confirm("Delete your review? This cannot be undone.")) return;

    setReviewError("");
    setReviewNotice("");
    setDeletingReviewId(reviewId);
    try {
      const result = await api.deleteReview(spotId, reviewId, token);
      setReviews((currentReviews) => currentReviews.filter((review) => review.id !== reviewId));
      setSpot((currentSpot) => ({ ...currentSpot, avg_rating: result.avg_rating }));
      setReviewNotice("Review deleted.");
    } catch (err) {
      setReviewError(err.message);
    } finally {
      setDeletingReviewId(null);
    }
  };

  return (
    <div>
      <span className="sn-breadcrumb" onClick={() => goTo("discover")}>Back to Discover</span>
      <div className="sn-layout-2col-rev" style={{ marginBottom: "var(--space-6)" }}>
        {spot.image_url ? (
          <img src={spot.image_url} alt={spot.name} style={{ width: "100%", height: 280, objectFit: "cover", borderRadius: 16, display: "block" }} />
        ) : (
          <div className="sn-placeholder-img" style={{ height: 280 }}>large photo</div>
        )}
        <div className="sn-stack">
          <div>
            <div className="sn-h1">{spot.name}</div>
            <RatingStars rating={spot.avg_rating} /> <span className="sn-dim">{Number(spot.avg_rating).toFixed(1)} · {spot.price_range} · {spot.category}</span>
          </div>
          {spot.tagline && <div className="sn-box filled">{spot.tagline}</div>}
          <div className="sn-box">{spot.address}{spot.neighborhood ? ` · ${spot.neighborhood}` : ""}</div>
          {Array.isArray(spot.tags) && spot.tags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {spot.tags.map((tag) => (
                <span key={tag} className="sn-tag">{tag}</span>
              ))}
            </div>
          )}
          <Button onClick={openPlanPicker} disabled={addBusy || planLoading}>Add to plan</Button>
          {pickerOpen && (
            <div className="sn-stack">
              <div className="sn-label">Add to which plan?</div>
              {planLoading ? (
                <div className="sn-loading">Loading plans…</div>
              ) : !plansLoaded ? (
                <>
                  <ErrorBanner message={planError} />
                  <Button variant="secondary" onClick={openPlanPicker}>Retry</Button>
                </>
              ) : (
                <>
                  <ErrorBanner message={planError} />
                  <select className="sn-input" value={selectedPlanId} onChange={(event) => setSelectedPlanId(event.target.value)}>
                    <option value="__new__">Create a new plan</option>
                    {plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.title}</option>)}
                  </select>
                  <div className="sn-row">
                    <Button onClick={submitAddToPlan} disabled={addBusy || !selectedPlanId}>{addBusy ? "Adding…" : "Add spot"}</Button>
                    <Button variant="secondary" onClick={() => { setPickerOpen(false); setPlanError(""); }}>Cancel</Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="sn-h2">Reviews</div>
      <div className="sn-stack" style={{ marginTop: "var(--space-3)" }}>
        {reviews.length === 0 ? (
          <div className="sn-dim">No reviews yet.</div>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="sn-box">
              <div>{r.user_name} — <RatingStars rating={r.rating} /> — "{r.comment}"</div>
              {r.user_id === user?.id && (
                <Button
                  variant="secondary"
                  danger
                  disabled={deletingReviewId !== null}
                  onClick={() => deleteReview(r.id)}
                  style={{ marginTop: "var(--space-2)" }}
                >
                  {deletingReviewId === r.id ? "Deleting…" : "Delete review"}
                </Button>
              )}
            </div>
          ))
        )}
      </div>

      <form className="sn-stack" onSubmit={submitReview} style={{ maxWidth: 560, marginTop: "var(--space-8)" }}>
        <div className="sn-h2">Write a review</div>
        <ErrorBanner message={reviewError} />
        {reviewNotice && <div className="sn-dim" role="status">{reviewNotice}</div>}
        <label className="sn-label" htmlFor="review-rating">Rating</label>
        <select id="review-rating" className="sn-input" value={rating} onChange={(event) => setRating(event.target.value)}>
          {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} star{value === 1 ? "" : "s"}</option>)}
        </select>
        <label className="sn-label" htmlFor="review-comment">Comment (optional)</label>
        <textarea
          id="review-comment"
          className="sn-input"
          rows={3}
          maxLength={500}
          placeholder="Share what you thought"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
        />
        <Button type="submit" disabled={reviewBusy}>{reviewBusy ? "Posting…" : "Post review"}</Button>
      </form>
    </div>
  );
}

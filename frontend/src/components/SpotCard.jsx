import { RatingStars } from "./RatingStars";

export function SpotCard({ spot, onClick, favorited, onToggleFavorite }) {
  return (
    <div className="sn-spot-card" onClick={onClick}>
      <div className="sn-spot-media">
        <div className="sn-placeholder-img">image</div>
        {onToggleFavorite && (
          <span
            className="sn-spot-fav"
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(spot.id); }}
          >
            {favorited ? "♥" : "♡"}
          </span>
        )}
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, marginTop: "var(--space-2)", marginBottom: "var(--space-1)" }}>{spot.name}</div>
      <RatingStars rating={spot.avg_rating} /> <span className="sn-dim">· {spot.price_range}</span>
    </div>
  );
}

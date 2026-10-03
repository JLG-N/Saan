import { RatingStars } from "./RatingStars";

export function SpotCard({ spot, onClick, favorited, onToggleFavorite }) {
  const tags = Array.isArray(spot.tags) ? spot.tags.slice(0, 2) : [];

  return (
    <div className="sn-spot-card" onClick={onClick}>
      <div className="sn-spot-media">
        {spot.image_url ? (
          <img
            src={spot.image_url}
            alt={spot.name}
            style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 12, display: "block" }}
          />
        ) : (
          <div className="sn-placeholder-img">image</div>
        )}
        {onToggleFavorite && (
          <button
            type="button"
            className="sn-spot-fav"
            aria-label={favorited ? `Remove ${spot.name} from saved spots` : `Save ${spot.name}`}
            aria-pressed={favorited}
            title={favorited ? "Remove from saved spots" : "Save spot"}
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(spot.id); }}
          >
            {favorited ? "♥" : "♡"}
          </button>
        )}
      </div>

      <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, marginTop: "var(--space-2)", marginBottom: "var(--space-1)" }}>{spot.name}</div>
      {spot.neighborhood && <div className="sn-dim" style={{ fontSize: 12, marginBottom: 6 }}>{spot.neighborhood}</div>}
      {spot.tagline && <div style={{ color: "var(--color-ink-soft)", fontSize: 12, lineHeight: 1.5, marginBottom: 8 }}>{spot.tagline}</div>}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        <RatingStars rating={spot.avg_rating} />
        <span className="sn-dim">· {spot.price_range}</span>
      </div>
      {tags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {tags.map((tag) => (
            <span key={tag} style={{ background: "var(--color-primary-soft)", color: "var(--color-primary-dark)", borderRadius: 999, padding: "4px 8px", fontSize: 11, fontWeight: 600 }}>
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { api } from "../api/api";
import { CATEGORIES } from "../constants";
import { NavBar, SpotCard, EmptyState, ErrorBanner } from "../components";

export function DiscoverScreen({ token, user, goTo, openSpot, favorites, toggleFavorite }) {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    api
      .spots({ category, q: query })
      .then((data) => { if (!cancelled) setSpots(data.spots); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [category, query]);

  return (
    <div>
      <NavBar view="discover" goTo={goTo} user={user} />
      <input
        className="sn-input"
        placeholder="Search spots…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ marginBottom: "var(--space-4)", padding: "var(--space-4)", textAlign: "center" }}
      />
      <div className="sn-layout-2col">
        <div className="sn-sidebar">
          <div className="sn-label">Filters</div>
          {CATEGORIES.map((c) => (
            <div key={c} className={`sn-box ${category === c ? "active" : ""}`} onClick={() => setCategory(c)}>
              {category === c ? "☑" : "☐"} {c}
            </div>
          ))}
        </div>
        <div>
          <ErrorBanner message={error} />
          {loading ? (
            <div className="sn-loading">Loading spots…</div>
          ) : spots.length === 0 ? (
            <EmptyState message="No spots match that search or filter." />
          ) : (
            <>
              <div className="sn-card-grid">
                {spots.map((s) => (
                  <SpotCard
                    key={s.id}
                    spot={s}
                    onClick={() => openSpot(s.id)}
                    favorited={favorites.includes(s.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
              <div className="sn-footer-bar">‹ prev &nbsp; 1 &nbsp; next ›</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

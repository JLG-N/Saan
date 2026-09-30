import { useState, useEffect } from "react";
import { api } from "../api/api";
import { NavBar, SpotCard, Button } from "../components";

export function ProfileScreen({ user, goTo, onSignOut, favorites, toggleFavorite }) {
  const [favSpots, setFavSpots] = useState([]);
  const [section, setSection] = useState("profile");

  useEffect(() => {
    let cancelled = false;
    Promise.all(favorites.map((id) => api.spot(id).then((d) => d.spot).catch(() => null))).then((spots) => {
      if (!cancelled) setFavSpots(spots.filter(Boolean));
    });
    return () => { cancelled = true; };
  }, [favorites]);

  return (
    <div>
      <NavBar view="profile" goTo={goTo} user={user} />
      <div className="sn-layout-2col">
        <nav className="sn-sidebar" aria-label="Profile sections">
          <div className="sn-placeholder-img" style={{ height: 80, marginBottom: "var(--space-2)" }}>avatar</div>
          {[
            { id: "profile", label: "Profile" },
            { id: "saved", label: "Saved spots" },
            { id: "settings", label: "Account settings" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              className={`sn-box ${section === item.id ? "active" : ""}`}
              aria-current={section === item.id ? "page" : undefined}
              onClick={() => setSection(item.id)}
            >
              {item.label}
            </button>
          ))}
          <Button variant="secondary" block onClick={onSignOut}>Sign out</Button>
        </nav>
        <section aria-live="polite">
          {section === "profile" && (
            <>
              <h1 className="sn-h1">Profile</h1>
              <div className="sn-label" style={{ marginTop: "var(--space-6)" }}>Display name</div>
              <div className="sn-box" style={{ marginBottom: "var(--space-3)", display: "inline-block" }}>{user?.name}</div>
              <div className="sn-label">Email</div>
              <div className="sn-dim">{user?.email}</div>
            </>
          )}

          {section === "saved" && (
            <>
              <h1 className="sn-h1">Saved spots</h1>
              <div className="sn-label" style={{ marginTop: "var(--space-6)" }}>Saved spots ({favSpots.length})</div>
              {favSpots.length === 0 ? (
                <div className="sn-dim">Tap the star on any spot in Discover to save it here.</div>
              ) : (
                <div className="sn-card-grid">
                  {favSpots.map((spot) => (
                    <SpotCard
                      key={spot.id}
                      spot={spot}
                      onClick={() => goTo("spotDetail", spot.id)}
                      favorited
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {section === "settings" && (
            <>
              <h1 className="sn-h1">Account settings</h1>
              <h2 className="sn-h2" style={{ marginTop: "var(--space-6)" }}>Account details</h2>
              <div className="sn-list-row"><span>Display name</span><span>{user?.name}</span></div>
              <div className="sn-list-row" style={{ marginTop: "var(--space-2)" }}><span>Email</span><span>{user?.email}</span></div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

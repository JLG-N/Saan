import { useState, useEffect } from "react";
import { api } from "../api/api";
import { NavBar, SpotCard, Button } from "../components";

export function ProfileScreen({ user, goTo, onSignOut, favorites }) {
  const [favSpots, setFavSpots] = useState([]);

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
        <div className="sn-sidebar">
          <div className="sn-placeholder-img" style={{ height: 80, marginBottom: "var(--space-2)" }}>avatar</div>
          <div className="sn-box filled">Profile</div>
          <div className="sn-box">Saved spots</div>
          <div className="sn-box">Account settings</div>
          <Button variant="secondary" block onClick={onSignOut}>Sign out</Button>
        </div>
        <div>
          <div className="sn-label">Display name</div>
          <div className="sn-box" style={{ marginBottom: "var(--space-3)", display: "inline-block" }}>{user?.name}</div>
          <div className="sn-dim" style={{ fontSize: "var(--font-sm)", marginBottom: "var(--space-3)" }}>{user?.email}</div>
          <div className="sn-label">Saved spots ({favSpots.length})</div>
          {favSpots.length === 0 ? (
            <div className="sn-dim">Tap the star on any spot in Discover to save it here. (Favorites are kept in this browser session only — there's no favorites table in the schema yet.)</div>
          ) : (
            <div className="sn-card-grid">
              {favSpots.map((s) => (
                <SpotCard key={s.id} spot={s} onClick={() => {}} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

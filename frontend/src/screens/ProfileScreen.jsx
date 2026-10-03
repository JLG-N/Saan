import { useState, useEffect } from "react";
import { api } from "../api/api";
import { NavBar, SpotCard, Button } from "../components";

export function ProfileScreen({ user, goTo, onSignOut, onDeleteAccount, saveAccount, onToggleSaveAccount, favorites, toggleFavorite }) {
  const [favSpots, setFavSpots] = useState([]);
  const [section, setSection] = useState("profile");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
        <section className="sn-profile-panel" aria-live="polite">
          {section === "profile" && (
            <div className="sn-profile-details">
              <h1 className="sn-h1">Profile</h1>

              <div className="sn-profile-field">
                <div className="sn-label">Display name</div>
                <div className="sn-value-box">{user?.name}</div>
              </div>

              <div className="sn-profile-field">
                <div className="sn-label">Email</div>
                <div className="sn-value-box muted">{user?.email}</div>
              </div>
            </div>
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

              <label style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "var(--space-6)", color: "var(--color-ink-soft)", fontSize: "var(--font-sm)" }}>
                <input type="checkbox" checked={!!saveAccount} onChange={(e) => onToggleSaveAccount(e.target.checked)} />
                Save this account
              </label>

              <div style={{ marginTop: "var(--space-6)" }}>
                <Button danger block onClick={() => setShowDeleteConfirm(true)}>Delete account</Button>
              </div>

              {showDeleteConfirm && (
                <div className="sn-warning-card" style={{ marginTop: "var(--space-4)" }}>
                  <div className="sn-warning-title">Delete this account?</div>
                  <div className="sn-warning-copy">
                    This will permanently remove your account and all saved data. This action cannot be undone.
                  </div>
                  <div className="sn-warning-actions">
                    <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
                    <Button danger onClick={() => { setShowDeleteConfirm(false); onDeleteAccount(); }}>Delete account</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

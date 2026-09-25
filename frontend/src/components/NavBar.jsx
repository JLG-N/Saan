export function NavBar({ view, goTo, user }) {
  const links = [
    { key: "discover", label: "Discover" },
    { key: "myPlans", label: "My Plans" },
    { key: "profile", label: "Profile" },
  ];
  const initials = user?.name
    ? user.name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("")
    : "";
  return (
    <div className="sn-navbar">
      <div className="logo" onClick={() => goTo("discover")}>Saan</div>
      <div className="links">
        {links.map((l) => (
          <span key={l.key} className={view === l.key ? "active" : ""} onClick={() => goTo(l.key)}>
            {l.label}
          </span>
        ))}
        {user && <span className="user" title={user.name}>{initials}</span>}
      </div>
    </div>
  );
}

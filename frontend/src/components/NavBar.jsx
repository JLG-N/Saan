export function NavBar({ view, goTo, user }) {
  const links = [
    { key: "discover", label: "Discover" },
    { key: "myPlans", label: "My Plans" },
    { key: "profile", label: "Profile" },
  ];

  return (
    <div className="sn-navbar">
      <div className="logo" onClick={() => goTo("discover")}>Saan</div>
      <div className="links">
        {links.map((l) => (
          <span key={l.key} className={view === l.key ? "active" : ""} onClick={() => goTo(l.key)}>
            {l.label}
          </span>
        ))}
      </div>
    </div>
  );
}

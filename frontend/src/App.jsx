import { useState, useEffect } from "react";
import { Styles } from "./styles/Styles";
import { api } from "./api/api";
import {
  LoginScreen,
  DiscoverScreen,
  SpotDetailScreen,
  MyPlansScreen,
  PlanBuilderScreen,
  PlanDetailScreen,
  ProfileScreen,
  SharedPlanScreen,
} from "./screens";

// Public share links look like /p/<token>. Handled before login so a friend
// without an account can open them.
function getShareTokenFromUrl() {
  const m = window.location.pathname.match(/^\/p\/([A-Za-z0-9_-]+)\/?$/);
  return m ? m[1] : null;
}

export default function App() {
  const shareToken = getShareTokenFromUrl();
  if (shareToken) {
    return (
      <div className="saan-root">
        <Styles />
        <div className="sn-shell"><SharedPlanScreen shareToken={shareToken} /></div>
      </div>
    );
  }
  return <AppInner />;
}

function AppInner() {
  const [view, setView] = useState("login");
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [apiError, setApiError] = useState("");
  const [saveAccount, setSaveAccount] = useState(() => {
    try {
      const raw = localStorage.getItem("saan-save-account");
      return raw === null ? true : raw === "true";
    } catch (err) {
      return true;
    }
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem("saan-auth");
      const pref = localStorage.getItem("saan-save-account");
      if (!raw || pref === "false") {
        if (pref === "false") localStorage.removeItem("saan-auth");
        return;
      }
      const saved = JSON.parse(raw);
      if (saved?.token && saved?.user) {
        setToken(saved.token);
        setUser(saved.user);
        setView("discover");
      }
    } catch (err) {
      console.warn("Could not restore saved account:", err);
    }
  }, []);

  const [selectedSpotId, setSelectedSpotId] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [addBusy, setAddBusy] = useState(false);

  const [favorites, setFavorites] = useState([]); // client-side only — no favorites table in the schema

  const goTo = (v, id) => {
    if (v === "spotDetail") setSelectedSpotId(id);
    if (v === "planDetail" || v === "planBuilder") setSelectedPlanId(id);
    setView(v);
  };

  const savePreference = (next) => {
    try {
      localStorage.setItem("saan-save-account", String(next));
    } catch (err) {
      console.warn("Could not store save preference:", err);
    }
  };

  const saveAccountSession = (tok, u) => {
    try {
      localStorage.setItem("saan-auth", JSON.stringify({ token: tok, user: u }));
    } catch (err) {
      console.warn("Could not persist account:", err);
    }
  };

  const clearSavedAccount = () => {
    try {
      localStorage.removeItem("saan-auth");
    } catch (err) {
      console.warn("Could not clear saved account:", err);
    }
  };

  const handleAuth = (tok, u, save = true) => {
    setToken(tok);
    setUser(u);
    setSaveAccount(save);
    savePreference(save);
    if (save) saveAccountSession(tok, u);
    else clearSavedAccount();
    setView("discover");
  };

  const handleSignOut = () => {
    setToken(null);
    setUser(null);
    setFavorites([]);
    if (!saveAccount) clearSavedAccount();
    else clearSavedAccount();
    setView("login");
  };

  const handleToggleSaveAccount = (nextValue) => {
    setSaveAccount(nextValue);
    savePreference(nextValue);
    if (nextValue) {
      if (token && user) saveAccountSession(token, user);
    } else {
      clearSavedAccount();
    }
  };

  const handleDeleteAccount = async () => {
    if (!token || !user) return;

    try {
      await api.deleteAccount(token);
      handleSignOut();
    } catch (err) {
      setApiError(err.message);
    }
  };

  const openSpot = (id) => {
    setSelectedSpotId(id);
    setView("spotDetail");
  };

  const toggleFavorite = (id) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
  };

  const addToPlan = async (spotId, targetPlanId) => {
    setAddBusy(true);
    try {
      let planId = targetPlanId;
      if (planId === "__new__") {
        const created = await api.createPlan("New Plan", token);
        planId = created.plan.id;
      }
      if (!planId) throw new Error("Choose a plan first.");
      await api.addSpotToPlan(planId, spotId, token);
      setSelectedPlanId(planId);
      setView("planBuilder");
    } catch (err) {
      throw err;
    } finally {
      setAddBusy(false);
    }
  };

  const startNewPlan = async () => {
    setApiError("");
    try {
      const created = await api.createPlan("New Plan", token);
      setSelectedPlanId(created.plan.id);
      setView("planBuilder");
    } catch (err) {
      setApiError(err.message);
    }
  };

  const viewPlan = (id) => {
    setSelectedPlanId(id);
    setView("planDetail");
  };

  let screen = null;
  if (view === "login") screen = <LoginScreen onAuth={handleAuth} apiError={apiError} />;
  else if (view === "discover")
    screen = <DiscoverScreen token={token} user={user} goTo={goTo} openSpot={openSpot} favorites={favorites} toggleFavorite={toggleFavorite} />;
  else if (view === "spotDetail")
    screen = <SpotDetailScreen spotId={selectedSpotId} token={token} user={user} goTo={goTo} addToPlan={addToPlan} addBusy={addBusy} />;
  else if (view === "myPlans")
    screen = <MyPlansScreen token={token} user={user} goTo={goTo} viewPlan={viewPlan} startNewPlan={startNewPlan} />;
  else if (view === "planBuilder")
    screen = <PlanBuilderScreen planId={selectedPlanId} token={token} goTo={goTo} />;
  else if (view === "planDetail")
    screen = <PlanDetailScreen planId={selectedPlanId} token={token} goTo={goTo} />;
  else if (view === "profile")
    screen = (
      <ProfileScreen
        user={user}
        goTo={goTo}
        onSignOut={handleSignOut}
        onDeleteAccount={handleDeleteAccount}
        saveAccount={saveAccount}
        onToggleSaveAccount={handleToggleSaveAccount}
        favorites={favorites}
        toggleFavorite={toggleFavorite}
      />
    );

  return (
    <div className="saan-root">
      <Styles />
      <div className={`sn-shell${view === "login" ? " sn-shell-auth" : ""}`}>{screen}</div>
    </div>
  );
}

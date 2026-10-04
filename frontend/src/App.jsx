import { useState, useEffect, useCallback } from "react";
import { Styles } from "./styles/Styles";
import { api } from "./api/api";
import { AuthProvider, useAuth } from "./context/AuthContext";
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

  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}

function AppInner() {
  const { token, user, saveAccount, signIn, signOut, toggleSaveAccount, deleteAccount } = useAuth();
  const [view, setView] = useState("login");
  const [apiError, setApiError] = useState("");
  const [selectedSpotId, setSelectedSpotId] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [addBusy, setAddBusy] = useState(false);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    if (token && user) {
      setView("discover");
    } else {
      setView("login");
    }
  }, [token, user]);

  const goTo = useCallback((nextView, id) => {
    if (nextView === "spotDetail") setSelectedSpotId(id);
    if (nextView === "planDetail" || nextView === "planBuilder") setSelectedPlanId(id);
    setView(nextView);
  }, []);

  const handleAuth = useCallback((nextToken, nextUser, shouldSave = true) => {
    signIn(nextToken, nextUser, shouldSave);
    setView("discover");
  }, [signIn]);

  const handleSignOut = useCallback(() => {
    setFavorites([]);
    signOut();
    setView("login");
  }, [signOut]);

  const handleToggleSaveAccount = useCallback((nextValue) => {
    toggleSaveAccount(nextValue);
  }, [toggleSaveAccount]);

  const handleDeleteAccount = useCallback(async () => {
    if (!token || !user) return;

    try {
      await deleteAccount();
      setFavorites([]);
      setView("login");
    } catch (err) {
      setApiError(err.message);
    }
  }, [deleteAccount, token, user]);

  const openSpot = useCallback((id) => {
    setSelectedSpotId(id);
    setView("spotDetail");
  }, []);

  const toggleFavorite = useCallback((id) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
  }, []);

  const addToPlan = useCallback(async (spotId, targetPlanId) => {
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
  }, [token]);

  const startNewPlan = useCallback(async () => {
    setApiError("");
    try {
      const created = await api.createPlan("New Plan", token);
      setSelectedPlanId(created.plan.id);
      setView("planBuilder");
    } catch (err) {
      setApiError(err.message);
    }
  }, [token]);

  const viewPlan = useCallback((id) => {
    setSelectedPlanId(id);
    setView("planDetail");
  }, []);

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
    <div className={`saan-root${view === "login" ? " saan-auth-root" : ""}`}>
      <Styles />
      <div className={`sn-shell${view === "login" ? " sn-shell-auth" : ""}`}>{screen}</div>
    </div>
  );
}

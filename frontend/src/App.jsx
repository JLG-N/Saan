import { useState } from "react";
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
} from "./screens";

export default function App() {
  const [view, setView] = useState("login");
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [apiError, setApiError] = useState("");

  const [selectedSpotId, setSelectedSpotId] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [addBusy, setAddBusy] = useState(false);

  const [favorites, setFavorites] = useState([]); // client-side only — no favorites table in the schema

  const goTo = (v, id) => {
    if (v === "spotDetail") setSelectedSpotId(id);
    if (v === "planDetail" || v === "planBuilder") setSelectedPlanId(id);
    setView(v);
  };

  const handleAuth = (tok, u) => {
    setToken(tok);
    setUser(u);
    setView("discover");
  };

  const handleSignOut = () => {
    setToken(null);
    setUser(null);
    setFavorites([]);
    setView("login");
  };

  const openSpot = (id) => {
    setSelectedSpotId(id);
    setView("spotDetail");
  };

  const toggleFavorite = (id) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
  };

  // Add to plan from Spot Detail: create a plan on the server if none is
  // "in progress" yet, then attach this spot to it and jump into the builder.
  const addToPlan = async (spotId) => {
    setAddBusy(true);
    setApiError("");
    try {
      let planId = selectedPlanId;
      if (view !== "planBuilder" || !planId) {
        const created = await api.createPlan("New Plan", token);
        planId = created.plan.id;
      }
      await api.addSpotToPlan(planId, spotId, token);
      setSelectedPlanId(planId);
      setView("planBuilder");
    } catch (err) {
      setApiError(err.message);
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
    screen = <SpotDetailScreen spotId={selectedSpotId} token={token} goTo={goTo} addToPlan={addToPlan} addBusy={addBusy} />;
  else if (view === "myPlans")
    screen = <MyPlansScreen token={token} user={user} goTo={goTo} viewPlan={viewPlan} startNewPlan={startNewPlan} />;
  else if (view === "planBuilder")
    screen = <PlanBuilderScreen planId={selectedPlanId} token={token} goTo={goTo} />;
  else if (view === "planDetail")
    screen = <PlanDetailScreen planId={selectedPlanId} token={token} goTo={goTo} />;
  else if (view === "profile")
    screen = <ProfileScreen user={user} goTo={goTo} onSignOut={handleSignOut} favorites={favorites} />;

  return (
    <div className="saan-root">
      <Styles />
      <div className="sn-shell">{screen}</div>
    </div>
  );
}

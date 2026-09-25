import { useState } from "react";
import { api } from "../api/api";
import { Button, ErrorBanner } from "../components";

export function LoginScreen({ onAuth, apiError }) {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("demo@saan.app");
  const [password, setPassword] = useState("password123");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState("");

  const submit = async () => {
    setLocalError("");
    setBusy(true);
    try {
      const result =
        mode === "login" ? await api.login(email, password) : await api.signup(email, password, name || "Player One");
      onAuth(result.token, result.user);
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="sn-split">
      <div className="sn-left">
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "28px" }}>Saan</div>
        <div style={{ fontSize: "var(--font-sm)", marginTop: "var(--space-3)", opacity: 0.85 }}>find a spot. make a plan. go.</div>
      </div>
      <div className="sn-right">
        <span className="sn-label">{mode === "login" ? "Sign in" : "Create account"}</span>
        <ErrorBanner message={localError || apiError} />
        {mode === "signup" && (
          <input className="sn-input" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        )}
        <input className="sn-input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="sn-input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button block onClick={submit} disabled={busy}>
          {busy ? "..." : mode === "login" ? "Sign in" : "Create account"}
        </Button>
        <div className="sn-dim sn-link" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
          {mode === "login" ? "Create an account →" : "← Back to sign in"}
        </div>
        <div className="sn-dim" style={{ fontSize: "var(--font-sm)" }}>
          Demo login is pre-filled: demo@saan.app / password123
        </div>
      </div>
    </div>
  );
}

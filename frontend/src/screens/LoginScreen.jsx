import { useState } from "react";
import { api } from "../api/api";
import { Button, ErrorBanner } from "../components";
import saanLogo from "../../Saan_Logo.jpg";

export function LoginScreen({ onAuth, apiError }) {
  const [mode, setMode] = useState("login"); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [saveAccount, setSaveAccount] = useState(true);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState("");

  const submit = async () => {
    setLocalError("");
    setBusy(true);
    try {
      const result =
        mode === "login" ? await api.login(email, password) : await api.signup(email, password, name || "Player One");
      onAuth(result.token, result.user, saveAccount);
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="sn-split">
      <div className="sn-left">
        <div className="sn-brand-panel">
          <div className="sn-brand-crop">
            <img className="sn-brand-mark" src={saanLogo} alt="Saan — find a spot. make a plan. go." />
          </div>
        </div>
      </div>
      <div className="sn-right">
        <span className="sn-label">{mode === "login" ? "Sign in" : "Create account"}</span>
        <ErrorBanner message={localError || apiError} />
        {mode === "signup" && (
          <input className="sn-input" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        )}
        <input className="sn-input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="sn-input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <label style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-ink-soft)", fontSize: "var(--font-sm)", marginBottom: "var(--space-3)" }}>
          <input type="checkbox" checked={saveAccount} onChange={(e) => setSaveAccount(e.target.checked)} />
          Save this account
        </label>
        <Button block onClick={submit} disabled={busy}>
          {busy ? "..." : mode === "login" ? "Sign in" : "Create account"}
        </Button>
        <div className="sn-dim sn-link" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
          {mode === "login" ? "Create an account" : "Back to sign in"}
        </div>
      </div>
    </div>
  );
}

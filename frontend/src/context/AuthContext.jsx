import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api/api";

const AuthContext = createContext(null);
const AUTH_STORAGE_KEY = "saan-auth";
const SAVE_PREFERENCE_KEY = "saan-save-account";

function readStoredAuth() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    const pref = localStorage.getItem(SAVE_PREFERENCE_KEY);

    if (!raw || pref === "false") {
      if (pref === "false") localStorage.removeItem(AUTH_STORAGE_KEY);
      return { token: null, user: null, saveAccount: pref === null ? true : pref === "true" };
    }

    const saved = JSON.parse(raw);
    if (saved?.token && saved?.user) {
      return { token: saved.token, user: saved.user, saveAccount: true };
    }
  } catch (err) {
    console.warn("Could not restore saved account:", err);
  }

  return { token: null, user: null, saveAccount: true };
}

export function AuthProvider({ children }) {
  const initialState = useMemo(() => readStoredAuth(), []);
  const [token, setToken] = useState(initialState.token);
  const [user, setUser] = useState(initialState.user);
  const [saveAccount, setSaveAccount] = useState(initialState.saveAccount);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  const persistPreference = useCallback((nextValue) => {
    setSaveAccount(nextValue);
    try {
      localStorage.setItem(SAVE_PREFERENCE_KEY, String(nextValue));
    } catch (err) {
      console.warn("Could not store save preference:", err);
    }
  }, []);

  const persistSession = useCallback((nextToken, nextUser) => {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: nextToken, user: nextUser }));
    } catch (err) {
      console.warn("Could not persist account:", err);
    }
  }, []);

  const clearSession = useCallback(() => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (err) {
      console.warn("Could not clear saved account:", err);
    }
  }, []);

  const signIn = useCallback((nextToken, nextUser, shouldSave = true) => {
    setToken(nextToken);
    setUser(nextUser);
    persistPreference(shouldSave);
    if (shouldSave) {
      persistSession(nextToken, nextUser);
    } else {
      clearSession();
    }
  }, [clearSession, persistPreference, persistSession]);

  const signOut = useCallback(() => {
    setToken(null);
    setUser(null);
    clearSession();
  }, [clearSession]);

  const toggleSaveAccount = useCallback((nextValue) => {
    persistPreference(nextValue);
    if (nextValue && token && user) {
      persistSession(token, user);
    } else {
      clearSession();
    }
  }, [clearSession, persistPreference, persistSession, token, user]);

  const deleteAccount = useCallback(async () => {
    if (!token || !user) return;
    await api.deleteAccount(token);
    signOut();
  }, [signOut, token, user]);

  const value = useMemo(() => ({
    token,
    user,
    saveAccount,
    ready,
    signIn,
    signOut,
    toggleSaveAccount,
    deleteAccount,
  }), [deleteAccount, ready, saveAccount, signIn, signOut, toggleSaveAccount, token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}

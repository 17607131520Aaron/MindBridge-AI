"use client";

const BROWSER_SESSION_STORAGE_KEY = "mindbridge_browser_session_id";

function createBrowserSessionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `browser_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
}

export function getBrowserSessionId(): string {
  const existingId = window.localStorage.getItem(BROWSER_SESSION_STORAGE_KEY);

  if (existingId) {
    return existingId;
  }

  const nextId = createBrowserSessionId();
  window.localStorage.setItem(BROWSER_SESSION_STORAGE_KEY, nextId);
  return nextId;
}

"use client";

export interface AuthExpiredPayload {
  message: string;
}

type AuthExpiredListener = (payload: AuthExpiredPayload) => void;

const listeners = new Set<AuthExpiredListener>();

export function publishAuthExpired(payload: AuthExpiredPayload): void {
  listeners.forEach((listener) => {
    listener(payload);
  });
}

export function subscribeAuthExpired(listener: AuthExpiredListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

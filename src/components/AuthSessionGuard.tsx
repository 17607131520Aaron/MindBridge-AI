"use client";

import { useEffect, useRef } from "react";
import { Modal } from "antd";
import { usePathname, useRouter } from "next/navigation";
import { subscribeAuthExpired } from "@/utils/authEventBus";

const CHECK_INTERVAL_MS = 5000;

async function clearAuthCookie() {
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
  } catch {
    // ignore cleanup errors
  }
}

export default function AuthSessionGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const [modal, contextHolder] = Modal.useModal();
  const handlingRef = useRef(false);
  const lastCheckAtRef = useRef(0);

  useEffect(() => {
    if (pathname === "/login") {
      handlingRef.current = false;
      return;
    }

    const handleExpired = async (message: string) => {
      if (handlingRef.current) {
        return;
      }

      handlingRef.current = true;
      await clearAuthCookie();

      await modal.warning({
        title: "登录已失效",
        content: message,
        okText: "重新登录",
        centered: true,
      });

      router.replace("/login");
    };

    const unsubscribe = subscribeAuthExpired(({ message }) => {
      void handleExpired(message);
    });

    const checkSession = async () => {
      if (handlingRef.current) {
        return;
      }

      const now = Date.now();
      if (now - lastCheckAtRef.current < 5000) {
        return;
      }
      lastCheckAtRef.current = now;

      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        });

        if (response.status !== 401) {
          router.replace("/login");
          return;
        }

        const result = await response.json().catch(() => null);
        const message =
          result?.message === "未登录"
            ? "账号在其他地方已登录，请重新登录"
            : (result?.message ?? "账号在其他地方已登录，请重新登录");

        await handleExpired(message);
      } catch {
        // ignore transient network errors
      }
    };

    const intervalId = window.setInterval(() => {
      void checkSession();
    }, CHECK_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void checkSession();
      }
    };

    const handleFocus = () => {
      void checkSession();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    void checkSession();

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      unsubscribe();
    };
  }, [modal, pathname, router]);

  return contextHolder;
}

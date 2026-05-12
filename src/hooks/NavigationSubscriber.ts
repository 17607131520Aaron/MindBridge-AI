// hooks/useNavigationSubscriber.ts
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { subscribeNavigate } from "@/utils/navigationBus";
import type { NavigatePayload } from "@/utils/navigationBus";

type UseNavigationSubscriberOptions = {
  /** 是否启用导航监听，默认true */
  enabled?: boolean;
  /** 导航前拦截器，返回false可取消导航 */
  onBeforeNavigate?: (payload: NavigatePayload) => void | boolean;
  /** 导航完成后回调 */
  onAfterNavigate?: (payload: NavigatePayload) => void;
};

/**
 * 全局导航事件订阅Hook
 * 用于在Next.js App Router中监听来自事件总线的导航请求
 */
function useNavigationSubscriber({
  enabled = true,
  onBeforeNavigate,
  onAfterNavigate,
}: UseNavigationSubscriberOptions = {}): void {
  const router = useRouter();

  // 使用ref保存最新的回调，避免依赖变化导致频繁重新订阅
  const callbacksRef = useRef({ onBeforeNavigate, onAfterNavigate });

  // 实时更新回调引用
  useEffect(() => {
    callbacksRef.current = { onBeforeNavigate, onAfterNavigate };
  }, [onBeforeNavigate, onAfterNavigate]);

  useEffect(() => {
    if (!enabled) return;

    const handleNavigate = (payload: NavigatePayload) => {
      // 执行前置拦截
      const shouldContinue = callbacksRef.current.onBeforeNavigate?.(payload);
      if (shouldContinue === false) return;

      // 执行导航
      if (payload.replace) {
        router.replace(payload.to);
      } else {
        router.push(payload.to);
      }

      // 执行后置回调
      callbacksRef.current.onAfterNavigate?.(payload);
    };

    // 订阅事件并返回清理函数
    const unsubscribe = subscribeNavigate(handleNavigate);
    return unsubscribe;
  }, [router, enabled]);
}

export default useNavigationSubscriber;

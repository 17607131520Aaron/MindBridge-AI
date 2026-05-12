"use client";

import useNavigationSubscriber from "@/hooks/NavigationSubscriber";

/** 在根布局挂载全局导航总线订阅（无 UI） */
export default function NavigationSubscriber() {
  useNavigationSubscriber();
  return null;
}

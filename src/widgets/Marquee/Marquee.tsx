"use client";

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import classnames from "classnames/bind";
import styles from "./Marquee.scss";

const cx = classnames.bind(styles);

export type MarqueeProps = {
  /** 跑马灯展示的文案（会无缝循环滚动） */
  text: string;
  /** 完整跑一圈的动画时长（毫秒），默认 24000 */
  durationMs?: number;
  /** 仅当文案超出可视宽度时才会进入滚动；超出后再延迟该时长开跑，0 表示立即滚动，默认 0 */
  idleMs?: number;
  className?: string;
};

const Marquee: React.FC<MarqueeProps> = ({
  text,
  durationMs = 24_000,
  idleMs = 0,
  className,
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const measureInnerRef = useRef<HTMLDivElement>(null);
  const measureTextRef = useRef<HTMLSpanElement>(null);

  const [needsScroll, setNeedsScroll] = useState(false);
  const [scrolling, setScrolling] = useState(false);

  const measureOverflow = useCallback(() => {
    const inner = measureInnerRef.current;
    const span = measureTextRef.current;
    if (!inner || !span) return;
    const tolerance = 1;
    const next = span.scrollWidth > inner.clientWidth + tolerance;
    setNeedsScroll((prev) => (prev === next ? prev : next));
  }, []);

  useLayoutEffect(() => {
    measureOverflow();
    const el = rootRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => measureOverflow());
    ro.observe(el);
    return () => ro.disconnect();
  }, [text, measureOverflow]);

  useEffect(() => {
    let cancelled = false;

    const resetId = window.setTimeout(() => {
      if (!cancelled) setScrolling(false);
    }, 0);

    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return () => {
        cancelled = true;
        window.clearTimeout(resetId);
      };
    }

    let startId: number | undefined;
    if (needsScroll) {
      startId = window.setTimeout(() => {
        if (!cancelled) setScrolling(true);
      }, idleMs);
    }

    return () => {
      cancelled = true;
      window.clearTimeout(resetId);
      if (startId !== undefined) window.clearTimeout(startId);
    };
  }, [text, idleMs, needsScroll]);

  return (
    <div
      ref={rootRef}
      className={cx("marquee", !scrolling && "marquee--idle", className)}
      aria-label={text}
    >
      <div
        ref={measureInnerRef}
        className={cx("marquee-measure")}
        aria-hidden
      >
        <span ref={measureTextRef} className={cx("marquee-idle-text")}>
          {text}
        </span>
      </div>

      {!scrolling ? (
        <div className={cx("marquee-idle")}>
          <span className={cx("marquee-idle-text")}>{text}</span>
        </div>
      ) : (
        <div
          className={cx("marquee-track")}
          style={{ animationDuration: `${durationMs}ms` }}
        >
          <span className={cx("marquee-segment")}>{text}</span>
          <span className={cx("marquee-segment")} aria-hidden>
            {text}
          </span>
        </div>
      )}
    </div>
  );
};

export default Marquee;

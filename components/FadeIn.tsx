"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

/**
 * セクションの控えめなフェードイン。
 * サーバー出力は常に表示状態にして、JavaScript 無効時でもコンテンツを読めるようにする。
 * JS 有効時のみ、マウント後(hydration 後)に画面外のセクションを一旦隠し、
 * 視界に入ったら CSS transition でフェードインする(mismatch は発生しない)。
 * prefers-reduced-motion 時は何もせず、常に表示のままにする。
 */
export default function FadeIn({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // 初期表示の時点で画面内にある要素は隠さない(表示のちらつきを防ぐ)
    if (element.getBoundingClientRect().top < window.innerHeight - 40) return;

    setIsHidden(true);
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsHidden(false);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition duration-500 ease-out motion-reduce:transition-none ${
        isHidden ? "translate-y-4 opacity-0" : "translate-y-0 opacity-100"
      }${className ? ` ${className}` : ""}`}
    >
      {children}
    </div>
  );
}

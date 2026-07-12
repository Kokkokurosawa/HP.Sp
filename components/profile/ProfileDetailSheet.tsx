"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ProfileTrait } from "@/content/profile";

/**
 * プロフィール項目の詳細を表示するダイアログ。
 * モバイルは画面下からのボトムシート、デスクトップは中央ダイアログ(同一コンポーネントを CSS で適応)。
 * 背景 inert・スクロールロック・フォーカス移動/トラップ/返却・Escape・reduced-motion 即時表示に対応。
 * trait が null の間は何も描画しない(SSR では出力されず、操作後にクライアントでのみ表示)。
 */
export default function ProfileDetailSheet({
  trait,
  onClose,
}: {
  trait: ProfileTrait | null;
  onClose: () => void;
}) {
  if (!trait) return null;
  return <SheetInner trait={trait} onClose={onClose} />;
}

function SheetInner({
  trait,
  onClose,
}: {
  trait: ProfileTrait;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [portalEl] = useState(() => document.createElement("div"));
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [shown, setShown] = useState(prefersReduced);

  const headingId = `trait-sheet-title-${trait.id}`;
  const descId = `trait-sheet-desc-${trait.id}`;

  // マウント時: portal 追加 → 背景 inert → スクロールロック → フォーカス移動 → キーボード登録。
  // アンマウント時に順に復元する(複数回開閉しても状態が壊れないよう、開始前の値を保存して戻す)。
  useEffect(() => {
    const body = document.body;
    const docEl = document.documentElement;

    body.appendChild(portalEl);

    // 背景要素(portal 以外の body 直下)を inert にして、フォーカス・読み上げ対象から外す。
    const inertTargets = Array.from(body.children).filter(
      (el): el is HTMLElement => el !== portalEl && el instanceof HTMLElement,
    );
    inertTargets.forEach((el) => {
      el.setAttribute("inert", "");
      el.setAttribute("aria-hidden", "true");
    });

    // 背景スクロール抑止。スクロール位置は保持し、スクロールバー分の余白でレイアウトのズレを防ぐ。
    const prevBodyOverflow = body.style.overflow;
    const prevDocOverflow = docEl.style.overflow;
    const prevPaddingRight = body.style.paddingRight;
    const scrollbar = window.innerWidth - docEl.clientWidth;
    docEl.style.overflow = "hidden";
    body.style.overflow = "hidden";
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;

    // 開いたらシート内(閉じるボタン)へフォーカスを移す。
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeEl = document.activeElement;
      if (event.shiftKey) {
        if (activeEl === first || !panel.contains(activeEl)) {
          event.preventDefault();
          last.focus();
        }
      } else if (activeEl === last || !panel.contains(activeEl)) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      inertTargets.forEach((el) => {
        el.removeAttribute("inert");
        el.removeAttribute("aria-hidden");
      });
      docEl.style.overflow = prevDocOverflow;
      body.style.overflow = prevBodyOverflow;
      body.style.paddingRight = prevPaddingRight;
      portalEl.remove();
    };
  }, [portalEl, onClose]);

  // マウント後のフレームで「開いた状態」へ遷移して CSS transition を発火させる。
  // prefers-reduced-motion 時は初期状態から表示済みにして、アニメーションしない。
  useEffect(() => {
    if (prefersReduced) return;
    const raf = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(raf);
  }, [prefersReduced]);

  const content = (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* 背景オーバーレイ(装飾)。クリック/タップで閉じる。フォーカス・読み上げ対象にはしない。 */}
      <button
        type="button"
        aria-hidden="true"
        tabIndex={-1}
        onClick={onClose}
        className={`absolute inset-0 cursor-default bg-night-900/40 transition-opacity duration-300 motion-reduce:transition-none ${
          shown ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        aria-describedby={descId}
        style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
        className={`relative flex max-h-[90dvh] w-full flex-col rounded-t-3xl bg-white shadow-2xl transition duration-300 ease-out motion-reduce:transition-none sm:m-4 sm:max-w-md sm:rounded-3xl ${
          shown
            ? "translate-y-0 opacity-100"
            : "translate-y-full opacity-0 sm:translate-y-2"
        }`}
      >
        <div className="flex items-start justify-between gap-4 px-5 pt-5">
          <h2 id={headingId} className="text-lg font-bold text-night-900">
            {trait.label}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="-mr-1 inline-flex size-11 shrink-0 items-center justify-center rounded-full text-night-800 transition-colors hover:bg-babyblue-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deepblue-500"
          >
            <span className="sr-only">閉じる</span>
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto px-5 pt-3">
          <p id={descId} className="leading-relaxed text-night-800/90">
            {trait.detail}
          </p>
        </div>
      </div>
    </div>
  );

  return createPortal(content, portalEl);
}

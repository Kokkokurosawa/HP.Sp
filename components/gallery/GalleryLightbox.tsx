"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import type { GalleryView } from "@/content/galleryContent";

/**
 * ギャラリー画像を大きく閲覧するライトボックス(ダイアログ)。
 * モバイルは画面全体に近いオーバーレイ、デスクトップは中央ダイアログ(同一コンポーネントを CSS で適応)。
 * 背景 inert・スクロールロック・フォーカス移動/トラップ/返却・Escape・reduced-motion 即時表示に対応。
 * Sprint 12 のプロフィールダイアログと同じ原理を用いる(そちらは変更しない)。
 * 表示文字列は Server で locale 解決済み(§22): 作品(GalleryView)は title/alt を、閉じる文言は closeLabel。
 * item が null の間は何も描画しない(SSR では出力されず、操作後にクライアントでのみ表示)。
 */
export default function GalleryLightbox({
  item,
  closeLabel,
  onClose,
}: {
  item: GalleryView | null;
  closeLabel: string;
  onClose: () => void;
}) {
  if (!item) return null;
  return <LightboxInner item={item} closeLabel={closeLabel} onClose={onClose} />;
}

function LightboxInner({
  item,
  closeLabel,
  onClose,
}: {
  item: GalleryView;
  closeLabel: string;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [portalEl] = useState(() => document.createElement("div"));
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [shown, setShown] = useState(prefersReduced);

  const titleId = `gallery-lightbox-title-${item.id}`;
  const hasTitle = Boolean(item.title);

  // マウント時: portal 追加 → 背景 inert → スクロールロック → フォーカス移動 → キーボード登録。
  // アンマウント時に順に復元する(開始前の値を保存して戻す。複数回開閉しても壊れない)。
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

    // 開いたらダイアログ内(閉じるボタン)へフォーカスを移す。
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* 背景オーバーレイ(装飾)。画像の外(オーバーレイ)をクリック/タップで閉じる。 */}
      <button
        type="button"
        aria-hidden="true"
        tabIndex={-1}
        onClick={onClose}
        className={`absolute inset-0 cursor-default bg-night-900/80 transition-opacity duration-300 motion-reduce:transition-none ${
          shown ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        {...(hasTitle
          ? { "aria-labelledby": titleId }
          : { "aria-label": item.alt })}
        className={`relative z-10 flex max-h-full w-full max-w-3xl flex-col items-center gap-4 transition duration-300 ease-out motion-reduce:transition-none ${
          shown ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {/* 閉じるボタン: 画面右上(safe area 考慮)に固定。ダイアログの子なのでフォーカストラップ対象。 */}
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          style={{
            top: "max(1rem, env(safe-area-inset-top))",
            right: "max(1rem, env(safe-area-inset-right))",
          }}
          className="fixed z-20 inline-flex size-11 items-center justify-center rounded-full bg-white/90 text-night-900 shadow-md transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <span className="sr-only">{closeLabel}</span>
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

        {/* 画像: 元画像を切り取らず全体表示(object-contain)。lightbox では priority を付けない。 */}
        <Image
          src={item.src}
          alt={item.alt}
          width={1000}
          height={1000}
          sizes="(min-width: 768px) 640px, 90vw"
          className="h-auto max-h-[78vh] w-auto max-w-full rounded-lg object-contain shadow-2xl"
        />

        {hasTitle && (
          <p
            id={titleId}
            className="shrink-0 text-center text-sm font-medium text-white sm:text-base"
          >
            {item.title}
          </p>
        )}
      </div>
    </div>
  );

  return createPortal(content, portalEl);
}

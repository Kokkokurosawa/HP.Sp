"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { GalleryItem } from "@/content/gallery";

/**
 * ギャラリー 1 枚のカード。進行的強化で No-JS でも意味的に正しくする:
 * - SSR / JavaScript 無効時: 非インタラクティブな <figure>(画像 + <figcaption> のタイトル)。
 *   button は出力せず、Tab で止まらない・押せない操作要素を残さない。
 * - JavaScript 有効時(マウント後): カード全面を覆う <button> を重ね、ライトボックスを開けるようにする。
 *   要素を差し替えず「重ねる」だけなので画像は再マウントされず、初期ちらつきを最小化する。
 * SSR と初回クライアント描画は同一(button なし)なので hydration mismatch は起きない。
 * (Client Component の子として読み込まれるため、hydration 用に "use client" を付ける)
 */
export default function GalleryCard({
  item,
  onOpen,
}: {
  item: GalleryItem;
  onOpen: (item: GalleryItem, trigger: HTMLButtonElement) => void;
}) {
  // マウント後に操作可能化する(SSR / No-JS では figure のまま)。
  // effect 内で直接 setState せず rAF 経由にする(react-hooks/set-state-in-effect 回避)。
  const [interactive, setInteractive] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setInteractive(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const openLabel = `${item.title?.ja ?? item.image.alt}を大きく見る`;

  return (
    <figure className="relative m-0 flex w-full flex-col overflow-hidden rounded-2xl border border-babyblue-200 bg-white text-left">
      <span className="relative flex aspect-square items-center justify-center bg-white p-3">
        <Image
          src={item.image.src}
          alt={item.image.alt}
          width={800}
          height={800}
          loading="lazy"
          sizes="(min-width: 1024px) 300px, (min-width: 640px) 45vw, 90vw"
          className="max-h-full w-auto object-contain"
        />
      </span>

      {item.title?.ja && (
        <figcaption className="w-full border-t border-babyblue-100 px-4 py-3">
          <span className="block font-bold text-night-900">{item.title.ja}</span>
        </figcaption>
      )}

      {/* JS 有効時のみ: カード全面を覆う button。押すとライトボックスを開く。
          No-JS では出力されないため、非機能な操作要素も Tab 停止も残らない。 */}
      {interactive && (
        <button
          type="button"
          aria-haspopup="dialog"
          aria-label={openLabel}
          onClick={(event) => onOpen(item, event.currentTarget)}
          className="group absolute inset-0 flex items-end justify-end rounded-2xl p-3 transition-colors hover:bg-night-900/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deepblue-500"
        >
          {/* 拡大できる手掛かり。色だけに依存しないよう文言も添える。 */}
          <span className="pointer-events-none inline-flex items-center gap-1 rounded-full bg-night-900/70 px-2.5 py-1 text-xs font-bold text-white">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="size-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3M11 8v6M8 11h6" />
            </svg>
            大きく見る
          </span>
        </button>
      )}
    </figure>
  );
}

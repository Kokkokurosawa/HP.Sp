"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { GalleryView } from "@/content/galleryContent";

/**
 * ギャラリー 1 枚のカード。進行的強化で No-JS でも意味的に正しくする:
 * - SSR / JavaScript 無効時: 非インタラクティブな <figure>(画像 + <figcaption> のタイトル)。
 *   button は出力せず、Tab で止まらない・押せない操作要素を残さない。
 * - JavaScript 有効時(マウント後): カード全面を覆う <button> を重ね、ライトボックスを開けるようにする。
 *   要素を差し替えず「重ねる」だけなので画像は再マウントされず、初期ちらつきを最小化する。
 * SSR と初回クライアント描画は同一(button なし)なので hydration mismatch は起きない。
 * (Client Component の子として読み込まれるため、hydration 用に "use client" を付ける)
 *
 * 表示文字列は Server で locale 解決済み(§22): 作品(GalleryView)は title/alt/openLabel を持ち、
 * カードの可視ヒント文言は viewLarger prop で受け取る。
 *
 * variant による拡大ヒントの置き場所だけが差分(操作・a11y は両者共通):
 * - "default": /gallery 用。従来どおりカード下部(items-end)の右にヒントを重ねる(表示は据え置き)。
 * - "compact": トップページの小型プレビュー用。ヒントを画像領域内の右下へ置き、figcaption のタイトルと
 *   領域を分ける(小さいカードでもタイトルとヒントが重ならない)。どちらもタップ領域はカード全面の button。
 */
export default function GalleryCard({
  item,
  viewLarger,
  onOpen,
  variant = "default",
}: {
  item: GalleryView;
  viewLarger: string;
  onOpen: (item: GalleryView, trigger: HTMLButtonElement) => void;
  variant?: "default" | "compact";
}) {
  // マウント後に操作可能化する(SSR / No-JS では figure のまま)。
  // effect 内で直接 setState せず rAF 経由にする(react-hooks/set-state-in-effect 回避)。
  const [interactive, setInteractive] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setInteractive(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // 拡大できる手掛かり。色だけに依存しないよう虫めがねアイコン + 文言を添える。
  // pointer-events-none なのでクリックはカード全面の button に通る(default/compact 共通の見た目)。
  const hint = (
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
      {viewLarger}
    </span>
  );

  return (
    <figure className="relative m-0 flex w-full flex-col overflow-hidden rounded-2xl border border-babyblue-200 bg-white text-left">
      <span className="relative flex aspect-square items-center justify-center bg-white p-3">
        <Image
          src={item.src}
          alt={item.alt}
          width={800}
          height={800}
          loading="lazy"
          sizes="(min-width: 1024px) 300px, (min-width: 640px) 45vw, 90vw"
          className="max-h-full w-auto object-contain"
        />

        {/* compact: ヒントは画像領域内の右下に置く(キャプションと分離)。JS 有効時のみ。 */}
        {interactive && variant === "compact" && (
          <span className="absolute right-2 bottom-2">{hint}</span>
        )}
      </span>

      {item.title && (
        <figcaption className="w-full border-t border-babyblue-100 px-4 py-3">
          <span className="block font-bold text-night-900">{item.title}</span>
        </figcaption>
      )}

      {/* JS 有効時のみ: カード全面を覆う button。押すとライトボックスを開く。
          No-JS では出力されないため、非機能な操作要素も Tab 停止も残らない。 */}
      {interactive && (
        <button
          type="button"
          aria-haspopup="dialog"
          aria-label={item.openLabel}
          onClick={(event) => onOpen(item, event.currentTarget)}
          className="group absolute inset-0 flex items-end justify-end rounded-2xl p-3 transition-colors hover:bg-night-900/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deepblue-500"
        >
          {/* default: 従来どおりカード下部の右にヒントを重ねる。
              compact は上の画像領域内へ移したので、ここには出さない。 */}
          {variant === "default" && hint}
        </button>
      )}
    </figure>
  );
}

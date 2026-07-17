"use client";

import { useEffect, useState } from "react";
import type { ProfileTrait } from "@/content/profile";

/**
 * プロフィール項目 1 枚。GalleryCard と同じ進行的強化で No-JS でも意味的に正しくする:
 * - SSR / JavaScript 無効時: 非インタラクティブな静的カード(見出し + 要約 + 詳細全文)。
 *   button も aria-haspopup も出さず、Tab で止まらない・押せない操作要素も残らない。
 * - JavaScript 有効時(マウント後): カードを button 化し、詳細はシート(ProfileDetailSheet)で開く。
 *   詳細全文はカードから外す(シートと二重に長文表示しない)。
 * SSR と初回クライアント描画は同一(interactive=false=静的カード)なので hydration mismatch は起きない。
 * 詳細本文の定義元は content/profile.ts の trait.detail のみ(重複定義しない)。
 */
export default function ProfileTraitCard({
  trait,
  moreLabel,
  onOpen,
}: {
  trait: ProfileTrait;
  moreLabel: string;
  onOpen: (trait: ProfileTrait, trigger: HTMLButtonElement) => void;
}) {
  // マウント後に操作可能化する(SSR / No-JS では静的カードのまま)。
  // effect 内で直接 setState せず rAF 経由にする(react-hooks/set-state-in-effect 回避)。
  const [interactive, setInteractive] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setInteractive(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // 見出し(ドット + トレイト名)と要約は両状態で共通。ドットの group-hover は
  // .group を持つ button 側でのみ効き、静的カードでは常に落ち着いた色のまま。
  const header = (
    <span className="flex items-center gap-2">
      <span
        aria-hidden="true"
        className="inline-block size-2.5 shrink-0 rounded-full bg-babyblue-400 transition-colors group-hover:bg-deepblue-500"
      />
      <span className="text-base font-bold text-night-900">{trait.label}</span>
    </span>
  );
  const summary = (
    <span className="text-sm leading-relaxed text-night-800/80">
      {trait.summary}
    </span>
  );
  const cardBase =
    "flex h-full w-full flex-col items-start gap-1 rounded-3xl border border-babyblue-200 bg-white p-4 text-left sm:p-5";

  // JavaScript 有効時(マウント後): カード全体を button 化。押すとシートで詳細を開く。
  if (interactive) {
    return (
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={(event) => onOpen(trait, event.currentTarget)}
        className={`group ${cardBase} transition-colors hover:border-babyblue-400 hover:bg-babyblue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deepblue-500`}
      >
        {header}
        {summary}
        {/* ダイアログ起動の視覚的ヒント(色だけに依存しないよう文言 + 矢印)。 */}
        <span className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-deepblue-600">
          {moreLabel}
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="size-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 6l6 6-6 6" />
          </svg>
        </span>
      </button>
    );
  }

  // SSR / No-JS: 非インタラクティブな静的カード + 詳細全文(インライン)。
  // button・aria-haspopup・role・tabIndex・操作文言は付けない(押せそうに見せない)。
  return (
    <div className={cardBase}>
      {header}
      {summary}
      <p className="mt-2 w-full rounded-2xl border border-babyblue-200 bg-babyblue-50/60 p-4 text-sm leading-relaxed text-night-800/90">
        {trait.detail}
      </p>
    </div>
  );
}

import type { ProfileTrait } from "@/content/profile";

/**
 * プロフィール項目 1 枚。カード全体が button で、タップするとシートで詳細を開く。
 * No-JS 用に詳細全文(.js-trait-detail)を DOM に含める。JS 有効時は hidden(display:none)で、
 * ページ側の <noscript><style> により JS 無効時だけ表示される。
 * (Client Component の子として読み込まれるため "use client" は不要)
 */
export default function ProfileTraitCard({
  trait,
  onOpen,
}: {
  trait: ProfileTrait;
  onOpen: (trait: ProfileTrait, trigger: HTMLButtonElement) => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={(event) => onOpen(trait, event.currentTarget)}
        className="group flex h-full w-full flex-col items-start gap-1 rounded-3xl border border-babyblue-200 bg-white p-4 text-left transition-colors hover:border-babyblue-400 hover:bg-babyblue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deepblue-500 sm:p-5"
      >
        <span className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="inline-block size-2.5 shrink-0 rounded-full bg-babyblue-400 transition-colors group-hover:bg-deepblue-500"
          />
          <span className="text-base font-bold text-night-900">
            {trait.label}
          </span>
        </span>
        <span className="text-sm leading-relaxed text-night-800/80">
          {trait.summary}
        </span>
        <span className="js-trait-hint mt-1 inline-flex items-center gap-1 text-xs font-bold text-deepblue-600">
          くわしく見る
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

      {/* No-JS 時のみ表示される詳細全文。JS 有効時は hidden。 */}
      <div className="js-trait-detail hidden">
        <p className="mt-2 rounded-2xl border border-babyblue-200 bg-babyblue-50/60 p-4 text-sm leading-relaxed text-night-800/90">
          {trait.detail}
        </p>
      </div>
    </div>
  );
}

import Link from "next/link";
import type { ReactNode } from "react";

type ButtonBaseProps = {
  href: string;
  children: ReactNode;
  /** youtube は YouTube 導線専用の赤 variant。通常の主ボタンは primary(deepblue)のまま。 */
  variant?: "primary" | "secondary" | "youtube";
};

/**
 * 外部リンク(external)のときだけ sr-only 注記 externalLabel を**必須**にする判別ユニオン(Sprint 38)。
 * 内部リンク(既存の大多数)には external/externalLabel を要求しない(利用箇所を壊さない最小設計)。
 * externalLabel は locale 別の外部リンク注記(呼び出し側が辞書 accessibility.externalLinkNote から渡す)。
 */
type ButtonProps = ButtonBaseProps &
  (
    | { external: true; externalLabel: string }
    | { external?: false; externalLabel?: never }
  );

const baseClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold transition-colors duration-200 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deepblue-500 " +
  "motion-safe:transition motion-safe:active:scale-[0.97]";

const variantClass = {
  primary: "bg-deepblue-600 text-white hover:bg-deepblue-500",
  secondary:
    "border border-deepblue-600/40 bg-white text-deepblue-600 hover:bg-babyblue-50",
  youtube:
    "bg-youtube-500 text-white hover:bg-youtube-600 active:bg-youtube-700",
} as const;

export default function Button(props: ButtonProps) {
  const { href, children, variant = "primary" } = props;
  const className = `${baseClass} ${variantClass[variant]}`;

  if (props.external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {children}
        <span aria-hidden="true">↗</span>
        <span className="sr-only">{props.externalLabel}</span>
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

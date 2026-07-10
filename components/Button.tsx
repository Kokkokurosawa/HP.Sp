import Link from "next/link";
import type { ReactNode } from "react";

type ButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
  /** 外部リンクの場合は true(新しいタブで開き、外部リンクであることを明示する) */
  external?: boolean;
};

const baseClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold transition-colors duration-200 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deepblue-500 " +
  "motion-safe:transition motion-safe:active:scale-[0.97]";

const variantClass = {
  primary: "bg-deepblue-600 text-white hover:bg-deepblue-500",
  secondary:
    "border border-deepblue-600/40 bg-white text-deepblue-600 hover:bg-babyblue-50",
} as const;

export default function Button({
  href,
  children,
  variant = "primary",
  external = false,
}: ButtonProps) {
  const className = `${baseClass} ${variantClass[variant]}`;

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {children}
        <span aria-hidden="true">↗</span>
        <span className="sr-only">(外部リンク・新しいタブで開きます)</span>
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ResolvedNavItem } from "@/components/i18n/resolveNav";

type MobileMenuProps = {
  /** 解決済みナビ（URL + locale 別ラベル）。Client へは辞書全体でなくこの文字列だけを渡す。 */
  nav: ResolvedNavItem[];
  /** モバイル nav の aria-label（locale 別）。 */
  navLabel: string;
  /** メニューを開くボタンのアクセシブル名（locale 別）。 */
  openLabel: string;
  /** メニューを閉じるボタンのアクセシブル名（locale 別）。 */
  closeLabel: string;
};

export default function MobileMenu({ nav, navLabel, openLabel, closeLabel }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-deepblue-700 transition-colors hover:bg-babyblue-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deepblue-500"
      >
        <span className="sr-only">{open ? closeLabel : openLabel}</span>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" />
          )}
        </svg>
      </button>

      <div
        id="mobile-menu"
        hidden={!open}
        className="absolute inset-x-0 top-16 border-b border-babyblue-200 bg-white shadow-lg"
      >
        <nav aria-label={navLabel}>
          <ul className="flex flex-col gap-1 p-4">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center rounded-xl px-4 font-bold text-night-900 transition-colors hover:bg-babyblue-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deepblue-500"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}

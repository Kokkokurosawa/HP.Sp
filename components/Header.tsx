import Link from "next/link";
import { siteConfig } from "@/config/site";
import MobileMenu from "@/components/MobileMenu";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-babyblue-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-2 rounded-full text-lg font-bold text-deepblue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deepblue-500"
        >
          <span
            aria-hidden="true"
            className="inline-block size-4 rounded-full bg-babyblue-400"
          />
          {siteConfig.characterName}
        </Link>

        <nav aria-label="メインナビゲーション" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex min-h-11 items-center rounded-full px-4 text-sm font-bold text-night-900 transition-colors hover:bg-babyblue-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deepblue-500"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <MobileMenu />
      </div>
    </header>
  );
}

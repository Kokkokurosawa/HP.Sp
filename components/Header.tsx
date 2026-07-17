import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import MobileMenu from "@/components/MobileMenu";
import type { ResolvedNavItem } from "@/components/i18n/resolveNav";

type HeaderProps = {
  /** 解決済みナビ（locale 別 URL + locale 別ラベル）。 */
  nav: ResolvedNavItem[];
  /** デスクトップ nav の aria-label（locale 別）。 */
  navLabel: string;
  /** ロゴリンクの「ホーム」相当ラベル（locale 別。キャラ名と連結してアクセシブル名にする）。 */
  homeLabel: string;
  /** ロゴリンクの遷移先（現在 locale のトップ URL）。 */
  homeHref: string;
  /** モバイルメニュー用の文字列（Client Component へ渡す最小限）。 */
  menu: { navLabel: string; open: string; close: string };
};

export default function Header({ nav, navLabel, homeLabel, homeHref, menu }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-babyblue-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link
          href={homeHref}
          aria-label={`${siteConfig.characterName} ${homeLabel}`}
          className="inline-flex min-h-11 items-center gap-2 rounded-full text-lg font-bold text-deepblue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deepblue-500"
        >
          {/* 正式ロゴ(シンボル・背景透過)。リンク名はテキストと aria-label が担うため装飾扱い(alt="") */}
          <Image
            src="/images/supitaro/supitaro_logo_allto-ka.png"
            alt=""
            width={72}
            height={72}
            sizes="36px"
            className="size-9 object-contain"
          />
          {siteConfig.characterName}
        </Link>

        <nav aria-label={navLabel} className="hidden md:block">
          <ul className="flex items-center gap-1">
            {nav.map((item) => (
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

        <MobileMenu
          nav={nav}
          navLabel={menu.navLabel}
          openLabel={menu.open}
          closeLabel={menu.close}
        />
      </div>
    </header>
  );
}

import Image from "next/image";
import Link from "next/link";
import SocialFollowLinks from "@/components/SocialFollowLinks";
import type { ResolvedNavItem } from "@/components/i18n/resolveNav";
import type { SocialDictionary } from "@/content/i18n";

type FooterProps = {
  /** 解決済みナビ（locale 別 URL + locale 別ラベル）。 */
  nav: ResolvedNavItem[];
  /** 「サイトメニュー」見出し（footer nav の aria-labelledby 参照先。locale 別）。 */
  menuHeading: string;
  /** FOLLOW SNS リンクの accessible name（locale 別・辞書 social / Sprint 38）。 */
  social: SocialDictionary;
  /** 言語切替領域（Sprint 32）。404 など locale を持たない箇所では省略して非表示にできる。 */
  languageSwitcher?: React.ReactNode;
};

export default function Footer({ nav, menuHeading, social, languageSwitcher }: FooterProps) {
  return (
    <footer className="border-t border-babyblue-200 bg-babyblue-50">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-14">
        {/* ① PAGE TOP: #top は「文書の先頭」を指す特別なフラグメント。JS 無効でも動き、
            スムーズ/reduced-motion は globals.css の scroll-behavior に従う。 */}
        <div className="flex justify-center">
          <a
            href="#top"
            className="group inline-flex min-h-11 flex-col items-center gap-1.5 rounded-2xl px-4 py-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deepblue-500"
          >
            <span className="flex size-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-babyblue-200 motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover:-translate-y-0.5">
              <Image
                src="/images/supitaro/supitaro_icon.png"
                alt=""
                width={32}
                height={32}
                sizes="28px"
                className="size-7 object-contain"
              />
            </span>
            <span className="text-[0.65rem] font-bold tracking-[0.25em] text-deepblue-600">
              PAGE TOP
            </span>
          </a>
        </div>

        {/* ②③④ FOLLOW カード: SNS 導線はここのアイコンだけに集約(テキストリンクは重複させない)。
            アイコン・URL・aria-label は SocialFollowLinks に集約(トップページと共通)。見た目は footer variant で従来どおり。 */}
        <div className="mx-auto mt-8 max-w-xs rounded-3xl bg-white p-6 text-center shadow-sm">
          <SocialFollowLinks variant="footer" social={social} />
        </div>

        {/* サイトメニュー: モバイルの No-JS 環境ではヘッダーのメニューが使えないため、
            複数ページへの導線としてフッターに残す(SNS 導線とは役割が異なる)。 */}
        <nav aria-labelledby="footer-menu-heading" className="mx-auto mt-10 max-w-md">
          <h2
            id="footer-menu-heading"
            className="text-center text-xs font-bold tracking-wide text-night-900"
          >
            {menuHeading}
          </h2>
          <ul className="mt-3 flex flex-wrap justify-center gap-x-6 gap-y-1">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex min-h-11 items-center text-sm text-night-800/80 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deepblue-500"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* ⑥ 区切り線: 控えめな点線 */}
        <hr className="mx-auto mt-8 max-w-md border-0 border-t border-dotted border-babyblue-300" />

        {/* ⑦ 言語切替（Sprint 32）: locale を持つページでのみ表示。404 等では省略される。 */}
        {languageSwitcher}

        {/* ⑧ コピーライト */}
        <p className="mt-6 text-center text-xs text-night-800/70">© Supitaro</p>
      </div>
    </footer>
  );
}

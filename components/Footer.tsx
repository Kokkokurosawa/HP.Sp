import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";

/**
 * SNS アイコン(自作の簡素なモノクロ・グリフ。外部アイコンライブラリや公式ロゴ画像は使わず、
 * サイトの色でひかえめに描く)。currentColor で塗るのでボタン側の text 色に追従する。
 * いずれも aria-hidden で、リンク名は <a> の aria-label に委ねる。
 */
function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-5">
      <path d="M23.5 7.2a3 3 0 0 0-2.1-2.1C19.5 4.5 12 4.5 12 4.5s-7.5 0-9.4.6A3 3 0 0 0 .5 7.2 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1c.4-1.6.5-3.2.5-4.8s-.1-3.2-.5-4.8ZM9.6 15.5v-7l6.1 3.5-6.1 3.5Z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-4">
      <path d="M18.9 2h3.1l-6.8 7.8L23.2 22h-6.3l-4.9-6.4L6.3 22H3.2l7.3-8.3L2.3 2h6.5l4.4 5.9L18.9 2Zm-1.1 18h1.7L7.3 3.8H5.5L17.8 20Z" />
    </svg>
  );
}

function TwitchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-5">
      <path d="M4.3 2 2.5 6.4v13.1h4.8V22h2.6l2.6-2.5h3.9l5.1-5V2H4.3Zm14.9 11.6-2.9 2.9h-3.9l-2.5 2.5v-2.5H6.5V3.7h12.7v9.9ZM16.6 7v5.2h-1.7V7h1.7Zm-4.5 0v5.2h-1.7V7h1.7Z" />
    </svg>
  );
}

/**
 * FOLLOW カードに並べる SNS。表示順は YouTube → X → Twitch。
 * URL が空のチャンネルは除外する(空リンクを公開画面へ出さない)。
 * 将来チャンネルが増えても、config に URL を入れてここに 1 行足すだけで並ぶ。
 */
const socialLinks = [
  {
    label: "YouTube",
    ariaLabel: "YouTubeで配信を見る(外部リンク・新しいタブで開きます)",
    href: siteConfig.channels.youtube,
    Icon: YouTubeIcon,
  },
  {
    label: "X",
    ariaLabel: "Xで活動を追う(外部リンク・新しいタブで開きます)",
    href: siteConfig.channels.x,
    Icon: XIcon,
  },
  {
    label: "Twitch",
    ariaLabel: "Twitchで配信を見る(外部リンク・新しいタブで開きます)",
    href: siteConfig.channels.twitch,
    Icon: TwitchIcon,
  },
].filter((social) => social.href);

export default function Footer() {
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
                src="/images/supitaro/supitaro-temporary-main.svg"
                alt=""
                width={32}
                height={32}
                className="size-7"
              />
            </span>
            <span className="text-[0.65rem] font-bold tracking-[0.25em] text-deepblue-600">
              PAGE TOP
            </span>
          </a>
        </div>

        {/* ②③④ FOLLOW カード: SNS 導線はここのアイコンだけに集約(テキストリンクは重複させない)。
            aria-label で名前と目的を伝える。 */}
        <div className="mx-auto mt-8 max-w-xs rounded-3xl bg-white p-6 text-center shadow-sm">
          <h2 className="text-xs font-bold tracking-[0.3em] text-deepblue-600">
            FOLLOW
          </h2>
          <ul className="mt-4 flex justify-center gap-4">
            {socialLinks.map(({ label, ariaLabel, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={ariaLabel}
                  className="flex size-11 items-center justify-center rounded-full bg-babyblue-100 text-deepblue-600 hover:bg-babyblue-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deepblue-500 motion-safe:transition motion-safe:duration-200 motion-safe:hover:scale-110"
                >
                  <Icon />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* サイトメニュー: モバイルの No-JS 環境ではヘッダーのメニューが使えないため、
            複数ページへの導線としてフッターに残す(SNS 導線とは役割が異なる)。 */}
        <nav aria-labelledby="footer-menu-heading" className="mx-auto mt-10 max-w-md">
          <h2
            id="footer-menu-heading"
            className="text-center text-xs font-bold tracking-wide text-night-900"
          >
            サイトメニュー
          </h2>
          <ul className="mt-3 flex flex-wrap justify-center gap-x-6 gap-y-1">
            {siteConfig.nav.map((item) => (
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

        {/* ⑦ コピーライト: 将来 Privacy Policy / Terms / Language を足せる余白を残す */}
        <p className="mt-6 text-center text-xs text-night-800/70">© Supitaro</p>
      </div>
    </footer>
  );
}

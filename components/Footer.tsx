import Link from "next/link";
import { siteConfig } from "@/config/site";

// URL が空のチャンネルは除外する(空リンク・準備中表記を公開画面へ出さない)。
// twitch は現状空文字なので表示されない。正式 URL を config へ設定すれば自動で並ぶ。
const footerChannels = [
  { label: "YouTube", href: siteConfig.channels.youtube },
  { label: "X", href: siteConfig.channels.x },
  { label: "Twitch", href: siteConfig.channels.twitch },
].filter((channel) => channel.href);

export default function Footer() {
  return (
    <footer className="bg-night-900 text-babyblue-100">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row md:items-start md:justify-between">
        <p className="flex items-center gap-2 text-lg font-bold">
          <span
            aria-hidden="true"
            className="inline-block size-4 rounded-full bg-babyblue-400"
          />
          {siteConfig.characterName}
        </p>

        <nav aria-label="フッターナビゲーション">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex min-h-11 items-center text-sm text-babyblue-100 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-babyblue-300"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {footerChannels.map((channel) => (
            <li key={channel.label}>
              <a
                href={channel.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-1 text-sm text-babyblue-100 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-babyblue-300"
              >
                {channel.label}
                <span aria-hidden="true">↗</span>
                <span className="sr-only">
                  (外部リンク・新しいタブで開きます)
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
      <p className="border-t border-babyblue-100/10 px-4 py-4 text-center text-xs text-babyblue-100/60">
        © {siteConfig.siteName}
      </p>
    </footer>
  );
}

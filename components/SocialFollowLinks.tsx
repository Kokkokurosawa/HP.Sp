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
 * FOLLOW に並べる SNS。表示順は YouTube → X → Twitch。
 * URL が空のチャンネルは除外する(空リンクを公開画面へ出さない)。
 * URL・アクセシブル名・アイコンの唯一の定義元。将来チャンネルが増えても config に URL を入れて
 * ここに 1 行足すだけで、Footer とトップページの両方に同時に並ぶ(表示ごとの重複定義をしない)。
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

/**
 * 見た目の調整点は配置場所ごとに変える。ここが唯一の差分で、リンク動作/データ/アイコンは共通。
 * - footer: これまでの Footer の FOLLOW と同一の見た目(44px アイコン)。
 * - section: トップページ用に少し大きく(48px)して、Footer より目立つが CTA より強くならない程度。
 * どちらも操作領域 44px 以上・focus-visible・外部リンク属性・reduced-motion 配慮を保つ。
 */
const variantStyles = {
  footer: {
    heading: "text-xs font-bold tracking-[0.3em] text-deepblue-600",
    list: "mt-4 flex justify-center gap-4",
    link: "flex size-11 items-center justify-center rounded-full bg-babyblue-100 text-deepblue-600 hover:bg-babyblue-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deepblue-500 motion-safe:transition motion-safe:duration-200 motion-safe:hover:scale-110",
  },
  section: {
    heading: "text-sm font-bold tracking-[0.3em] text-deepblue-600",
    list: "mt-5 flex justify-center gap-5",
    link: "flex size-12 items-center justify-center rounded-full bg-babyblue-100 text-deepblue-600 hover:bg-babyblue-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deepblue-500 motion-safe:transition motion-safe:duration-200 motion-safe:hover:scale-110",
  },
} as const;

/**
 * FOLLOW の見出し + SNS アイコン列。Footer とトップページの 2 か所で再利用する小さな共通部品。
 * 純粋な静的出力(外側の囲みは呼び出し側に委ねる)なので Server Component のまま = No-JS でも機能する。
 * @param headingId section で <section aria-labelledby> から参照する場合に渡す(footer では省略)。
 */
export default function SocialFollowLinks({
  variant = "footer",
  headingId,
}: {
  variant?: "section" | "footer";
  headingId?: string;
}) {
  const styles = variantStyles[variant];
  return (
    <>
      <h2 id={headingId} className={styles.heading}>
        FOLLOW
      </h2>
      <ul className={styles.list}>
        {socialLinks.map(({ label, ariaLabel, href, Icon }) => (
          <li key={label}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={ariaLabel}
              className={styles.link}
            >
              <Icon />
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}

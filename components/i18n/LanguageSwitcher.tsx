import Link from "next/link";
import { getDictionary } from "@/content/i18n";
import { locales, type Locale } from "@/lib/i18n/locales";
import { languageSwitchTarget, type RouteKey } from "@/lib/i18n/routes";

/**
 * Footer の言語切替（Sprint 32）。Server Component・No-JS 前提（素の `<a>`／`<Link>` 実遷移）。
 * - 5 locale を各言語の自称表記（language.name）で表示。内部 locale ID は出さない。
 * - 切替先は現在 route の対象 locale URL。外国語 News は存在しないため各外国語トップへ（§7・§8）。
 * - 現在 locale はリンクにせず `aria-current="page"` の非リンクテキスト（§10）。
 * - aria-label（「言語」等）は現在 locale の辞書から渡される（locale 別）。
 */
export default function LanguageSwitcher({
  locale,
  routeKey,
  label,
}: {
  locale: Locale;
  routeKey: RouteKey;
  label: string;
}) {
  return (
    <nav aria-label={label} className="mt-6">
      <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1">
        {locales.map((l) => {
          // 言語名は各言語の自称表記（対象 locale 辞書の language.name）。
          const name = getDictionary(l).language.name;
          if (l === locale) {
            return (
              <li key={l}>
                <span
                  aria-current="page"
                  className="inline-flex min-h-11 items-center text-sm font-bold text-deepblue-700"
                >
                  {name}
                </span>
              </li>
            );
          }
          return (
            <li key={l}>
              <Link
                href={languageSwitchTarget(routeKey, l)}
                className="inline-flex min-h-11 items-center text-sm text-night-800/80 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deepblue-500"
              >
                {name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import SectionHeading from "@/components/SectionHeading";
import ProfileTraitGrid from "@/components/profile/ProfileTraitGrid";
import SiteShell from "@/components/i18n/SiteShell";
import { getProfile, type ProfilePageContent } from "@/content/profileContent";
import { getPageMetadata } from "@/content/seoMetadata";
import { siteConfig } from "@/config/site";
import { isLocale, locales } from "@/lib/i18n/locales";

export const dynamicParams = false;
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// locale 別 title/description（Sprint 40・content/seoMetadata.ts）。title は absolute で root template を
// 適用しない。ja は既存の最終出力（`プロフィール | すぴたろう公式サイト` ＋ description）を byte 一致で維持。
// 外国語は正式翻訳済みだが多言語 SEO 公開が未完成のため引き続き noindex（Sprint 34 §19・解除は Sprint 42）。
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = getPageMetadata(locale, "profile");
  const base: Metadata = { title: { absolute: copy.title }, description: copy.description };
  return locale === "ja" ? base : { ...base, robots: { index: false, follow: false } };
}

/**
 * プロフィールページ本文（全 locale 共通構造・content は locale 別）。
 * 日本語トップと同じく、日本語は従来と同一の描画（文言・順序・デザイン・操作不変）。
 * ja の name/intro/traits/words/upcoming は content/profile.ts、画像 alt は siteConfig を参照した値。
 */
function ProfileBody({ content }: { content: ProfilePageContent }) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-2xl font-bold text-night-900 sm:text-3xl">
        {content.pageTitle}
      </h1>

      <div className="mt-10 flex flex-col gap-10 md:flex-row md:items-start">
        {/* キャラクター画像(未確定の間はプレースホルダー)。差し替え手順は docs/character-image-guidelines.md */}
        {siteConfig.images.profile.src ? (
          <div className="mx-auto shrink-0 text-center md:mx-0">
            <Image
              src={siteConfig.images.profile.src}
              alt={content.imageAlt || siteConfig.characterName}
              width={560}
              height={560}
              sizes="224px"
              className="size-56 object-contain"
            />
            {siteConfig.images.profile.notice && (
              <p className="mt-2 text-xs text-night-800/70">
                {siteConfig.images.profile.notice}
              </p>
            )}
          </div>
        ) : (
          <div
            role="img"
            aria-label="すぴたろうのプロフィール画像(画像準備中)"
            className="mx-auto flex size-56 shrink-0 flex-col items-center justify-center gap-2 rounded-full border-2 border-dashed border-babyblue-400 bg-babyblue-50 text-center md:mx-0"
          >
            <span
              aria-hidden="true"
              className="inline-block size-8 rounded-full bg-babyblue-200"
            />
            <span aria-hidden="true" className="text-xs text-deepblue-600">
              画像準備中
            </span>
          </div>
        )}

        <div className="min-w-0 flex-1 space-y-12">
          <section aria-labelledby="profile-basic-heading">
            <SectionHeading id="profile-basic-heading">
              {content.name}
            </SectionHeading>
            <div className="mt-4 space-y-1 leading-loose text-night-800/90">
              {content.intro.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </section>

          <section aria-labelledby="profile-traits-heading">
            <SectionHeading id="profile-traits-heading">
              {content.traits.heading}
            </SectionHeading>
            <p className="mt-4 text-sm leading-relaxed text-night-800/70">
              {content.traits.lead}
            </p>
            {/* 各カードは進行的強化(ProfileTraitCard): No-JS では詳細全文を含む静的カード、
                JS 有効時に button 化してシートで詳細を開く。noscript 用の CSS 切替は不要。 */}
            <ProfileTraitGrid
              traits={content.traits.items}
              moreLabel={content.traits.moreLabel}
              closeLabel={content.traits.closeLabel}
            />
          </section>

          <section aria-labelledby="profile-words-heading">
            <SectionHeading id="profile-words-heading">
              {content.words.heading}
            </SectionHeading>
            <p className="mt-4 text-sm leading-relaxed text-night-800/70">
              {content.words.lead}
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {content.words.items.map((word) => (
                <li
                  key={word}
                  className="rounded-full bg-babyblue-100 px-4 py-2 font-bold text-deepblue-700"
                >
                  {word}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="profile-upcoming-heading">
            <SectionHeading id="profile-upcoming-heading">
              {content.upcoming.heading}
            </SectionHeading>
            {content.upcoming.items.length > 0 ? (
              <ul className="mt-4 space-y-2 leading-relaxed text-night-800/90">
                {content.upcoming.items.map((entry) => (
                  <li key={entry}>{entry}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 rounded-2xl border border-dashed border-babyblue-300 bg-babyblue-50/50 p-5 text-sm text-night-800/70">
                {content.upcoming.emptyNotice}
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <SiteShell locale={locale} routeKey="profile">
      <ProfileBody content={getProfile(locale)} />
    </SiteShell>
  );
}

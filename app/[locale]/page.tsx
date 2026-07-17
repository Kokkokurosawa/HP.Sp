import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Button from "@/components/Button";
import ChannelLinks from "@/components/ChannelLinks";
import CharacterIntroduction from "@/components/CharacterIntroduction";
import ContentCard from "@/components/ContentCard";
import FadeIn from "@/components/FadeIn";
import Hero from "@/components/Hero";
import HomeGallerySection from "@/components/home/HomeGallerySection";
import SectionHeading from "@/components/SectionHeading";
import SocialFollowLinks from "@/components/SocialFollowLinks";
import SiteShell from "@/components/i18n/SiteShell";
import { getDictionary } from "@/content/i18n";
import { getGalleryContent } from "@/content/galleryContent";
import { getPageMetadata } from "@/content/seoMetadata";
import { getLatestNews } from "@/content/news";
import { getTopPage, type TopPageContent } from "@/content/topPage";
import { isLocale, locales, type Locale } from "@/lib/i18n/locales";
import { localizedPath } from "@/lib/i18n/routes";

export const dynamicParams = false;
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// locale 別 title/description（Sprint 40・content/seoMetadata.ts）。title は absolute で root template を
// 適用しない（外国語に日本語ブランドを付けない）。ja は既存の最終出力を byte 一致で維持。
// 外国語は正式翻訳済みだが、サイト全体の多言語 SEO 公開（canonical・hreflang・sitemap 等）が未完成のため
// 引き続き noindex（Sprint 33 §18・解除は Sprint 42）。canonical/hreflang/OG は本 Sprint 非実装（Sprint 41）。
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = getPageMetadata(locale, "top");
  const base: Metadata = { title: { absolute: copy.title }, description: copy.description };
  return locale === "ja" ? base : { ...base, robots: { index: false, follow: false } };
}

/**
 * トップページ本文（全 locale 共通構造・text は locale 別）。
 * Gallery プレビューは全 locale で表示（Sprint 35 で外国語 Gallery を翻訳・D-E で再表示）。
 * News セクションは日本語のみ（D-C: 外国語では非表示）。
 * 日本語トップは従来と同一の描画（文言・順序・デザイン不変）。
 */
function TopPageBody({ locale, text }: { locale: Locale; text: TopPageContent }) {
  const profileHref = localizedPath(locale, "profile");
  const showJapaneseOnlySections = locale === "ja";
  const gallery = getGalleryContent(locale);
  const dict = getDictionary(locale);
  const latestNews = showJapaneseOnlySections ? getLatestNews(3) : [];

  // 訪問者の自然な流れ: まずデザインを見せる(ギャラリー) → キャラを知る(すぴたろうって)
  // → フォローする(FOLLOW) → 配信を見る(チャンネル) → お知らせ。
  return (
    <>
      <Hero
        text={text.hero}
        profileHref={profileHref}
        externalLinkNote={dict.accessibility.externalLinkNote}
      />

      {/* デザインギャラリーのプレビュー。公開作品が無ければ描画しない（全 locale・見出し等は現在 locale）。 */}
      {gallery.items.length > 0 && (
        <FadeIn>
          <HomeGallerySection
            items={gallery.items}
            heading={gallery.strings.preview.heading}
            lead={gallery.strings.preview.lead}
            cta={gallery.strings.preview.cta}
            galleryHref={localizedPath(locale, "gallery")}
            viewLarger={gallery.strings.viewLarger}
            closeLabel={gallery.strings.closeLabel}
          />
        </FadeIn>
      )}

      <FadeIn>
        <CharacterIntroduction text={text.intro} profileHref={profileHref} />
      </FadeIn>

      {/* FOLLOW 導線。Footer と同じ SocialFollowLinks を section variant で使う（共通 UI・aria は共通 UI 校正 Sprint）。 */}
      <FadeIn>
        <section
          aria-labelledby="home-follow-heading"
          className="mx-auto max-w-5xl px-4 pb-12 text-center sm:px-6"
        >
          <SocialFollowLinks
            variant="section"
            headingId="home-follow-heading"
            social={dict.social}
          />
        </section>
      </FadeIn>

      <FadeIn>
        <ChannelLinks
          text={text.channels}
          externalLinkNote={dict.accessibility.externalLinkNote}
        />
      </FadeIn>

      {/* News は日本語のみ（D-C: 外国語トップでは非表示。外国語 News ルートは 404 契約）。 */}
      {showJapaneseOnlySections && (
        <FadeIn>
          <section
            aria-labelledby="news-heading"
            className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16"
          >
            <SectionHeading id="news-heading">お知らせ</SectionHeading>
            <div className="mt-6 grid gap-4">
              {latestNews.map((item) => (
                <ContentCard key={item.id} item={item} />
              ))}
            </div>
            <div className="mt-8">
              <Button href="/news" variant="secondary">
                お知らせ一覧へ
              </Button>
            </div>
          </section>
        </FadeIn>
      )}
    </>
  );
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <SiteShell locale={locale} routeKey="home">
      <TopPageBody locale={locale} text={getTopPage(locale)} />
    </SiteShell>
  );
}

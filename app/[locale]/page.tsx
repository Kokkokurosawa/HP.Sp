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
import { getPublishedGalleryItems } from "@/content/gallery";
import { getLatestNews } from "@/content/news";
import { getTopPage, type TopPageContent } from "@/content/topPage";
import { isLocale, locales, type Locale } from "@/lib/i18n/locales";
import { localizedPath } from "@/lib/i18n/routes";

export const dynamicParams = false;
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// 外国語トップは正式翻訳済みだが、サイト全体の多言語公開（プロフィール/ギャラリー本文・言語別 metadata・
// canonical・hreflang 等）が未完成のため引き続き noindex（Sprint 33 §18）。ja は既定挙動。
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return locale === "ja" ? {} : { robots: { index: false, follow: false } };
}

/**
 * トップページ本文（全 locale 共通構造・text は locale 別）。
 * 日本語のみ Gallery プレビューと News セクションを表示する（D-D/D-C: 外国語では非表示）。
 * 日本語トップは従来と同一の描画（文言・順序・デザイン不変）。
 */
function TopPageBody({ locale, text }: { locale: Locale; text: TopPageContent }) {
  const profileHref = localizedPath(locale, "profile");
  const showJapaneseOnlySections = locale === "ja";
  const galleryItems = showJapaneseOnlySections ? getPublishedGalleryItems() : [];
  const latestNews = showJapaneseOnlySections ? getLatestNews(3) : [];

  // 訪問者の自然な流れ: まずデザインを見せる(ギャラリー) → キャラを知る(すぴたろうって)
  // → フォローする(FOLLOW) → 配信を見る(チャンネル) → お知らせ。
  return (
    <>
      <Hero text={text.hero} profileHref={profileHref} />

      {/* デザインギャラリーのプレビュー。公開作品が無ければ描画しない。外国語は Sprint 35 まで非表示。 */}
      {galleryItems.length > 0 && (
        <FadeIn>
          <HomeGallerySection items={galleryItems} />
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
          <SocialFollowLinks variant="section" headingId="home-follow-heading" />
        </section>
      </FadeIn>

      <FadeIn>
        <ChannelLinks text={text.channels} />
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

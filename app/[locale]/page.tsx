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
import LocaleScaffold from "@/components/i18n/LocaleScaffold";
import { getPublishedGalleryItems } from "@/content/gallery";
import { getLatestNews } from "@/content/news";
import { isLocale, locales } from "@/lib/i18n/locales";

export const dynamicParams = false;
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// 外国語ページは基盤確認用スカフォールドのため noindex（検索対象にしない）。ja は既定挙動。
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return locale === "ja" ? {} : { robots: { index: false, follow: false } };
}

// 日本語トップ（既存 app/page.tsx の内容をそのまま）。
function JapaneseHome() {
  const latestNews = getLatestNews(3);
  const galleryItems = getPublishedGalleryItems();

  // 訪問者の自然な流れ: まずデザインを見せる(ギャラリー) → キャラを知る(すぴたろうって)
  // → フォローする(FOLLOW) → 配信を見る(チャンネル) → お知らせ。
  return (
    <>
      <Hero />

      {/* デザインギャラリーのプレビュー(小さめのカード)を Hero 直下に置く。公開作品が無ければセクションごと描画しない。 */}
      {galleryItems.length > 0 && (
        <FadeIn>
          <HomeGallerySection items={galleryItems} />
        </FadeIn>
      )}

      <FadeIn>
        <CharacterIntroduction />
      </FadeIn>

      {/* 「すぴたろうって」の直後に FOLLOW 導線。Footer と同じ SocialFollowLinks を section variant で使い、
          URL・ラベル・アイコンをトップページへ重複直書きしない。Footer より少し目立つが CTA より弱い見た目。 */}
      <FadeIn>
        <section
          aria-labelledby="home-follow-heading"
          className="mx-auto max-w-5xl px-4 pb-12 text-center sm:px-6"
        >
          <SocialFollowLinks variant="section" headingId="home-follow-heading" />
        </section>
      </FadeIn>

      <FadeIn>
        <ChannelLinks />
      </FadeIn>

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
  if (locale === "ja") return <JapaneseHome />;
  return <LocaleScaffold locale={locale} />;
}

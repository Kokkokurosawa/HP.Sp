import Button from "@/components/Button";
import ChannelLinks from "@/components/ChannelLinks";
import CharacterIntroduction from "@/components/CharacterIntroduction";
import ContentCard from "@/components/ContentCard";
import FadeIn from "@/components/FadeIn";
import Hero from "@/components/Hero";
import HomeGallerySection from "@/components/home/HomeGallerySection";
import SectionHeading from "@/components/SectionHeading";
import SocialFollowLinks from "@/components/SocialFollowLinks";
import { getPublishedGalleryItems } from "@/content/gallery";
import { getLatestNews } from "@/content/news";

export default function HomePage() {
  const latestNews = getLatestNews(3);
  const galleryItems = getPublishedGalleryItems();

  // 訪問者の自然な流れ: キャラを知る(すぴたろうって) → フォローする(FOLLOW)
  // → デザインを見る(ギャラリー) → 配信を見る(チャンネル) → お知らせ。
  return (
    <>
      <Hero />

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

      {/* デザインギャラリーのプレビュー(小さめのカード)。公開作品が無ければセクションごと描画しない。 */}
      {galleryItems.length > 0 && (
        <FadeIn>
          <HomeGallerySection items={galleryItems} />
        </FadeIn>
      )}

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

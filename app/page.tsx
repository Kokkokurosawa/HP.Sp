import Button from "@/components/Button";
import ChannelLinks from "@/components/ChannelLinks";
import CharacterIntroduction from "@/components/CharacterIntroduction";
import ContentCard from "@/components/ContentCard";
import FadeIn from "@/components/FadeIn";
import Hero from "@/components/Hero";
import SectionHeading from "@/components/SectionHeading";
import { getLatestNews } from "@/content/news";

export default function HomePage() {
  const latestNews = getLatestNews(3);

  return (
    <>
      <Hero />

      <FadeIn>
        <CharacterIntroduction />
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

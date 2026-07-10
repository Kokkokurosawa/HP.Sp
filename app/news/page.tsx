import type { Metadata } from "next";
import ContentCard from "@/components/ContentCard";
import { getAllNews } from "@/content/news";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "お知らせ",
  description: `${siteConfig.characterName}に関するお知らせの一覧です。`,
};

export default function NewsPage() {
  const news = getAllNews();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-2xl font-bold text-night-900 sm:text-3xl">
        お知らせ
      </h1>

      {news.length > 0 ? (
        <div className="mt-8 grid gap-4">
          {news.map((item) => (
            <ContentCard key={item.id} item={item} headingLevel="h2" />
          ))}
        </div>
      ) : (
        <p className="mt-8 rounded-2xl border border-dashed border-babyblue-300 bg-babyblue-50/50 p-5 text-sm text-night-800/70">
          お知らせはまだありません。
        </p>
      )}
    </div>
  );
}

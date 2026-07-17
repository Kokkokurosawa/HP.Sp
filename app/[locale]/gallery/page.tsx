import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GalleryEmptyState from "@/components/gallery/GalleryEmptyState";
import GalleryGrid from "@/components/gallery/GalleryGrid";
import LocaleScaffold from "@/components/i18n/LocaleScaffold";
import { getPublishedGalleryItems } from "@/content/gallery";
import { siteConfig } from "@/config/site";
import { isLocale, locales } from "@/lib/i18n/locales";

export const dynamicParams = false;
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (locale === "ja") {
    return {
      title: "ギャラリー",
      description: `${siteConfig.characterName}のイラストギャラリー。準備ができ次第、すこしずつ公開していきます。`,
    };
  }
  return { robots: { index: false, follow: false } };
}

// 日本語ギャラリー（既存 app/gallery/page.tsx の内容をそのまま）。
function JapaneseGallery() {
  const items = getPublishedGalleryItems();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-2xl font-bold text-night-900 sm:text-3xl">ギャラリー</h1>
      <p className="mt-4 leading-relaxed text-night-800/80">
        すぴたろうたちのイラストを集めていく場所です。公開が承認された画像だけを、すこしずつ追加していきます。
      </p>

      {items.length > 0 ? (
        <GalleryGrid items={items} />
      ) : (
        <GalleryEmptyState />
      )}
    </div>
  );
}

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  if (locale === "ja") return <JapaneseGallery />;
  return <LocaleScaffold locale={locale} />;
}

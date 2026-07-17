import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GalleryEmptyState from "@/components/gallery/GalleryEmptyState";
import GalleryGrid from "@/components/gallery/GalleryGrid";
import SiteShell from "@/components/i18n/SiteShell";
import { getGalleryContent } from "@/content/galleryContent";
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
  // 外国語 Gallery は正式翻訳済みだが、サイト全体の多言語公開が未完成のため noindex 維持（Sprint 35 §20）。
  return { robots: { index: false, follow: false } };
}

// 全 locale 共通構造・text は locale 別（ja は既存表示と byte 一致・作品数/順序/画像/操作は不変）。
export default async function GalleryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { strings, items } = getGalleryContent(locale);

  return (
    <SiteShell locale={locale} routeKey="gallery">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-2xl font-bold text-night-900 sm:text-3xl">
          {strings.pageTitle}
        </h1>
        <p className="mt-4 leading-relaxed text-night-800/80">{strings.lead}</p>

        {items.length > 0 ? (
          <GalleryGrid
            items={items}
            viewLarger={strings.viewLarger}
            closeLabel={strings.closeLabel}
          />
        ) : (
          <GalleryEmptyState />
        )}
      </div>
    </SiteShell>
  );
}

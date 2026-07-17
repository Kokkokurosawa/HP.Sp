import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GalleryEmptyState from "@/components/gallery/GalleryEmptyState";
import GalleryGrid from "@/components/gallery/GalleryGrid";
import SiteShell from "@/components/i18n/SiteShell";
import { getGalleryContent } from "@/content/galleryContent";
import { getPageMetadata } from "@/content/seoMetadata";
import { isLocale, locales } from "@/lib/i18n/locales";

export const dynamicParams = false;
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// locale 別 title/description（Sprint 40・content/seoMetadata.ts）。title は absolute で root template を
// 適用しない。ja は既存の最終出力（`ギャラリー | すぴたろう公式サイト` ＋ description）を byte 一致で維持。
// 外国語 Gallery は正式翻訳済みだが多言語 SEO 公開が未完成のため noindex 維持（Sprint 35 §20・解除は Sprint 42）。
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = getPageMetadata(locale, "gallery");
  const base: Metadata = { title: { absolute: copy.title }, description: copy.description };
  return locale === "ja" ? base : { ...base, robots: { index: false, follow: false } };
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

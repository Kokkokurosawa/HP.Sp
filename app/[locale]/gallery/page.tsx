import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GalleryEmptyState from "@/components/gallery/GalleryEmptyState";
import GalleryGrid from "@/components/gallery/GalleryGrid";
import SiteShell from "@/components/i18n/SiteShell";
import { getGalleryContent } from "@/content/galleryContent";
import { buildLocalizedPageMetadata } from "@/lib/seo/metadata";
import { isLocale, locales } from "@/lib/i18n/locales";

export const dynamicParams = false;
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// locale 別 metadata（Sprint 41）。canonical/hreflang/OG/twitter を含め buildLocalizedPageMetadata で組み立てる。
// 外国語 Gallery は引き続き noindex（Sprint 35 §20・解除は Sprint 42）。ja は indexable・最終 title/description は byte 一致。
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildLocalizedPageMetadata(locale, "gallery");
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

import type { Metadata } from "next";
import GalleryEmptyState from "@/components/gallery/GalleryEmptyState";
import GalleryGrid from "@/components/gallery/GalleryGrid";
import { getPublishedGalleryItems } from "@/content/gallery";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "ギャラリー",
  description: `${siteConfig.characterName}のイラストギャラリー。準備ができ次第、すこしずつ公開していきます。`,
};

export default function GalleryPage() {
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

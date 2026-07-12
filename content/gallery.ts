import type { SiteImage } from "@/config/site";

/** 多言語テキスト。en は将来の英語対応まで任意(勝手に英訳を作らない)。 */
export type LocalizedText = {
  ja: string;
  en?: string;
};

/**
 * ギャラリー 1 点の公開表示データ。
 * 権利情報や素材台帳は Obsidian 側で管理し、ここには公開表示に必要な最小限だけ持つ
 * (素材台帳=Obsidian / 公開表示データ=repo、という境界を保つ)。
 * 画像は既存の SiteImage 型(src / alt)を再利用する。
 */
export type GalleryItem = {
  id: string;
  /** 現在は "supitaro" のみ。将来キャラが増えたら追加する(架空キャラは登録しない)。 */
  characterSlug: string;
  image: SiteImage;
  title?: LocalizedText;
  description?: LocalizedText;
  category?: string;
  /** "YYYY-MM-DD" */
  publishedAt?: string;
  isPublished: boolean;
};

/**
 * 公開ギャラリー画像。Approved な正式画像だけを登録する。
 * - ダミー・仮画像・外部 URL 画像は入れない。
 * - 追加手順は docs/gallery-content-guidelines.md を参照。
 * - 公開されるのは isPublished === true の項目だけ(getPublishedGalleryItems)。
 */
export const galleryItems: GalleryItem[] = [
  {
    // ファイル名の語幹と一致させた安定 ID。画像はユーザーがコミットした正式素材。
    id: "supitaro-design-art-v1",
    characterSlug: "supitaro",
    image: {
      src: "/images/supitaro/supitaro-design-art-v1.png",
      alt: "星や惑星に囲まれて立つ、すぴたろうのデザインアート。白い体に青い目、額の青いひし形、青い耳と尻尾。",
    },
    title: { ja: "すぴたろう デザインアート" },
    publishedAt: "2026-07-13",
    isPublished: true,
  },
];

/** 公開対象(isPublished === true)だけを返す。 */
export function getPublishedGalleryItems(): GalleryItem[] {
  return galleryItems.filter((item) => item.isPublished);
}

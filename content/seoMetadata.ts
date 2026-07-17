/**
 * ページ別 metadata（title / description）の編集コンテンツ（5 locale）。Sprint 40。
 *
 * - UI 定型文（content/i18n の辞書）でも本文（topPage/profileContent/galleryContent）でもない、
 *   **SEO 用の title/description** だけを持つ専用モデル（Sprint 40 D-E=Option B）。
 * - 対象は top / profile / gallery の 3 ページ（News は ja のみ・404 はグローバル日本語で対象外）。
 * - `title` は各ページの **最終 <title> 文字列（絶対値）**。generateMetadata は `title:{ absolute }` で返し、
 *   root の title.template（`%s | すぴたろう公式サイト`）による日本語ブランド付加を防ぐ（D-C/D-D=absolute title）。
 * - 日本語（ja）は既存の最終出力を **byte 一致で再現**するため、siteConfig / profile を参照して構成する
 *   （Option B の二重定義回避と同方針。値そのものは Sprint 40 で変更しない）。
 * - 外国語は Sprint 40 で人間承認済みの正式訳（名称は全外国語で `Supitaro`＝D-B）。
 * - `getPageMetadata` は未知 locale を受け付けず、日本語への黙示 fallback もしない（型で 5 locale × 3 page 網羅）。
 * - openGraph / twitter の locale 化は本 Sprint 対象外（Sprint 41 で og:locale/url と一括是正）。
 */
import { siteConfig } from "@/config/site";
import { profile } from "@/content/profile";
import type { Locale } from "@/lib/i18n/locales";

/** metadata を持つページの識別子（任意文字列にしない）。 */
export type PageMetadataKey = "top" | "profile" | "gallery";

/** 1 ページ分の SEO 文言（最終 title 絶対値 ＋ meta description）。 */
export type PageMetadataCopy = {
  /** ブラウザ最終 <title>（絶対値・root template を適用しない）。 */
  title: string;
  /** meta[name="description"]。 */
  description: string;
};

/** 1 locale 分の 3 ページ metadata（top/profile/gallery すべて必須）。 */
export type LocalizedPageMetadata = Record<PageMetadataKey, PageMetadataCopy>;

/**
 * 日本語＝正本。既存の最終出力（root default / template 適用後）を byte 一致で再現する。
 * - top.title    = siteConfig.siteName（現行 root default）。
 * - profile.title = `プロフィール | ${siteName}`（現行 `プロフィール`＋template）。
 * - gallery.title = `ギャラリー | ${siteName}`（現行 `ギャラリー`＋template）。
 * - description は現行 generateMetadata と同一式（characterName / profile.intro を参照）。
 */
const ja: LocalizedPageMetadata = {
  top: {
    title: siteConfig.siteName,
    description: siteConfig.description,
  },
  profile: {
    title: `プロフィール | ${siteConfig.siteName}`,
    description: `${siteConfig.characterName}のプロフィール。${profile.intro.join("")}`,
  },
  gallery: {
    title: `ギャラリー | ${siteConfig.siteName}`,
    description: `${siteConfig.characterName}のイラストギャラリー。準備ができ次第、すこしずつ公開していきます。`,
  },
};

/** English（Sprint 40 人間承認済み）。title は absolute（`Page | Supitaro` / top は brand-led）。 */
const en: LocalizedPageMetadata = {
  top: {
    title: "Supitaro — A Mysterious Creature from Outer Space",
    description:
      "Official site of Supitaro, a mysterious creature from outer space that loves round things and secretly streams games. Explore the profile and gallery.",
  },
  profile: {
    title: "Profile | Supitaro",
    description:
      "Get to know Supitaro, a mysterious creature from outer space that loves round things and secretly streams games while the homeowner is away.",
  },
  gallery: {
    title: "Gallery | Supitaro",
    description:
      "An illustration gallery of Supitaro and friends. New artwork is shared little by little as it becomes ready.",
  },
};

/** 简体中文（Sprint 40 人间承认済み・简体字のみ・画廊）。 */
const zhHans: LocalizedPageMetadata = {
  top: {
    title: "Supitaro — 来自宇宙的奇妙生物",
    description:
      "Supitaro 的官方网站。来自宇宙的奇妙生物，喜欢圆圆的东西，还会趁房主不在时偷偷做游戏直播。快来看看简介和画廊吧。",
  },
  profile: {
    title: "简介 | Supitaro",
    description:
      "认识一下 Supitaro：来自宇宙的奇妙生物，喜欢圆圆的东西，还会趁房主不在时偷偷做游戏直播。",
  },
  gallery: {
    title: "画廊 | Supitaro",
    description: "Supitaro 们的插画画廊。图片准备好后，会一点一点地公开。",
  },
};

/** 繁體中文（Sprint 40 人類確認完成・繁体字のみ・畫廊）。 */
const zhHant: LocalizedPageMetadata = {
  top: {
    title: "Supitaro — 來自宇宙的奇妙生物",
    description:
      "Supitaro 的官方網站。來自宇宙的奇妙生物，喜歡圓圓的東西，還會趁屋主不在時偷偷做遊戲直播。快來看看簡介和畫廊吧。",
  },
  profile: {
    title: "簡介 | Supitaro",
    description:
      "認識一下 Supitaro：來自宇宙的奇妙生物，喜歡圓圓的東西，還會趁屋主不在時偷偷做遊戲直播。",
  },
  gallery: {
    title: "畫廊 | Supitaro",
    description: "Supitaro 們的插畫畫廊。圖片準備好後，會一點一點地公開。",
  },
};

/** 한국어（Sprint 40 사람 확인 완료・description 은 설명조 합니다体）。 */
const ko: LocalizedPageMetadata = {
  top: {
    title: "Supitaro — 우주에서 온 신기한 생물",
    description:
      "우주에서 온 신기한 생물 Supitaro의 공식 사이트. 동그란 것을 좋아하고, 집주인이 없는 사이 몰래 게임 방송을 합니다. 프로필과 갤러리를 둘러보세요.",
  },
  profile: {
    title: "프로필 | Supitaro",
    description:
      "Supitaro의 프로필. 우주에서 온 신기한 생물로, 동그란 것을 좋아하고 집주인이 없는 사이 몰래 게임 방송을 합니다.",
  },
  gallery: {
    title: "갤러리 | Supitaro",
    description: "Supitaro들의 일러스트 갤러리. 준비되는 대로 조금씩 공개해 나갑니다.",
  },
};

/** locale → 3 ページ metadata の網羅マップ。locale 追加/削除は型で検出（辞書・topPage と同方式）。 */
const pageMetadata: Record<Locale, LocalizedPageMetadata> = {
  ja,
  en,
  "zh-hans": zhHans,
  "zh-hant": zhHant,
  ko,
};

/**
 * locale × page の SEO 文言（title 絶対値 / description）を返す。
 * 5 locale × 3 page 網羅・日本語への黙示 fallback なし・runtime fetch なし。Server から同期利用（静的生成を維持）。
 */
export function getPageMetadata(
  locale: Locale,
  page: PageMetadataKey,
): PageMetadataCopy {
  return pageMetadata[locale][page];
}

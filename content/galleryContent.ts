/**
 * ギャラリーページの編集コンテンツ（5 locale）。Sprint 35。
 *
 * - UI 定型文（content/i18n の辞書）とは別の「編集コンテンツ」。Gallery 本文と Gallery 固有 UI だけを持つ。
 * - 日本語（ja）は既存 content/gallery.ts を**正本として参照**する（D-D=Option B: 画像 src・id・順序・
 *   title.ja・alt を再定義しない。gallery.ts が唯一の作品台帳）。
 * - 外国語は Sprint 35 で人間承認済みの正式訳。作品名のキャラ名は全外国語で `Supitaro`（D-A）。
 * - `getGalleryContent` は未知 locale を受け付けず、日本語への黙示 fallback もしない（型で 5 locale 網羅）。
 * - 台帳の作品に対応する翻訳が無ければ実行時に throw（＝静的生成の build 時に検出。日本語へ落とさない）。
 * - Client（GalleryCard/Grid/Lightbox/HomeGallerySection）へは**解決済み文字列のみ**渡す（§22）。
 */
import { getPublishedGalleryItems } from "@/content/gallery";
import type { Locale } from "@/lib/i18n/locales";

/** Gallery 固有 UI 文字列（すべて解決済み・Client へ渡せる plain string）。 */
export type GalleryStrings = {
  /** ページ h1。 */
  pageTitle: string;
  /** ページのリード文。 */
  lead: string;
  /** カードの拡大ヒント（可視・JS 有効時のみ表示）。 */
  viewLarger: string;
  /** lightbox の閉じるボタン（aria-label ＋ sr-only）。 */
  closeLabel: string;
  /** トップページの Gallery プレビュー（見出し・リード・CTA）。 */
  preview: {
    heading: string;
    lead: string;
    cta: string;
  };
};

/** 表示用に解決済みの Gallery 作品（Client へ渡す。src/寸法は台帳・コンポーネント定数由来で locale 不変）。 */
export type GalleryView = {
  id: string;
  src: string;
  alt: string;
  title?: string;
  /** カード button の aria-label（作品表示名を locale テンプレートへ適用済み）。 */
  openLabel: string;
};

export type GalleryContent = {
  strings: GalleryStrings;
  items: readonly GalleryView[];
};

/** 作品別の翻訳テキスト（翻訳対象＝title/alt のみ）。id で台帳（gallery.ts）と対応。 */
type ItemText = { title?: string; alt: string };

/** locale 別 UI 文字列（D-B 承認）。ja は既存の表示文言と byte 一致。 */
const strings: Record<Locale, GalleryStrings> = {
  ja: {
    pageTitle: "ギャラリー",
    lead: "すぴたろうたちのイラストを集めていく場所です。公開が承認された画像だけを、すこしずつ追加していきます。",
    viewLarger: "大きく見る",
    closeLabel: "画像を閉じる",
    preview: {
      heading: "デザインギャラリー",
      lead: "すぴたろうのデザインを、すこしだけ。",
      cta: "ギャラリーを見る",
    },
  },
  en: {
    pageTitle: "Gallery",
    lead: "A place to gather illustrations of Supitaro and friends. Only approved images are added here, little by little.",
    viewLarger: "View larger",
    closeLabel: "Close image",
    preview: {
      heading: "Design Gallery",
      lead: "A little glimpse of Supitaro’s design.",
      cta: "View the gallery",
    },
  },
  "zh-hans": {
    pageTitle: "画廊",
    lead: "这里是收集 Supitaro 们的插画的地方。只会把已获准公开的图片，一点一点地添加进来。",
    viewLarger: "放大查看",
    closeLabel: "关闭图片",
    preview: {
      heading: "设计画廊",
      lead: "稍微看一点 Supitaro 的设计。",
      cta: "查看画廊",
    },
  },
  "zh-hant": {
    pageTitle: "畫廊",
    lead: "這裡是收集 Supitaro 們的插畫的地方。只會把已核准公開的圖片，一點一點地加進來。",
    viewLarger: "放大檢視",
    closeLabel: "關閉圖片",
    preview: {
      heading: "設計畫廊",
      lead: "稍微看一點 Supitaro 的設計。",
      cta: "查看畫廊",
    },
  },
  ko: {
    pageTitle: "갤러리",
    lead: "Supitaro들의 일러스트를 모아 가는 곳이에요. 공개가 승인된 이미지만, 조금씩 추가해 나가요.",
    viewLarger: "크게 보기",
    closeLabel: "이미지 닫기",
    preview: {
      heading: "디자인 갤러리",
      lead: "Supitaro의 디자인을, 아주 조금.",
      cta: "갤러리 보기",
    },
  },
};

/** カード button の aria-label テンプレート（作品表示名を適用）。ja は既存挙動 `{名前}を大きく見る` と一致。 */
const openLabelTemplate: Record<Locale, (name: string) => string> = {
  ja: (name) => `${name}を大きく見る`,
  en: (name) => `View ${name} larger`,
  "zh-hans": (name) => `放大查看${name}`,
  "zh-hant": (name) => `放大檢視${name}`,
  ko: (name) => `${name} 크게 보기`,
};

/**
 * 作品別の外国語テキスト（翻訳対象＝title/alt のみ）。ja は含めない（gallery.ts を参照）。
 * key は content/gallery.ts の作品 id と対応。台帳に作品が増えたら各 locale へ追加が必要
 *（未追加なら getGalleryContent が build 時に throw）。
 */
const itemText: Record<Exclude<Locale, "ja">, Record<string, ItemText>> = {
  en: {
    "supitaro-design-art-v1": {
      title: "Supitaro Design Art",
      alt: "Design art of Supitaro standing surrounded by stars and planets. A white body, blue eyes, a blue diamond on the forehead, and blue ears and tail.",
    },
  },
  "zh-hans": {
    "supitaro-design-art-v1": {
      title: "Supitaro 设计原画",
      alt: "Supitaro 站在星星和行星的环绕中的设计原画。白色身体、蓝色眼睛、额头上有蓝色菱形、蓝色耳朵和尾巴。",
    },
  },
  "zh-hant": {
    "supitaro-design-art-v1": {
      title: "Supitaro 設計原畫",
      alt: "Supitaro 站在星星和行星環繞之中的設計原畫。白色身體、藍色眼睛、額頭上有藍色菱形、藍色耳朵和尾巴。",
    },
  },
  ko: {
    "supitaro-design-art-v1": {
      title: "Supitaro 디자인 아트",
      alt: "별과 행성에 둘러싸여 서 있는 Supitaro의 디자인 아트. 흰 몸에 파란 눈, 이마에 파란 마름모, 파란 귀와 꼬리.",
    },
  },
};

/**
 * locale の Gallery 本文を返す。作品台帳（gallery.ts）× locale テキストを Server で統合し、
 * 表示用に解決済みの文字列（title/alt/openLabel）と UI 文字列を返す。
 * 5 locale 網羅・日本語への黙示 fallback なし・runtime fetch なし。Server から同期利用（静的生成を維持）。
 */
export function getGalleryContent(locale: Locale): GalleryContent {
  const registry = getPublishedGalleryItems();
  const makeLabel = openLabelTemplate[locale];

  const items: GalleryView[] = registry.map((item) => {
    let title: string | undefined;
    let alt: string;

    if (locale === "ja") {
      // ja＝正本。title.ja / image.alt は content/gallery.ts が唯一の定義元（再定義しない）。
      title = item.title?.ja;
      alt = item.image.alt;
    } else {
      const text = itemText[locale][item.id];
      if (!text) {
        // 対応翻訳が無い作品は、日本語へ黙示 fallback せず公開しない（静的生成の build 時に検出）。
        throw new Error(`gallery translation missing: ${locale}/${item.id}`);
      }
      title = text.title;
      alt = text.alt;
    }

    // 表示名は現行 GalleryCard と同じ規則（title 優先・無ければ alt）。
    const name = title ?? alt;
    return {
      id: item.id,
      src: item.image.src,
      alt,
      title,
      openLabel: makeLabel(name),
    };
  });

  return { strings: strings[locale], items };
}

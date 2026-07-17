/**
 * トップページの編集コンテンツ（5 locale）。Sprint 33。
 *
 * - UI 定型文（content/i18n の辞書）とは別の「編集コンテンツ」（§16）。トップページ本文だけを持つ。
 * - 日本語（ja）を正本とし、外国語は Sprint 33 で人間承認済みの正式訳（AI 初稿 → 人間 APPROVE）。
 * - 名称は全外国語で `Supitaro`（D-A）。口癖 `おぱぁ。` は全 locale で日本語維持（D-B）。
 * - `getTopPage` は未知 locale を受け付けず、日本語への黙示 fallback もしない（型で 5 locale 網羅）。
 * - News / Gallery プレビューはトップ本文に含めない（外国語では非表示＝D-C/D-D。ページ側で ja のみ描画）。
 * - `intro.lines` の日本語は content/profile.ts の intro と同一（トップの紹介文＝同じ確定情報。日本語は不変）。
 */
import type { Locale } from "@/lib/i18n/locales";

export type TopPageContent = {
  hero: {
    /** 口癖（全 locale で日本語維持）。 */
    tagline: string;
    /** h1。要素間でモバイル改行（sm:hidden）。ja は 2 セグメント、外国語は 1 セグメント。 */
    heading: readonly string[];
    subtext: string;
    imageAlt: string;
    watchOnYoutube: string;
    viewProfile: string;
  };
  intro: {
    heading: string;
    lines: readonly string[];
    more: string;
  };
  channels: {
    heading: string;
    youtubeCta: string;
    youtubeDesc: string;
    xCta: string;
    xDesc: string;
  };
};

/** 日本語＝正本。値は既存トップページの表示文言と完全一致（byte 一致）。 */
const ja = {
  hero: {
    tagline: "おぱぁ。",
    heading: ["宇宙から来た、", "ふしぎないきもの。"],
    subtext: "すぴたろうのこと、すこしだけ、のぞいてみませんか。",
    imageAlt:
      "白い体に青い目、額の青いひし形、青い耳と尻尾を持つ、すぴたろうの全身イラスト",
    watchOnYoutube: "YouTubeで配信を見る",
    viewProfile: "プロフィールを見る",
  },
  intro: {
    heading: "すぴたろうって？",
    // content/profile.ts の intro と同一（トップの紹介文。日本語は正本・不変）。
    lines: [
      "宇宙から来た、ふしぎないきもの。",
      "丸いものが好き。",
      "家主の留守中に、こっそりゲーム配信をしている。",
    ],
    more: "もっとくわしく",
  },
  channels: {
    heading: "チャンネル",
    youtubeCta: "YouTubeで配信を見る",
    youtubeDesc: "こっそりゲーム配信をしているチャンネル",
    xCta: "Xで活動を追う",
    xDesc: "公式アカウント",
  },
} satisfies TopPageContent;

/** English（Sprint 33 人間承認済み）。 */
const en = {
  hero: {
    tagline: "おぱぁ。",
    heading: ["A mysterious creature from outer space."],
    subtext: "Care to take a little peek at Supitaro?",
    imageAlt:
      "A full-body illustration of Supitaro — white body, blue eyes, a blue diamond on the forehead, and blue ears and tail.",
    watchOnYoutube: "Watch on YouTube",
    viewProfile: "View profile",
  },
  intro: {
    heading: "Who is Supitaro?",
    lines: [
      "A mysterious creature from outer space.",
      "Loves round things.",
      "Secretly streams games while the homeowner is away.",
    ],
    more: "Learn more",
  },
  channels: {
    heading: "Channels",
    youtubeCta: "Watch on YouTube",
    youtubeDesc: "The channel for secret game streams.",
    xCta: "Follow along on X",
    xDesc: "Official account",
  },
} satisfies TopPageContent;

/** 简体中文（Sprint 33 人间承认済み）。 */
const zhHans = {
  hero: {
    tagline: "おぱぁ。",
    heading: ["来自宇宙的奇妙生物。"],
    subtext: "要不要稍微认识一下 Supitaro 呢？",
    imageAlt:
      "Supitaro 的全身插画：白色身体、蓝色眼睛、额头上有蓝色菱形、蓝色耳朵和尾巴。",
    watchOnYoutube: "在 YouTube 观看直播",
    viewProfile: "查看简介",
  },
  intro: {
    heading: "Supitaro 是谁？",
    lines: ["来自宇宙的奇妙生物。", "喜欢圆圆的东西。", "趁房主不在时，偷偷做游戏直播。"],
    more: "了解更多",
  },
  channels: {
    heading: "频道",
    youtubeCta: "在 YouTube 观看直播",
    youtubeDesc: "偷偷做游戏直播的频道",
    xCta: "在 X 关注动态",
    xDesc: "官方账号",
  },
} satisfies TopPageContent;

/** 繁體中文（Sprint 33 人類確認完成）。 */
const zhHant = {
  hero: {
    tagline: "おぱぁ。",
    heading: ["來自宇宙的奇妙生物。"],
    subtext: "要不要稍微認識一下 Supitaro 呢？",
    imageAlt:
      "Supitaro 的全身插畫：白色身體、藍色眼睛、額頭上有藍色菱形、藍色耳朵和尾巴。",
    watchOnYoutube: "在 YouTube 觀看直播",
    viewProfile: "查看簡介",
  },
  intro: {
    heading: "Supitaro 是誰？",
    lines: ["來自宇宙的奇妙生物。", "喜歡圓圓的東西。", "趁屋主不在時，偷偷做遊戲直播。"],
    more: "了解更多",
  },
  channels: {
    heading: "頻道",
    youtubeCta: "在 YouTube 觀看直播",
    youtubeDesc: "偷偷做遊戲直播的頻道",
    xCta: "在 X 關注動態",
    xDesc: "官方帳號",
  },
} satisfies TopPageContent;

/** 한국어（Sprint 33 사람 확인 완료）。 */
const ko = {
  hero: {
    tagline: "おぱぁ。",
    heading: ["우주에서 온 신기한 생물."],
    subtext: "Supitaro에 대해 조금만 들여다볼래요?",
    imageAlt:
      "흰 몸에 파란 눈, 이마에 파란 마름모, 파란 귀와 꼬리를 가진 Supitaro의 전신 일러스트.",
    watchOnYoutube: "YouTube에서 방송 보기",
    viewProfile: "프로필 보기",
  },
  intro: {
    heading: "Supitaro는 누구?",
    lines: ["우주에서 온 신기한 생물.", "동그란 걸 좋아해요.", "집주인이 없는 사이, 몰래 게임 방송을 해요."],
    more: "자세히 보기",
  },
  channels: {
    heading: "채널",
    youtubeCta: "YouTube에서 방송 보기",
    youtubeDesc: "몰래 게임 방송을 하는 채널",
    xCta: "X에서 소식 보기",
    xDesc: "공식 계정",
  },
} satisfies TopPageContent;

/** locale → トップページ本文の網羅マップ。locale 追加/削除は型で検出（辞書と同方式）。 */
const topPages: Record<Locale, TopPageContent> = {
  ja,
  en,
  "zh-hans": zhHans,
  "zh-hant": zhHant,
  ko,
};

/**
 * locale のトップページ本文を返す。5 locale 網羅・日本語への黙示 fallback なし・runtime fetch なし。
 * Server Component から同期利用（静的生成を維持）。
 */
export function getTopPage(locale: Locale): TopPageContent {
  return topPages[locale];
}

/**
 * プロフィールページの編集コンテンツ（5 locale）。Sprint 34。
 *
 * - UI 定型文（content/i18n の辞書）とは別の「編集コンテンツ」。プロフィール本文だけを持つ。
 * - 日本語（ja）は既存 content/profile.ts と config/site.ts（画像 alt）を**正本として参照**する
 *   （D-D=Option B: 二重定義を作らない。ja の name/intro/traits/words/upcoming は profile.ts が唯一の定義元）。
 * - 外国語は Sprint 34 で人間承認済みの正式訳（AI 初稿 → 人間 APPROVE）。`satisfies` で欠落/余剰キーを検出。
 * - 名称は全外国語で `Supitaro`（D-A）。words（口癖 6 個）は全 locale で日本語維持（D-A）。
 * - `getProfile` は未知 locale を受け付けず、日本語への黙示 fallback もしない（型で 5 locale 網羅）。
 * - シート固有の「閉じる」（closeLabel）はこのモデルで保持する（D-C: 共通 UI 辞書は拡張しない）。
 */
import { siteConfig } from "@/config/site";
import { profile, type ProfileTrait } from "@/content/profile";
import type { Locale } from "@/lib/i18n/locales";

export type ProfilePageContent = {
  /** ページ h1。 */
  pageTitle: string;
  /** プロフィール画像の代替テキスト（ja は siteConfig を参照）。 */
  imageAlt: string;
  /** 基本セクション見出し（＝キャラクター名。外国語は Supitaro）。 */
  name: string;
  /** 短いキャラクター紹介（1 行ずつ表示）。 */
  intro: readonly string[];
  traits: {
    /** 「すぴたろうのこと」相当の見出し。 */
    heading: string;
    /** セクションのリード文。 */
    lead: string;
    /** カード操作ヒント（JS 有効時のみ表示）。 */
    moreLabel: string;
    /** 詳細シートの閉じるボタン sr-only（D-C: profile モデルで保持）。 */
    closeLabel: string;
    /** トレイトカード 4 件（数・順序・id はロケール不変）。 */
    items: readonly ProfileTrait[];
  };
  words: {
    /** 「すぴたろうの言葉」相当の見出し。 */
    heading: string;
    /** セクションのリード文。 */
    lead: string;
    /** 口癖・鳴き声 6 個（D-A: 全 locale で日本語維持）。 */
    items: readonly string[];
  };
  upcoming: {
    /** 「くわしい設定」相当の見出し。 */
    heading: string;
    /** upcoming が空のときに表示する準備中文。 */
    emptyNotice: string;
    /** 追加予定の詳細設定（ja は profile.upcoming を参照。現状は空）。 */
    items: readonly string[];
  };
};

/**
 * 日本語＝正本。name / intro / traits / words / upcoming は content/profile.ts を、
 * imageAlt は config/site.ts を参照する（重複定義しない・byte 一致は参照で保証）。
 * ページ JSX / コンポーネントにあった UI 文（見出し・リード・moreLabel・closeLabel）は
 * 表示文言を変えずにここへ集約する。
 */
const ja = {
  pageTitle: "プロフィール",
  imageAlt: siteConfig.images.profile.alt,
  name: profile.name,
  intro: profile.intro,
  traits: {
    heading: "すぴたろうのこと",
    lead: "気になる項目をえらぶと、すぴたろうのことをすこしずつ知れます。",
    moreLabel: "くわしく見る",
    closeLabel: "閉じる",
    items: profile.traits,
  },
  words: {
    heading: "すぴたろうの言葉",
    lead: "すぴたろうは、人間が完全には理解できない独自の言葉を話します。",
    items: profile.words,
  },
  upcoming: {
    heading: "くわしい設定",
    emptyNotice: "準備中です。すこしずつ増えていきます。",
    items: profile.upcoming,
  },
} satisfies ProfilePageContent;

/** English（Sprint 34 人間承認済み）。intro は Sprint 33 承認訳を再利用。 */
const en = {
  pageTitle: "Profile",
  imageAlt:
    "A full-body illustration of Supitaro — white body, blue eyes, a blue diamond on the forehead, blue ears, and two blue tails.",
  name: "Supitaro",
  intro: [
    "A mysterious creature from outer space.",
    "Loves round things.",
    "Secretly streams games while the homeowner is away.",
  ],
  traits: {
    heading: "About Supitaro",
    lead: "Pick a topic you’re curious about to get to know Supitaro little by little.",
    moreLabel: "See more",
    closeLabel: "Close",
    items: [
      {
        id: "origin",
        label: "Where are you from?",
        summary: "From outer space.",
        detail:
          "A mysterious creature from outer space. Which planet it came from is still unknown.",
      },
      {
        id: "creature",
        label: "What kind of creature?",
        summary: "A mysterious creature.",
        detail:
          "A mysterious creature from outer space. About all we know so far is that it loves round things. Everything else, little by little from here.",
      },
      {
        id: "likes",
        label: "What do you like?",
        summary: "Loves round things.",
        detail:
          "What it likes: round things. Perfectly round shapes seem to be its favorite.",
      },
      {
        id: "streaming",
        label: "What do you do?",
        summary: "Secret game streams.",
        detail:
          "While the homeowner is away, it secretly streams games. A secret little time known to no one.",
      },
    ],
  },
  words: {
    heading: "Supitaro’s words",
    lead: "Supitaro speaks a language all its own that humans can’t fully understand.",
    items: profile.words,
  },
  upcoming: {
    heading: "More details",
    emptyNotice: "Coming soon. More will be added little by little.",
    items: [],
  },
} satisfies ProfilePageContent;

/** 简体中文（Sprint 34 人间承认済み）。 */
const zhHans = {
  pageTitle: "简介",
  imageAlt:
    "Supitaro 的全身插画：白色身体、蓝色眼睛、额头上有蓝色菱形、蓝色耳朵和两条蓝色尾巴。",
  name: "Supitaro",
  intro: ["来自宇宙的奇妙生物。", "喜欢圆圆的东西。", "趁房主不在时，偷偷做游戏直播。"],
  traits: {
    heading: "关于 Supitaro",
    lead: "选择你感兴趣的项目，一点一点认识 Supitaro。",
    moreLabel: "查看详情",
    closeLabel: "关闭",
    items: [
      {
        id: "origin",
        label: "你从哪里来？",
        summary: "来自宇宙。",
        detail: "来自宇宙的奇妙生物。究竟来自哪颗星球，目前还不清楚。",
      },
      {
        id: "creature",
        label: "是什么样的生物？",
        summary: "奇妙的生物。",
        detail:
          "来自宇宙的奇妙生物。目前知道的，只有它喜欢圆圆的东西。其他的，往后再一点一点了解。",
      },
      {
        id: "likes",
        label: "喜欢什么？",
        summary: "喜欢圆圆的东西。",
        detail: "喜欢的东西，是圆圆的东西。圆滚滚的形状，似乎是它的最爱。",
      },
      {
        id: "streaming",
        label: "在做什么？",
        summary: "偷偷做游戏直播。",
        detail: "趁房主不在的时候，偷偷做游戏直播。这是不告诉任何人的、秘密的时间。",
      },
    ],
  },
  words: {
    heading: "Supitaro 的话语",
    lead: "Supitaro 说着人类无法完全理解的、独有的语言。",
    items: profile.words,
  },
  upcoming: {
    heading: "详细设定",
    emptyNotice: "正在准备中。会一点一点增加。",
    items: [],
  },
} satisfies ProfilePageContent;

/** 繁體中文（Sprint 34 人類確認完成）。 */
const zhHant = {
  pageTitle: "簡介",
  imageAlt:
    "Supitaro 的全身插畫：白色身體、藍色眼睛、額頭上有藍色菱形、藍色耳朵和兩條藍色尾巴。",
  name: "Supitaro",
  intro: ["來自宇宙的奇妙生物。", "喜歡圓圓的東西。", "趁屋主不在時，偷偷做遊戲直播。"],
  traits: {
    heading: "關於 Supitaro",
    lead: "選擇你感興趣的項目，一點一點認識 Supitaro。",
    moreLabel: "查看詳情",
    closeLabel: "關閉",
    items: [
      {
        id: "origin",
        label: "你從哪裡來？",
        summary: "來自宇宙。",
        detail: "來自宇宙的奇妙生物。究竟來自哪顆星球，目前還不清楚。",
      },
      {
        id: "creature",
        label: "是什麼樣的生物？",
        summary: "奇妙的生物。",
        detail:
          "來自宇宙的奇妙生物。目前知道的，只有牠喜歡圓圓的東西。其他的，往後再一點一點了解。",
      },
      {
        id: "likes",
        label: "喜歡什麼？",
        summary: "喜歡圓圓的東西。",
        detail: "喜歡的東西，是圓圓的東西。圓滾滾的形狀，似乎是牠的最愛。",
      },
      {
        id: "streaming",
        label: "在做什麼？",
        summary: "偷偷做遊戲直播。",
        detail: "趁屋主不在的時候，偷偷做遊戲直播。這是不告訴任何人的、祕密的時間。",
      },
    ],
  },
  words: {
    heading: "Supitaro 的話語",
    lead: "Supitaro 說著人類無法完全理解的、獨有的語言。",
    items: profile.words,
  },
  upcoming: {
    heading: "詳細設定",
    emptyNotice: "正在準備中。會一點一點增加。",
    items: [],
  },
} satisfies ProfilePageContent;

/** 한국어（Sprint 34 사람 확인 완료）。해요体で統一。 */
const ko = {
  pageTitle: "프로필",
  imageAlt:
    "흰 몸에 파란 눈, 이마에 파란 마름모, 파란 귀와 두 개의 파란 꼬리를 가진 Supitaro의 전신 일러스트.",
  name: "Supitaro",
  intro: ["우주에서 온 신기한 생물.", "동그란 걸 좋아해요.", "집주인이 없는 사이, 몰래 게임 방송을 해요."],
  traits: {
    heading: "Supitaro에 대해",
    lead: "궁금한 항목을 골라 Supitaro를 조금씩 알아가 보세요.",
    moreLabel: "자세히 보기",
    closeLabel: "닫기",
    items: [
      {
        id: "origin",
        label: "어디에서 왔어요?",
        summary: "우주에서 왔어요.",
        detail: "우주에서 온 신기한 생물. 어느 별에서 왔는지는 아직 밝혀지지 않았어요.",
      },
      {
        id: "creature",
        label: "어떤 생물이에요?",
        summary: "신기한 생물.",
        detail:
          "우주에서 온 신기한 생물. 지금 알 수 있는 건 동그란 걸 좋아한다는 것 정도. 나머지는 앞으로 조금씩.",
      },
      {
        id: "likes",
        label: "좋아하는 건 뭐예요?",
        summary: "동그란 걸 좋아해요.",
        detail: "좋아하는 건 동그란 것. 동글동글한 모양을 특히 좋아하는 것 같아요.",
      },
      {
        id: "streaming",
        label: "뭘 하고 있어요?",
        summary: "몰래 게임 방송.",
        detail:
          "집주인이 없는 사이, 몰래 게임 방송을 하고 있어요. 아무에게도 말하지 않은, 비밀의 시간이에요.",
      },
    ],
  },
  words: {
    heading: "Supitaro의 말",
    lead: "Supitaro는 사람이 완전히 이해할 수 없는 자신만의 말을 해요.",
    items: profile.words,
  },
  upcoming: {
    heading: "자세한 설정",
    emptyNotice: "준비 중이에요. 조금씩 늘어날 거예요.",
    items: [],
  },
} satisfies ProfilePageContent;

/** locale → プロフィール本文の網羅マップ。locale 追加/削除は型で検出（辞書・topPage と同方式）。 */
const profiles: Record<Locale, ProfilePageContent> = {
  ja,
  en,
  "zh-hans": zhHans,
  "zh-hant": zhHant,
  ko,
};

/**
 * locale のプロフィール本文を返す。5 locale 網羅・日本語への黙示 fallback なし・runtime fetch なし。
 * Server Component から同期利用（静的生成を維持）。
 */
export function getProfile(locale: Locale): ProfilePageContent {
  return profiles[locale];
}

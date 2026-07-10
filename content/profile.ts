/**
 * プロフィールページの掲載内容。
 * 設定として確定している事実のみを載せる。未確定の内容は補完しない。
 */

export type ProfileField = {
  label: string;
  value: string;
};

export type Profile = {
  name: string;
  /** 短いキャラクター紹介(1 行ずつ表示する) */
  intro: string[];
  fields: ProfileField[];
  /** すぴたろうの独自の言葉。人間には完全には分からないため、意味の解説は付けない。 */
  words: string[];
  /** 将来追加予定の詳細設定。確定したらここに追記する。空の間は「準備中」を表示する。 */
  upcoming: string[];
};

export const profile: Profile = {
  name: "すぴたろう",
  intro: [
    "宇宙から来た、ふしぎないきもの。",
    "丸いものが好き。",
    "家主の留守中に、こっそりゲーム配信をしている。",
  ],
  fields: [
    { label: "名前", value: "すぴたろう" },
    { label: "出身", value: "宇宙" },
    { label: "好きなもの", value: "丸いもの" },
    { label: "配信内容", value: "ゲーム配信(家主の留守中に、こっそり)" },
  ],
  words: ["おぱぁ", "アパ？", "いぱ", "まぁっ！", "ハッピー", "めーおー"],
  upcoming: [],
};

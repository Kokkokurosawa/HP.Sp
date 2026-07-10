/**
 * お知らせデータ。
 * 新しいお知らせは newsItems の先頭に追加する(表示時に公開日の降順へ並べ替える)。
 */

export type NewsCategory = "サイト" | "配信" | "その他";

export type NewsItem = {
  /** 一意な ID(例: "2026-07-11-foundation") */
  id: string;
  /** 公開日(YYYY-MM-DD) */
  date: string;
  title: string;
  /** 本文または概要 */
  body: string;
  category: NewsCategory;
  /** 任意の外部リンク */
  link?: {
    href: string;
    label: string;
  };
};

export const newsItems: NewsItem[] = [
  {
    id: "2026-07-11-foundation",
    date: "2026-07-11",
    title: "公式サイトの土台ができました",
    body: "すぴたろう公式サイト Foundation v0.1 を構築しました。プロフィールやお知らせは、これから少しずつ増えていきます。",
    category: "サイト",
  },
];

/** 公開日の降順で全件を返す */
export function getAllNews(): NewsItem[] {
  return [...newsItems].sort((a, b) => (a.date < b.date ? 1 : -1));
}

/** 公開日の降順で最新 count 件を返す */
export function getLatestNews(count: number): NewsItem[] {
  return getAllNews().slice(0, count);
}

// Sprint 30 翻訳辞書基盤の検証(Node 標準 node:test + node:assert、追加依存なし)。
// この環境の Node は .ts を直接実行できない(ERR_UNKNOWN_FILE_EXTENSION)ため、
// 実行はプロジェクト tsc で CJS へコンパイルしてから node --test する(Sprint 28 の locales.test と同方式)。
// locale source of truth との一致を見るため相対 import を使う(alias @/ は node 実行時に解決されない)。
import { test } from "node:test";
import assert from "node:assert/strict";
import { getDictionary, dictionaryLocales } from "./index";
import { getGalleryContent } from "../galleryContent";
import { locales, type Locale } from "../../lib/i18n/locales";

/** オブジェクトのドット区切りキー経路をすべて集めてソートして返す(構造比較用)。 */
function keyPaths(obj: unknown, prefix = ""): string[] {
  if (typeof obj !== "object" || obj === null) return [prefix];
  const out: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    out.push(...keyPaths(v, prefix ? `${prefix}.${k}` : k));
  }
  return out.sort();
}

/** すべての葉が文字列かを再帰的に確認する。 */
function everyLeafIsString(obj: unknown): boolean {
  if (typeof obj === "string") return true;
  if (typeof obj !== "object" || obj === null) return false;
  return Object.values(obj).every(everyLeafIsString);
}

const REQUIRED_CATEGORIES = ["common", "navigation", "language", "accessibility", "social"];

// ---- locale 網羅性 ----

test("辞書 map の locale 一覧が locale source of truth と一致", () => {
  assert.deepEqual([...dictionaryLocales].sort(), [...locales].sort());
});

test("5 locale すべてに辞書が存在する", () => {
  for (const l of locales) {
    const d = getDictionary(l);
    assert.equal(typeof d, "object");
    assert.ok(d, `${l} の辞書が存在するべき`);
  }
});

test("zh-hans 辞書と zh-hant 辞書が別々に存在する", () => {
  assert.ok(dictionaryLocales.includes("zh-hans"));
  assert.ok(dictionaryLocales.includes("zh-hant"));
});

test("`zh` 単独の辞書 ID は追加しない", () => {
  assert.equal(dictionaryLocales.includes("zh" as Locale), false);
});

// ---- 取得 API ----

test("getDictionary: ja は日本語辞書を返す", () => {
  assert.equal(getDictionary("ja").common.home, "ホーム");
  assert.equal(getDictionary("ja").language.name, "日本語");
});

test("getDictionary: en は英語辞書を返す", () => {
  assert.equal(getDictionary("en").common.home, "Home");
  assert.equal(getDictionary("en").language.name, "English");
});

test("getDictionary: ko は韓国語辞書を返す", () => {
  assert.equal(getDictionary("ko").language.name, "한국어");
});

test("zh-hans と zh-hant は別辞書(値が異なる)", () => {
  const hans = getDictionary("zh-hans");
  const hant = getDictionary("zh-hant");
  assert.notEqual(hans, hant);
  assert.equal(hans.language.name, "简体中文");
  assert.equal(hant.language.name, "繁體中文");
  assert.notEqual(hans.common.home, hant.common.home);
});

test("返却辞書の参照が locale ごとに独立している(共有・上書きなし)", () => {
  const seen = new Set<unknown>();
  for (const l of locales) {
    const d = getDictionary(l);
    assert.equal(seen.has(d), false, `${l} の辞書参照が他 locale と共有されている`);
    seen.add(d);
  }
});

test("日本語への黙示 fallback がない(各 locale 固有の値を返す)", () => {
  const jaName = getDictionary("ja").language.name;
  for (const l of locales) {
    if (l === "ja") continue;
    assert.notEqual(
      getDictionary(l).language.name,
      jaName,
      `${l} が日本語へ fallback している`,
    );
  }
});

test("localeScaffold セクションは辞書から削除済み(暫定 scaffold の責務を残さない)", () => {
  for (const l of locales) {
    const d = getDictionary(l) as Record<string, unknown>;
    assert.equal("localeScaffold" in d, false, `${l} に localeScaffold が残存している`);
  }
});

// ---- スキーマ ----

test("全辞書に必須分類が存在する", () => {
  for (const l of locales) {
    const d = getDictionary(l) as Record<string, unknown>;
    for (const cat of REQUIRED_CATEGORIES) {
      assert.ok(cat in d, `${l} に分類 ${cat} が無い`);
    }
  }
});

test("全辞書の葉がすべて文字列", () => {
  for (const l of locales) {
    assert.equal(everyLeafIsString(getDictionary(l)), true, `${l} に文字列でない葉がある`);
  }
});

test("全辞書が ja と同一のキー構造(欠落・余分なキーが無い)", () => {
  const jaKeys = keyPaths(getDictionary("ja"));
  for (const l of locales) {
    assert.deepEqual(keyPaths(getDictionary(l)), jaKeys, `${l} のキー構造が ja と一致しない`);
  }
});

// ---- Sprint 31: 共通 UI 定型文の辞書適用 ----

test("navigation の 4 領域名(main/mobile/footer/language)が全 locale に存在し互いに異なる", () => {
  for (const l of locales) {
    const n = getDictionary(l).navigation;
    assert.ok(n.mainNavigationLabel, `${l} に mainNavigationLabel が無い`);
    assert.ok(n.mobileNavigationLabel, `${l} に mobileNavigationLabel が無い`);
    assert.ok(n.footerNavigationLabel, `${l} に footerNavigationLabel が無い`);
    assert.ok(n.languageSwitcherLabel, `${l} に languageSwitcherLabel が無い`);
    // Header / モバイル / Footer / 言語切替 の nav 領域名は別ラベル(同一ラベルの二重定義をしない)
    const set = new Set([
      n.mainNavigationLabel,
      n.mobileNavigationLabel,
      n.footerNavigationLabel,
      n.languageSwitcherLabel,
    ]);
    assert.equal(set.size, 4, `${l} の nav 領域名が重複している`);
  }
});

test("言語切替の言語名(language.name)が各言語の自称表記で全 locale 相異", () => {
  const names = locales.map((l) => getDictionary(l).language.name);
  assert.deepEqual(names, ["日本語", "English", "简体中文", "繁體中文", "한국어"]);
  assert.equal(new Set(names).size, locales.length, "言語名が重複している");
});

test("languageSwitcherLabel の日本語が『言語』", () => {
  assert.equal(getDictionary("ja").navigation.languageSwitcherLabel, "言語");
});

test("共通ナビ項目(common)が全 locale に home/profile/gallery/news を持つ", () => {
  for (const l of locales) {
    const c = getDictionary(l).common;
    for (const key of ["home", "profile", "gallery", "news"] as const) {
      assert.ok(c[key], `${l} の common.${key} が無い`);
    }
  }
});

test("日本語辞書の共通 UI 文言が既存の正式文言と完全一致(表記変更なし)", () => {
  const ja = getDictionary("ja");
  // ナビ項目名(Header/モバイル/Footer 共通)
  assert.equal(ja.common.home, "ホーム");
  assert.equal(ja.common.profile, "プロフィール");
  assert.equal(ja.common.gallery, "ギャラリー");
  assert.equal(ja.common.news, "お知らせ");
  // nav 領域名(aria-label / aria-labelledby)
  assert.equal(ja.navigation.mainNavigationLabel, "メインナビゲーション");
  assert.equal(ja.navigation.mobileNavigationLabel, "モバイルナビゲーション");
  assert.equal(ja.navigation.footerNavigationLabel, "サイトメニュー");
  // アクセシビリティ定型文(skip リンク / メニュー開閉)
  assert.equal(ja.accessibility.skipToContent, "本文へスキップ");
  assert.equal(ja.accessibility.openMenu, "メニューを開く");
  assert.equal(ja.accessibility.closeMenu, "メニューを閉じる");
});

// ---- Sprint 37: 共通 UI 翻訳の人間確認済み値 ----

test("共通 UI 辞書の承認済み外国語値(Sprint 37 D-COMMON/D-GAL)", () => {
  // D-GAL: common.gallery は Gallery ページ見出し(Sprint 35 承認)と統一し zh を確定。
  assert.equal(getDictionary("zh-hans").common.gallery, "画廊");
  assert.equal(getDictionary("zh-hant").common.gallery, "畫廊");
  assert.equal(getDictionary("en").common.gallery, "Gallery");
  assert.equal(getDictionary("ko").common.gallery, "갤러리");
  // D-COMMON: 代表的な承認値の回帰ガード(EN/KO 含む)。
  assert.equal(getDictionary("en").navigation.footerNavigationLabel, "Site menu");
  assert.equal(getDictionary("en").accessibility.skipToContent, "Skip to content");
  assert.equal(getDictionary("ko").accessibility.openMenu, "메뉴 열기");
  assert.equal(getDictionary("zh-hant").accessibility.closeMenu, "關閉選單");
});

test("nav の gallery 項目名が Gallery ページ見出しと全 locale で一致(Sprint 37 D-GAL)", () => {
  for (const l of locales) {
    assert.equal(
      getDictionary(l).common.gallery,
      getGalleryContent(l).strings.pageTitle,
      `${l} の nav gallery 項目名と Gallery ページ見出しが不一致`,
    );
  }
});

// ---- Sprint 38: 外部リンク補助文言・FOLLOW SNS aria の locale 化 ----

test("accessibility.externalLinkNote が全 locale に存在し ja は既存文言と byte 一致", () => {
  for (const l of locales) {
    assert.ok(getDictionary(l).accessibility.externalLinkNote, `${l} に externalLinkNote が無い`);
  }
  // 既存ハードコード(Button/ChannelLinks の sr-only)を byte 一致で集約(表記変更なし)。
  assert.equal(
    getDictionary("ja").accessibility.externalLinkNote,
    "(外部リンク・新しいタブで開きます)",
  );
});

test("social セクションが全 locale に youtube/x/twitch を持ち ja は既存 aria と byte 一致", () => {
  for (const l of locales) {
    const s = getDictionary(l).social;
    for (const key of ["youtube", "x", "twitch"] as const) {
      assert.ok(s[key], `${l} の social.${key} が無い`);
    }
  }
  const ja = getDictionary("ja").social;
  assert.equal(ja.youtube, "YouTubeで配信を見る(外部リンク・新しいタブで開きます)");
  assert.equal(ja.x, "Xで活動を追う(外部リンク・新しいタブで開きます)");
  assert.equal(ja.twitch, "Twitchで配信を見る(外部リンク・新しいタブで開きます)");
});

test("social の各 aria が同 locale の externalLinkNote を末尾に含む(注記一体・Sprint 38 D-G)", () => {
  for (const l of locales) {
    const d = getDictionary(l);
    for (const key of ["youtube", "x", "twitch"] as const) {
      assert.ok(
        d.social[key].endsWith(d.accessibility.externalLinkNote),
        `${l} の social.${key} が externalLinkNote で終わっていない`,
      );
    }
  }
});

test("外部リンク補助文言・SNS aria が日本語へ黙示 fallback しない(外国語は固有値)", () => {
  const jaNote = getDictionary("ja").accessibility.externalLinkNote;
  const jaSocial = getDictionary("ja").social;
  for (const l of locales) {
    if (l === "ja") continue;
    const d = getDictionary(l);
    assert.notEqual(d.accessibility.externalLinkNote, jaNote, `${l} の externalLinkNote が ja へ fallback`);
    for (const key of ["youtube", "x", "twitch"] as const) {
      assert.notEqual(d.social[key], jaSocial[key], `${l} の social.${key} が ja へ fallback`);
    }
  }
});

test("承認済み外国語値(Sprint 38 D-A/D-C/D-D/D-E/D-F)と簡繁独立", () => {
  assert.equal(
    getDictionary("en").accessibility.externalLinkNote,
    "(external link, opens in a new tab)",
  );
  assert.equal(getDictionary("en").social.youtube, "Watch on YouTube (external link, opens in a new tab)");
  assert.equal(getDictionary("en").social.x, "Follow along on X (external link, opens in a new tab)");
  assert.equal(getDictionary("en").social.twitch, "Watch on Twitch (external link, opens in a new tab)");
  assert.equal(getDictionary("ko").social.x, "X에서 소식 보기 (외부 링크, 새 탭에서 열립니다)");
  // 簡体字と繁体字は独立記述(機械変換でない・同一キーで異なる用字)。
  assert.equal(getDictionary("zh-hans").social.youtube, "在 YouTube 观看直播（外部链接，将在新标签页中打开）");
  assert.equal(getDictionary("zh-hant").social.youtube, "在 YouTube 觀看直播（外部連結，將在新分頁中開啟）");
  assert.notEqual(
    getDictionary("zh-hans").social.youtube,
    getDictionary("zh-hant").social.youtube,
  );
});

test("X の動作句は実コード『活動を追う』を正本とする(意味を変えない・Sprint 38 追認)", () => {
  assert.ok(
    getDictionary("ja").social.x.startsWith("Xで活動を追う"),
    "ja social.x が『活動を追う』で始まらない",
  );
});

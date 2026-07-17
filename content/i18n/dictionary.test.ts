// Sprint 30 翻訳辞書基盤の検証(Node 標準 node:test + node:assert、追加依存なし)。
// この環境の Node は .ts を直接実行できない(ERR_UNKNOWN_FILE_EXTENSION)ため、
// 実行はプロジェクト tsc で CJS へコンパイルしてから node --test する(Sprint 28 の locales.test と同方式)。
// locale source of truth との一致を見るため相対 import を使う(alias @/ は node 実行時に解決されない)。
import { test } from "node:test";
import assert from "node:assert/strict";
import { getDictionary, dictionaryLocales } from "./index";
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

const REQUIRED_CATEGORIES = ["common", "navigation", "localeScaffold", "accessibility"];

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
  assert.equal(getDictionary("ja").localeScaffold.title, "日本語");
});

test("getDictionary: en は英語辞書を返す", () => {
  assert.equal(getDictionary("en").common.home, "Home");
  assert.equal(getDictionary("en").localeScaffold.title, "English");
});

test("getDictionary: ko は韓国語辞書を返す", () => {
  assert.equal(getDictionary("ko").localeScaffold.title, "한국어");
});

test("zh-hans と zh-hant は別辞書(値が異なる)", () => {
  const hans = getDictionary("zh-hans");
  const hant = getDictionary("zh-hant");
  assert.notEqual(hans, hant);
  assert.equal(hans.localeScaffold.title, "简体中文");
  assert.equal(hant.localeScaffold.title, "繁體中文");
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
  const jaDesc = getDictionary("ja").localeScaffold.description;
  for (const l of locales) {
    if (l === "ja") continue;
    assert.notEqual(
      getDictionary(l).localeScaffold.description,
      jaDesc,
      `${l} が日本語へ fallback している`,
    );
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

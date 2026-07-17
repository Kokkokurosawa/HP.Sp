// Sprint 28 locale モデルの検証（Node 標準 node:test + node:assert、追加依存なし）。
// 実行: node --test lib/i18n/locales.test.ts （Node 22 は .ts の型を自動ストリップ）。
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  locales,
  defaultLocale,
  isLocale,
  htmlLang,
  localePrefix,
  localesWithNews,
} from "./locales";

test("対応 locale は 5 つのみ・順序も固定", () => {
  assert.deepEqual([...locales], ["ja", "en", "zh-hans", "zh-hant", "ko"]);
  assert.equal(locales.length, 5);
});

test("既定 locale は ja", () => {
  assert.equal(defaultLocale, "ja");
});

test("isLocale: 5 locale は有効", () => {
  for (const l of ["ja", "en", "zh-hans", "zh-hant", "ko"]) {
    assert.equal(isLocale(l), true, `${l} は有効であるべき`);
  }
});

test("isLocale: /zh は無効（単独中国語は不採用）", () => {
  assert.equal(isLocale("zh"), false);
});

test("isLocale: 未知 locale（fr/de/JA 大文字/空/複合）は無効", () => {
  for (const l of ["fr", "de", "JA", "EN", "", "en/profile", "zh-Hans", "ja "]) {
    assert.equal(isLocale(l), false, `${JSON.stringify(l)} は無効であるべき`);
  }
});

test("zh-hans と zh-hant を混同しない（別 locale）", () => {
  assert.notEqual("zh-hans", "zh-hant");
  assert.equal(isLocale("zh-hans"), true);
  assert.equal(isLocale("zh-hant"), true);
  assert.notEqual(htmlLang("zh-hans"), htmlLang("zh-hant"));
});

test("htmlLang: 内部 locale → BCP-47 の HTML lang", () => {
  assert.equal(htmlLang("ja"), "ja");
  assert.equal(htmlLang("en"), "en");
  assert.equal(htmlLang("zh-hans"), "zh-Hans");
  assert.equal(htmlLang("zh-hant"), "zh-Hant");
  assert.equal(htmlLang("ko"), "ko");
});

test("localePrefix: ja は接頭辞なし・他は /locale", () => {
  assert.equal(localePrefix("ja"), "");
  assert.equal(localePrefix("en"), "/en");
  assert.equal(localePrefix("zh-hans"), "/zh-hans");
  assert.equal(localePrefix("zh-hant"), "/zh-hant");
  assert.equal(localePrefix("ko"), "/ko");
});

test("News は ja のみ（/en/news 等は作らない）", () => {
  assert.deepEqual([...localesWithNews], ["ja"]);
});

// Sprint 41 SEO route helper（canonical / hreflang）の検証。
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildCanonicalUrl, buildLanguageAlternates } from "./routes";
import { locales } from "../i18n/locales";

const SITE = new URL("https://example.com");

test("canonical: ja は接頭辞なし", () => {
  assert.equal(buildCanonicalUrl(SITE, "ja", "home"), "https://example.com/");
  assert.equal(buildCanonicalUrl(SITE, "ja", "profile"), "https://example.com/profile");
  assert.equal(buildCanonicalUrl(SITE, "ja", "gallery"), "https://example.com/gallery");
  assert.equal(buildCanonicalUrl(SITE, "ja", "news"), "https://example.com/news");
});

test("canonical: 外国語は /locale 接頭辞", () => {
  assert.equal(buildCanonicalUrl(SITE, "en", "home"), "https://example.com/en");
  assert.equal(buildCanonicalUrl(SITE, "en", "profile"), "https://example.com/en/profile");
  assert.equal(buildCanonicalUrl(SITE, "zh-hans", "gallery"), "https://example.com/zh-hans/gallery");
  assert.equal(buildCanonicalUrl(SITE, "zh-hant", "gallery"), "https://example.com/zh-hant/gallery");
  assert.equal(buildCanonicalUrl(SITE, "ko", "profile"), "https://example.com/ko/profile");
});

test("canonical に /ja・/zh 単独は現れない", () => {
  for (const l of locales) {
    for (const r of ["home", "profile", "gallery"] as const) {
      const u = buildCanonicalUrl(SITE, l, r);
      assert.equal(/\/ja(\/|$)/.test(u), false, `${u} に /ja`);
      assert.equal(/\/zh(\/|$)/.test(u), false, `${u} に /zh 単独`);
    }
  }
});

test("hreflang: top は 5 locale＋x-default（htmlLang キー・絶対 URL）", () => {
  const alt = buildLanguageAlternates(SITE, "home");
  assert.deepEqual(
    Object.keys(alt).sort(),
    ["en", "ja", "ko", "x-default", "zh-Hans", "zh-Hant"],
  );
  assert.equal(alt["ja"], "https://example.com/");
  assert.equal(alt["en"], "https://example.com/en");
  assert.equal(alt["zh-Hans"], "https://example.com/zh-hans");
  assert.equal(alt["zh-Hant"], "https://example.com/zh-hant");
  assert.equal(alt["ko"], "https://example.com/ko");
  assert.equal(alt["x-default"], "https://example.com/");
});

test("hreflang: profile/gallery も 5 locale＋x-default で相互対称", () => {
  for (const r of ["profile", "gallery"] as const) {
    const alt = buildLanguageAlternates(SITE, r);
    assert.equal(Object.keys(alt).length, 6);
    assert.equal(alt["x-default"], buildCanonicalUrl(SITE, "ja", r));
    assert.equal(alt["en"], buildCanonicalUrl(SITE, "en", r));
    assert.equal(alt["ko"], buildCanonicalUrl(SITE, "ko", r));
  }
});

test("x-default は日本語対応ページ（Sprint 39 D-C）", () => {
  assert.equal(buildLanguageAlternates(SITE, "home")["x-default"], "https://example.com/");
  assert.equal(buildLanguageAlternates(SITE, "profile")["x-default"], "https://example.com/profile");
  assert.equal(buildLanguageAlternates(SITE, "gallery")["x-default"], "https://example.com/gallery");
});

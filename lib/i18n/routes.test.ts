// Sprint 32 locale 別 URL 生成の検証（node:test + node:assert、追加依存なし）。
// この Node は .ts を直接実行できないため、Sprint 30/31 と同様に tsc で CJS へコンパイルして実行する。
import { test } from "node:test";
import assert from "node:assert/strict";
import { routeKeys, isRouteAvailable, localizedPath, languageSwitchTarget } from "./routes";
import { locales } from "./locales";

// ---- パス生成 ----

test("ja は接頭辞なし URL", () => {
  assert.equal(localizedPath("ja", "home"), "/");
  assert.equal(localizedPath("ja", "profile"), "/profile");
  assert.equal(localizedPath("ja", "gallery"), "/gallery");
  assert.equal(localizedPath("ja", "news"), "/news");
});

test("en は /en 接頭辞", () => {
  assert.equal(localizedPath("en", "home"), "/en");
  assert.equal(localizedPath("en", "profile"), "/en/profile");
  assert.equal(localizedPath("en", "gallery"), "/en/gallery");
});

test("zh-hans / zh-hant / ko の接頭辞（簡繁を混同しない）", () => {
  assert.equal(localizedPath("zh-hans", "home"), "/zh-hans");
  assert.equal(localizedPath("zh-hant", "home"), "/zh-hant");
  assert.notEqual(localizedPath("zh-hans", "home"), localizedPath("zh-hant", "home"));
  assert.equal(localizedPath("ko", "gallery"), "/ko/gallery");
});

test("禁止 URL（/ja・/zh）を生成しない", () => {
  for (const route of routeKeys) {
    // ja は接頭辞なしなので "/ja" 始まりは出ない
    assert.equal(localizedPath("ja", route).startsWith("/ja"), false, `ja ${route} が /ja を生成`);
  }
  // "/zh" 単独 locale は存在しない（locales に無い）
  assert.equal(locales.includes("zh" as (typeof locales)[number]), false);
});

// ---- ページ可用性 ----

test("News は ja のみ利用可能", () => {
  assert.equal(isRouteAvailable("ja", "news"), true);
  for (const l of locales) {
    if (l === "ja") continue;
    assert.equal(isRouteAvailable(l, "news"), false, `${l} で News が利用可能になっている`);
  }
});

test("home/profile/gallery は 5 locale すべてで利用可能", () => {
  for (const l of locales) {
    for (const route of ["home", "profile", "gallery"] as const) {
      assert.equal(isRouteAvailable(l, route), true, `${l} ${route} が利用不可`);
    }
  }
});

// ---- 言語切替先 ----

test("言語切替: 同一ページの対象 locale URL へ（home/profile/gallery）", () => {
  assert.equal(languageSwitchTarget("profile", "en"), "/en/profile");
  assert.equal(languageSwitchTarget("profile", "ja"), "/profile");
  assert.equal(languageSwitchTarget("gallery", "zh-hans"), "/zh-hans/gallery");
  assert.equal(languageSwitchTarget("gallery", "ja"), "/gallery");
  assert.equal(languageSwitchTarget("home", "ko"), "/ko");
  assert.equal(languageSwitchTarget("home", "ja"), "/");
});

test("言語切替: News → 外国語は各外国語トップへ（外国語 News URL を作らない）", () => {
  assert.equal(languageSwitchTarget("news", "ja"), "/news");
  assert.equal(languageSwitchTarget("news", "en"), "/en");
  assert.equal(languageSwitchTarget("news", "zh-hans"), "/zh-hans");
  assert.equal(languageSwitchTarget("news", "zh-hant"), "/zh-hant");
  assert.equal(languageSwitchTarget("news", "ko"), "/ko");
});

test("いかなる route×locale の言語切替先も外国語 News（/*/news）を生成しない", () => {
  for (const route of routeKeys) {
    for (const l of locales) {
      const url = languageSwitchTarget(route, l);
      if (l !== "ja") {
        assert.equal(/\/news$/.test(url), false, `${route}->${l} が ${url}（外国語 News）を生成`);
      }
    }
  }
});

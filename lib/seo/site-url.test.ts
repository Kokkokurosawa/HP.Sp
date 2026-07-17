// Sprint 41 SITE_URL helper の検証（node:test + node:assert・追加依存なし）。
// process.env.SITE_URL を書き換えるテストは try/finally で必ず元値へ復元する（§40・並列リーク防止）。
import { test } from "node:test";
import assert from "node:assert/strict";
import { getOptionalSiteUrl, requireSiteUrl } from "./site-url";

/** SITE_URL を一時設定して fn を実行し、必ず元値へ復元する。 */
function withSiteUrl<T>(value: string | undefined, fn: () => T): T {
  const original = process.env.SITE_URL;
  if (value === undefined) delete process.env.SITE_URL;
  else process.env.SITE_URL = value;
  try {
    return fn();
  } finally {
    if (original === undefined) delete process.env.SITE_URL;
    else process.env.SITE_URL = original;
  }
}

test("getOptionalSiteUrl: 未設定は null", () => {
  withSiteUrl(undefined, () => assert.equal(getOptionalSiteUrl(), null));
});

test("getOptionalSiteUrl: 空文字・空白のみは null", () => {
  withSiteUrl("", () => assert.equal(getOptionalSiteUrl(), null));
  withSiteUrl("   ", () => assert.equal(getOptionalSiteUrl(), null));
});

test("getOptionalSiteUrl: 有効な https は URL（origin）", () => {
  withSiteUrl("https://example.com", () => {
    const u = getOptionalSiteUrl();
    assert.ok(u);
    assert.equal(u.origin, "https://example.com");
  });
});

test("getOptionalSiteUrl: 末尾スラッシュを正規化", () => {
  withSiteUrl("https://example.com/", () => {
    assert.equal(getOptionalSiteUrl()?.origin, "https://example.com");
  });
});

test("http は拒否（例外）", () => {
  withSiteUrl("http://example.com", () => assert.throws(() => getOptionalSiteUrl()));
});

test("相対 URL は拒否", () => {
  withSiteUrl("/foo", () => assert.throws(() => getOptionalSiteUrl()));
  withSiteUrl("example.com", () => assert.throws(() => getOptionalSiteUrl()));
});

test("query 付きは拒否", () => {
  withSiteUrl("https://example.com?ref=x", () => assert.throws(() => getOptionalSiteUrl()));
});

test("fragment 付きは拒否", () => {
  withSiteUrl("https://example.com#top", () => assert.throws(() => getOptionalSiteUrl()));
});

test("credentials 付きは拒否", () => {
  withSiteUrl("https://user:pass@example.com", () => assert.throws(() => getOptionalSiteUrl()));
});

test("path 付きは拒否（origin のみ許容）", () => {
  withSiteUrl("https://example.com/sub", () => assert.throws(() => getOptionalSiteUrl()));
});

test("requireSiteUrl: 未設定は例外", () => {
  withSiteUrl(undefined, () => assert.throws(() => requireSiteUrl()));
});

test("requireSiteUrl: 設定時は URL を返す", () => {
  withSiteUrl("https://example.com", () => {
    assert.equal(requireSiteUrl().origin, "https://example.com");
  });
});

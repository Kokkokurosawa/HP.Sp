// Sprint 41 locale 別 metadata 組み立て helper の検証。
// SITE_URL を切り替えるため try/finally で復元する（§40）。
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildLocalizedPageMetadata } from "./metadata";
import { getPageMetadata, type PageMetadataKey } from "../../content/seoMetadata";
import { locales } from "../i18n/locales";

const PAGES: PageMetadataKey[] = ["top", "profile", "gallery"];

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

test("SITE_URL 未設定: alternates と og:url を出さない", () => {
  withSiteUrl(undefined, () => {
    for (const l of locales) {
      const m = buildLocalizedPageMetadata(l, "top");
      assert.equal(m.alternates, undefined);
      assert.equal(m.openGraph?.url, undefined);
    }
  });
});

test("SITE_URL 設定: canonical/hreflang/og:url を出す", () => {
  withSiteUrl("https://example.com", () => {
    const m = buildLocalizedPageMetadata("en", "gallery");
    assert.equal(m.alternates?.canonical, "https://example.com/en/gallery");
    assert.equal(m.alternates?.languages?.["zh-Hant"], "https://example.com/zh-hant/gallery");
    assert.equal(m.alternates?.languages?.["x-default"], "https://example.com/gallery");
    assert.equal(m.openGraph?.url, "https://example.com/en/gallery");
  });
});

test("title/description は seoMetadata を共用（OG/Twitter も同値・全 locale×page）", () => {
  withSiteUrl(undefined, () => {
    for (const l of locales) {
      for (const p of PAGES) {
        const copy = getPageMetadata(l, p);
        const m = buildLocalizedPageMetadata(l, p);
        assert.deepEqual(m.title, { absolute: copy.title });
        assert.equal(m.description, copy.description);
        assert.equal(m.openGraph?.title, copy.title);
        assert.equal(m.openGraph?.description, copy.description);
        assert.equal(m.twitter?.title, copy.title);
        assert.equal(m.twitter?.description, copy.description);
      }
    }
  });
});

test("robots: ja は indexable / 外国語は noindex,nofollow", () => {
  withSiteUrl(undefined, () => {
    assert.equal(buildLocalizedPageMetadata("ja", "top").robots, undefined);
    assert.equal(buildLocalizedPageMetadata("ja", "profile").robots, undefined);
    assert.equal(buildLocalizedPageMetadata("ja", "gallery").robots, undefined);
    for (const l of ["en", "zh-hans", "zh-hant", "ko"] as const) {
      assert.deepEqual(buildLocalizedPageMetadata(l, "top").robots, {
        index: false,
        follow: false,
      });
    }
  });
});

test("og:locale は locale 別（HTML lang と別）", () => {
  withSiteUrl(undefined, () => {
    assert.equal(buildLocalizedPageMetadata("ja", "top").openGraph?.locale, "ja_JP");
    assert.equal(buildLocalizedPageMetadata("en", "top").openGraph?.locale, "en_US");
    assert.equal(buildLocalizedPageMetadata("zh-hans", "top").openGraph?.locale, "zh_CN");
    assert.equal(buildLocalizedPageMetadata("zh-hant", "top").openGraph?.locale, "zh_TW");
    assert.equal(buildLocalizedPageMetadata("ko", "top").openGraph?.locale, "ko_KR");
  });
});

test("OG 画像を維持（1 枚・siteConfig 由来）", () => {
  withSiteUrl(undefined, () => {
    const imgs = buildLocalizedPageMetadata("en", "top").openGraph?.images;
    assert.ok(Array.isArray(imgs));
    assert.equal(imgs.length, 1);
  });
});

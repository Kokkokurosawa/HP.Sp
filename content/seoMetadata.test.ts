// Sprint 40 ページ別 metadata（title/description）の検証（node:test + node:assert・追加依存なし）。
// 実行は既存方式（プロジェクト tsc で CJS へコンパイル → `@/` resolver shim 付き node --test）。
// locale/本文との整合を見るため相対 import を使う（`@/` は node 実行時に shim で解決）。
import { test } from "node:test";
import assert from "node:assert/strict";
import { getPageMetadata, type PageMetadataKey } from "./seoMetadata";
import { getProfile } from "./profileContent";
import { getGalleryContent } from "./galleryContent";
import { profile } from "./profile";
import { siteConfig } from "../config/site";
import { locales } from "../lib/i18n/locales";

const PAGES: PageMetadataKey[] = ["top", "profile", "gallery"];

// ---- データ構造 ----

test("5 locale × top/profile/gallery すべてに title/description が存在する（非空 string）", () => {
  for (const l of locales) {
    for (const p of PAGES) {
      const c = getPageMetadata(l, p);
      assert.equal(typeof c.title, "string");
      assert.equal(typeof c.description, "string");
      assert.ok(c.title.length > 0, `${l}/${p} title 空`);
      assert.ok(c.description.length > 0, `${l}/${p} description 空`);
    }
  }
});

test("日本語への黙示 fallback がない（外国語は ja と異なる固有値）", () => {
  for (const l of locales) {
    if (l === "ja") continue;
    for (const p of PAGES) {
      const f = getPageMetadata(l, p);
      const j = getPageMetadata("ja", p);
      assert.notEqual(f.title, j.title, `${l}/${p} title が ja へ fallback`);
      assert.notEqual(f.description, j.description, `${l}/${p} description が ja へ fallback`);
    }
  }
});

// ---- 日本語 byte 一致（M01〜M06 の最終出力を再現） ----

test("日本語 metadata が既存の最終出力と byte 一致（M01〜M06）", () => {
  const top = getPageMetadata("ja", "top");
  assert.equal(top.title, siteConfig.siteName); // M01
  assert.equal(top.description, siteConfig.description); // M02

  const prof = getPageMetadata("ja", "profile");
  assert.equal(prof.title, `プロフィール | ${siteConfig.siteName}`); // M03
  assert.equal(
    prof.description,
    `${siteConfig.characterName}のプロフィール。${profile.intro.join("")}`,
  ); // M04

  const gal = getPageMetadata("ja", "gallery");
  assert.equal(gal.title, `ギャラリー | ${siteConfig.siteName}`); // M05
  assert.equal(
    gal.description,
    `${siteConfig.characterName}のイラストギャラリー。準備ができ次第、すこしずつ公開していきます。`,
  ); // M06
});

// ---- 外国語 title に日本語ブランドを残さない（Sprint 40 D-C） ----

test("外国語 title に日本語ブランド（すぴたろう / 公式サイト）が含まれない", () => {
  for (const l of locales) {
    if (l === "ja") continue;
    for (const p of PAGES) {
      const title: string = getPageMetadata(l, p).title;
      assert.equal(title.includes("すぴたろう"), false, `${l}/${p} title に すぴたろう`);
      assert.equal(title.includes("公式サイト"), false, `${l}/${p} title に 公式サイト`);
      assert.ok(title.includes("Supitaro"), `${l}/${p} title に Supitaro が無い`);
    }
  }
});

// ---- title が承認済みページ見出しと整合（Sprint 34/35/37） ----

test("gallery/profile title が承認済みページ見出しで始まる（nav↔page↔metadata 整合）", () => {
  for (const l of locales) {
    assert.ok(
      getPageMetadata(l, "gallery").title.startsWith(getGalleryContent(l).strings.pageTitle),
      `${l} gallery title が Gallery 見出しで始まらない`,
    );
    assert.ok(
      getPageMetadata(l, "profile").title.startsWith(getProfile(l).pageTitle),
      `${l} profile title が Profile 見出しで始まらない`,
    );
  }
});

// ---- 承認済み外国語値（Sprint 40 D-A）と簡繁独立・Gallery 用語 ----

test("承認済み外国語 title（EN/ZH-HANS/ZH-HANT/KO）", () => {
  assert.equal(getPageMetadata("en", "top").title, "Supitaro — A Mysterious Creature from Outer Space");
  assert.equal(getPageMetadata("en", "profile").title, "Profile | Supitaro");
  assert.equal(getPageMetadata("en", "gallery").title, "Gallery | Supitaro");
  assert.equal(getPageMetadata("ko", "profile").title, "프로필 | Supitaro");
  // Gallery 用語は 画廊 / 畫廊（图库 / 圖庫 へ戻さない・Sprint 37 D-GAL）。
  assert.equal(getPageMetadata("zh-hans", "gallery").title, "画廊 | Supitaro");
  assert.equal(getPageMetadata("zh-hant", "gallery").title, "畫廊 | Supitaro");
});

test("簡体字と繁体字が独立（値が異なる・机械変換でない）", () => {
  for (const p of PAGES) {
    assert.notEqual(
      getPageMetadata("zh-hans", p).title,
      getPageMetadata("zh-hant", p).title,
      `${p} zh title が簡繁同一`,
    );
    assert.notEqual(
      getPageMetadata("zh-hans", p).description,
      getPageMetadata("zh-hant", p).description,
      `${p} zh description が簡繁同一`,
    );
  }
  // Gallery 用語の混在なし。
  const hansGal = getPageMetadata("zh-hans", "gallery");
  const hantGal = getPageMetadata("zh-hant", "gallery");
  assert.ok(hansGal.title.includes("画廊") && !hansGal.title.includes("圖庫"));
  assert.ok(hantGal.title.includes("畫廊") && !hantGal.title.includes("图库"));
});

test("承認済み外国語 description の代表値（本文承認表現の再構成）", () => {
  assert.equal(
    getPageMetadata("en", "gallery").description,
    "An illustration gallery of Supitaro and friends. New artwork is shared little by little as it becomes ready.",
  );
  assert.equal(
    getPageMetadata("zh-hant", "gallery").description,
    "Supitaro 們的插畫畫廊。圖片準備好後，會一點一點地公開。",
  );
});

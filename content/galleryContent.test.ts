// Sprint 35 ギャラリー本文（5 locale）の検証（node:test + node:assert、追加依存なし）。
// この Node は .ts 直接実行不可のため、Sprint 30〜34 と同様に tsc で CJS へコンパイルして実行する。
// galleryContent.ts は @/content/gallery を value import するため、実行時は scratch の alias shim を使う。
import { test } from "node:test";
import assert from "node:assert/strict";
import { getGalleryContent } from "./galleryContent";
import { getPublishedGalleryItems } from "./gallery";
import { locales } from "../lib/i18n/locales";

const isStr = (v: unknown): boolean => typeof v === "string" && v.length > 0;

// 簡体字 / 繁体字のクロスコンタミ検出用（ギャラリー本文に実在する用字のみ）。
const HANS_ONLY = ["画", "这", "们", "图", "关", "设", "计", "环", "绕", "蓝", "额", "进"];
const HANT_ONLY = ["畫", "這", "們", "圖", "關", "設", "計", "環", "繞", "藍", "額", "進", "檢"];

const fullText = (l: (typeof locales)[number]): string => {
  const { strings, items } = getGalleryContent(l);
  return [
    strings.pageTitle,
    strings.lead,
    strings.viewLarger,
    strings.closeLabel,
    strings.preview.heading,
    strings.preview.lead,
    strings.preview.cta,
    ...items.flatMap((it) => [it.title ?? "", it.alt, it.openLabel]),
  ].join(" ");
};

const registryIds = getPublishedGalleryItems().map((i) => i.id);

test("5 locale すべてにギャラリー本文が存在", () => {
  for (const l of locales) {
    const c = getGalleryContent(l);
    assert.ok(c, `${l} の gallery が無い`);
    assert.ok(Array.isArray(c.items), `${l} items 配列`);
  }
});

test("全 locale が同一の UI 構造（必須フィールド・型）", () => {
  for (const l of locales) {
    const { strings } = getGalleryContent(l);
    assert.ok(isStr(strings.pageTitle), `${l} pageTitle`);
    assert.ok(isStr(strings.lead), `${l} lead`);
    assert.ok(isStr(strings.viewLarger), `${l} viewLarger`);
    assert.ok(isStr(strings.closeLabel), `${l} closeLabel`);
    assert.ok(isStr(strings.preview.heading), `${l} preview.heading`);
    assert.ok(isStr(strings.preview.lead), `${l} preview.lead`);
    assert.ok(isStr(strings.preview.cta), `${l} preview.cta`);
  }
});

test("作品は全 locale で同数・同一 id・同一順序（台帳と一致）", () => {
  for (const l of locales) {
    assert.deepEqual(
      getGalleryContent(l).items.map((it) => it.id),
      registryIds,
      `${l} の作品 id / 順序`,
    );
  }
});

test("画像 src は全 locale で一致（画像共有・5 重複しない）", () => {
  const jaSrc = getGalleryContent("ja").items.map((it) => it.src);
  for (const l of locales) {
    assert.deepEqual(
      getGalleryContent(l).items.map((it) => it.src),
      jaSrc,
      `${l} の src が locale 間で不一致`,
    );
  }
});

test("全作品に title / alt / openLabel が存在（全 locale）", () => {
  for (const l of locales) {
    for (const it of getGalleryContent(l).items) {
      assert.ok(isStr(it.id), `${l} item.id`);
      assert.ok(isStr(it.alt), `${l} item.alt`);
      assert.ok(isStr(it.openLabel), `${l} item.openLabel`);
      // 現行の唯一の作品は title を持つ（title が付く作品は全 locale で付く）。
      assert.ok(isStr(it.title), `${l} item.title`);
    }
  }
});

test("日本語ギャラリーが既存 source of truth と一致（回帰ガード）", () => {
  const registry = getPublishedGalleryItems();
  const ja = getGalleryContent("ja");
  // title / alt / src は content/gallery.ts を参照（二重定義なし）。
  ja.items.forEach((view, idx) => {
    const src = registry[idx];
    assert.equal(view.title, src.title?.ja, `ja title[${idx}]`);
    assert.equal(view.alt, src.image.alt, `ja alt[${idx}]`);
    assert.equal(view.src, src.image.src, `ja src[${idx}]`);
    assert.equal(view.openLabel, `${src.title?.ja ?? src.image.alt}を大きく見る`, `ja openLabel[${idx}]`);
  });
  // JSX / コンポーネントから移設した UI 文言（表示は不変・byte 一致）。
  assert.equal(ja.strings.pageTitle, "ギャラリー");
  assert.equal(
    ja.strings.lead,
    "すぴたろうたちのイラストを集めていく場所です。公開が承認された画像だけを、すこしずつ追加していきます。",
  );
  assert.equal(ja.strings.viewLarger, "大きく見る");
  assert.equal(ja.strings.closeLabel, "画像を閉じる");
  assert.equal(ja.strings.preview.heading, "デザインギャラリー");
  assert.equal(ja.strings.preview.lead, "すぴたろうのデザインを、すこしだけ。");
  assert.equal(ja.strings.preview.cta, "ギャラリーを見る");
});

test("外国語は日本語へ黙示 fallback しない（title/alt/見出しが ja と異なる）", () => {
  const ja = getGalleryContent("ja");
  const jaTitle0 = ja.items[0].title;
  const jaAlt0 = ja.items[0].alt;
  const jaPageTitle = ja.strings.pageTitle;
  for (const l of locales) {
    if (l === "ja") continue;
    const c = getGalleryContent(l);
    assert.notEqual(c.items[0].title, jaTitle0, `${l} title が ja へ fallback`);
    assert.notEqual(c.items[0].alt, jaAlt0, `${l} alt が ja へ fallback`);
    assert.notEqual(c.strings.pageTitle, jaPageTitle, `${l} pageTitle が ja へ fallback`);
    // 作品タイトルは Supitaro を維持（D-A）。
    assert.ok((c.items[0].title ?? "").includes("Supitaro"), `${l} title に Supitaro なし`);
  }
});

test("簡体字と繁体字は別本文・用字が独立（クロスコンタミなし）", () => {
  const hans = getGalleryContent("zh-hans");
  const hant = getGalleryContent("zh-hant");
  assert.notEqual(hans.strings.pageTitle, hant.strings.pageTitle); // 画廊 ≠ 畫廊
  assert.notEqual(hans.strings.viewLarger, hant.strings.viewLarger); // 放大查看 ≠ 放大檢視
  const hansText = fullText("zh-hans");
  const hantText = fullText("zh-hant");
  const hansBad = HANT_ONLY.filter((c) => hansText.includes(c));
  const hantBad = HANS_ONLY.filter((c) => hantText.includes(c));
  assert.deepEqual(hansBad, [], `zh-hans に繁体字混入: ${hansBad.join("")}`);
  assert.deepEqual(hantBad, [], `zh-hant に簡体字混入: ${hantBad.join("")}`);
});

test("外国語ギャラリーの主要文言（承認済み）", () => {
  assert.equal(getGalleryContent("en").strings.pageTitle, "Gallery");
  assert.equal(getGalleryContent("en").strings.closeLabel, "Close image");
  assert.equal(getGalleryContent("en").items[0].title, "Supitaro Design Art");
  assert.equal(getGalleryContent("en").items[0].openLabel, "View Supitaro Design Art larger");
  assert.equal(getGalleryContent("zh-hans").strings.pageTitle, "画廊");
  assert.equal(getGalleryContent("zh-hans").items[0].title, "Supitaro 设计原画");
  assert.equal(getGalleryContent("zh-hant").strings.pageTitle, "畫廊");
  assert.equal(getGalleryContent("zh-hant").items[0].title, "Supitaro 設計原畫");
  assert.equal(getGalleryContent("ko").strings.viewLarger, "크게 보기");
  assert.equal(getGalleryContent("ko").items[0].openLabel, "Supitaro 디자인 아트 크게 보기");
});

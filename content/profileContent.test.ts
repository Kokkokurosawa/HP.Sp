// Sprint 34 プロフィール本文（5 locale）の検証（node:test + node:assert、追加依存なし）。
// この Node は .ts 直接実行不可のため、Sprint 30〜33 と同様に tsc で CJS へコンパイルして実行する。
import { test } from "node:test";
import assert from "node:assert/strict";
import { getProfile } from "./profileContent";
import { profile } from "./profile";
import { siteConfig } from "../config/site";
import { locales } from "../lib/i18n/locales";

const isStr = (v: unknown): boolean => typeof v === "string" && v.length > 0;
const TRAIT_IDS = ["origin", "creature", "likes", "streaming"];

// 簡体字 / 繁体字のクロスコンタミ検出用（プロフィール本文に実在する用字のみ）。
const HANS_ONLY = ["关", "简", "详", "从", "东", "圆", "认", "戏", "会", "头", "样"];
const HANT_ONLY = ["關", "簡", "詳", "從", "東", "圓", "認", "戲", "會", "頭", "樣", "牠"];

const fullText = (l: (typeof locales)[number]): string => {
  const p = getProfile(l);
  return [
    p.pageTitle,
    p.imageAlt,
    p.name,
    ...p.intro,
    p.traits.heading,
    p.traits.lead,
    p.traits.moreLabel,
    p.traits.closeLabel,
    ...p.traits.items.flatMap((t) => [t.label, t.summary, t.detail]),
    p.words.heading,
    p.words.lead,
    p.upcoming.heading,
    p.upcoming.emptyNotice,
  ].join(" ");
};

test("5 locale すべてにプロフィール本文が存在", () => {
  for (const l of locales) assert.ok(getProfile(l), `${l} の profile が無い`);
});

test("全 locale が同一のプロフィール構造（必須フィールド・型）", () => {
  for (const l of locales) {
    const p = getProfile(l);
    assert.ok(isStr(p.pageTitle), `${l} pageTitle`);
    assert.ok(isStr(p.imageAlt), `${l} imageAlt`);
    assert.ok(isStr(p.name), `${l} name`);
    assert.ok(
      Array.isArray(p.intro) && p.intro.length === 3 && p.intro.every(isStr),
      `${l} intro`,
    );
    assert.ok(isStr(p.traits.heading), `${l} traits.heading`);
    assert.ok(isStr(p.traits.lead), `${l} traits.lead`);
    assert.ok(isStr(p.traits.moreLabel), `${l} traits.moreLabel`);
    assert.ok(isStr(p.traits.closeLabel), `${l} traits.closeLabel`);
    assert.ok(
      Array.isArray(p.traits.items) && p.traits.items.length === 4,
      `${l} traits.items 数`,
    );
    for (const t of p.traits.items) {
      assert.ok(isStr(t.id) && isStr(t.label) && isStr(t.summary) && isStr(t.detail), `${l} trait 欠落`);
    }
    assert.ok(isStr(p.words.heading), `${l} words.heading`);
    assert.ok(isStr(p.words.lead), `${l} words.lead`);
    assert.ok(
      Array.isArray(p.words.items) && p.words.items.length === 6 && p.words.items.every(isStr),
      `${l} words.items`,
    );
    assert.ok(isStr(p.upcoming.heading), `${l} upcoming.heading`);
    assert.ok(isStr(p.upcoming.emptyNotice), `${l} upcoming.emptyNotice`);
    assert.ok(Array.isArray(p.upcoming.items), `${l} upcoming.items`);
  }
});

test("トレイトは全 locale で 4 件・同一 id・同一順序", () => {
  for (const l of locales) {
    assert.deepEqual(
      getProfile(l).traits.items.map((t) => t.id),
      TRAIT_IDS,
      `${l} の trait id / 順序`,
    );
  }
});

test("words 口癖 6 個は全 locale で日本語維持（D-A）", () => {
  for (const l of locales) {
    assert.deepEqual(getProfile(l).words.items, profile.words, `${l} の words`);
  }
});

test("日本語プロフィールが既存 source of truth と一致（回帰ガード）", () => {
  const ja = getProfile("ja");
  // name / intro / traits / words / upcoming は content/profile.ts を参照（二重定義なし）。
  assert.equal(ja.name, profile.name);
  assert.deepEqual(ja.intro, profile.intro);
  assert.deepEqual(ja.traits.items, profile.traits);
  assert.deepEqual(ja.words.items, profile.words);
  assert.deepEqual(ja.upcoming.items, profile.upcoming);
  // 画像 alt は siteConfig を参照。
  assert.equal(ja.imageAlt, siteConfig.images.profile.alt);
  // JSX / コンポーネントから移設した UI 文言（表示は不変・byte 一致）。
  assert.equal(ja.pageTitle, "プロフィール");
  assert.equal(ja.traits.heading, "すぴたろうのこと");
  assert.equal(ja.traits.lead, "気になる項目をえらぶと、すぴたろうのことをすこしずつ知れます。");
  assert.equal(ja.traits.moreLabel, "くわしく見る");
  assert.equal(ja.traits.closeLabel, "閉じる");
  assert.equal(ja.words.heading, "すぴたろうの言葉");
  assert.equal(ja.words.lead, "すぴたろうは、人間が完全には理解できない独自の言葉を話します。");
  assert.equal(ja.upcoming.heading, "くわしい設定");
  assert.equal(ja.upcoming.emptyNotice, "準備中です。すこしずつ増えていきます。");
});

test("外国語は日本語へ黙示 fallback しない（name=Supitaro・見出しが ja と異なる）", () => {
  const jaHeading = getProfile("ja").traits.heading;
  const jaTitle = getProfile("ja").pageTitle;
  for (const l of locales) {
    if (l === "ja") continue;
    assert.equal(getProfile(l).name, "Supitaro", `${l} name`);
    assert.notEqual(getProfile(l).traits.heading, jaHeading, `${l} traits.heading が ja へ fallback`);
    assert.notEqual(getProfile(l).pageTitle, jaTitle, `${l} pageTitle が ja へ fallback`);
  }
});

test("簡体字と繁体字は別本文・用字が独立（クロスコンタミなし）", () => {
  const hans = getProfile("zh-hans");
  const hant = getProfile("zh-hant");
  assert.notEqual(hans.pageTitle, hant.pageTitle); // 简介 ≠ 簡介
  assert.notEqual(hans.traits.heading, hant.traits.heading); // 关于 ≠ 關於
  const hansText = fullText("zh-hans");
  const hantText = fullText("zh-hant");
  const hansBad = HANT_ONLY.filter((c) => hansText.includes(c));
  const hantBad = HANS_ONLY.filter((c) => hantText.includes(c));
  assert.deepEqual(hansBad, [], `zh-hans に繁体字混入: ${hansBad.join("")}`);
  assert.deepEqual(hantBad, [], `zh-hant に簡体字混入: ${hantBad.join("")}`);
});

test("外国語プロフィールの主要文言（承認済み）", () => {
  assert.equal(getProfile("en").pageTitle, "Profile");
  assert.equal(getProfile("en").traits.items[0].label, "Where are you from?");
  assert.equal(getProfile("en").traits.closeLabel, "Close");
  assert.equal(getProfile("zh-hans").pageTitle, "简介");
  assert.equal(getProfile("zh-hans").upcoming.heading, "详细设定");
  assert.equal(getProfile("zh-hant").pageTitle, "簡介");
  assert.equal(getProfile("ko").traits.moreLabel, "자세히 보기");
});

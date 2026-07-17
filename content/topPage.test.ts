// Sprint 33 トップページ本文（5 locale）の検証（node:test + node:assert、追加依存なし）。
// この Node は .ts 直接実行不可のため、Sprint 30〜32 と同様に tsc で CJS へコンパイルして実行する。
import { test } from "node:test";
import assert from "node:assert/strict";
import { getTopPage } from "./topPage";
import { locales } from "../lib/i18n/locales";

const isStr = (v: unknown): boolean => typeof v === "string" && v.length > 0;

test("5 locale すべてにトップページ本文が存在", () => {
  for (const l of locales) assert.ok(getTopPage(l), `${l} の topPage が無い`);
});

test("全 locale が同一のトップ構造（必須フィールド・型）", () => {
  for (const l of locales) {
    const t = getTopPage(l);
    assert.ok(isStr(t.hero.tagline), `${l} hero.tagline`);
    assert.ok(
      Array.isArray(t.hero.heading) && t.hero.heading.length >= 1 && t.hero.heading.every(isStr),
      `${l} hero.heading`,
    );
    assert.ok(isStr(t.hero.subtext), `${l} hero.subtext`);
    assert.ok(isStr(t.hero.imageAlt), `${l} hero.imageAlt`);
    assert.ok(isStr(t.hero.watchOnYoutube), `${l} hero.watchOnYoutube`);
    assert.ok(isStr(t.hero.viewProfile), `${l} hero.viewProfile`);
    assert.ok(isStr(t.intro.heading), `${l} intro.heading`);
    assert.ok(
      Array.isArray(t.intro.lines) && t.intro.lines.length === 3 && t.intro.lines.every(isStr),
      `${l} intro.lines`,
    );
    assert.ok(isStr(t.intro.more), `${l} intro.more`);
    assert.ok(isStr(t.channels.heading), `${l} channels.heading`);
    assert.ok(isStr(t.channels.youtubeCta), `${l} channels.youtubeCta`);
    assert.ok(isStr(t.channels.youtubeDesc), `${l} channels.youtubeDesc`);
    assert.ok(isStr(t.channels.xCta), `${l} channels.xCta`);
    assert.ok(isStr(t.channels.xDesc), `${l} channels.xDesc`);
  }
});

test("口癖 tagline は全 locale で日本語維持（D-B）", () => {
  for (const l of locales) assert.equal(getTopPage(l).hero.tagline, "おぱぁ。");
});

test("日本語トップ本文が既存表示と完全一致（回帰ガード）", () => {
  const ja = getTopPage("ja");
  assert.deepEqual(ja.hero.heading, ["宇宙から来た、", "ふしぎないきもの。"]);
  assert.equal(ja.hero.subtext, "すぴたろうのこと、すこしだけ、のぞいてみませんか。");
  assert.equal(
    ja.hero.imageAlt,
    "白い体に青い目、額の青いひし形、青い耳と尻尾を持つ、すぴたろうの全身イラスト",
  );
  assert.equal(ja.hero.watchOnYoutube, "YouTubeで配信を見る");
  assert.equal(ja.hero.viewProfile, "プロフィールを見る");
  assert.equal(ja.intro.heading, "すぴたろうって？");
  assert.deepEqual(ja.intro.lines, [
    "宇宙から来た、ふしぎないきもの。",
    "丸いものが好き。",
    "家主の留守中に、こっそりゲーム配信をしている。",
  ]);
  assert.equal(ja.intro.more, "もっとくわしく");
  assert.equal(ja.channels.heading, "チャンネル");
  assert.equal(ja.channels.youtubeCta, "YouTubeで配信を見る");
  assert.equal(ja.channels.youtubeDesc, "こっそりゲーム配信をしているチャンネル");
  assert.equal(ja.channels.xCta, "Xで活動を追う");
  assert.equal(ja.channels.xDesc, "公式アカウント");
});

test("外国語は日本語へ黙示 fallback しない（intro.heading が ja と異なる）", () => {
  const jaHeading = getTopPage("ja").intro.heading;
  for (const l of locales) {
    if (l === "ja") continue;
    assert.notEqual(getTopPage(l).intro.heading, jaHeading, `${l} が日本語へ fallback`);
  }
});

test("簡体字と繁体字は別本文（用字が異なる）", () => {
  const hans = getTopPage("zh-hans");
  const hant = getTopPage("zh-hant");
  assert.notEqual(hans, hant);
  assert.equal(hans.channels.heading, "频道");
  assert.equal(hant.channels.heading, "頻道");
  assert.notEqual(hans.channels.heading, hant.channels.heading);
});

test("英語トップの主要文言（承認済み）", () => {
  const en = getTopPage("en");
  assert.equal(en.intro.heading, "Who is Supitaro?");
  assert.equal(en.hero.viewProfile, "View profile");
  assert.equal(en.channels.xDesc, "Official account");
});

# Sprint 33 Phase B — 多言語トップページ実装

Verdict: **MULTILINGUAL_TOP_PAGE_IMPLEMENTED**

## 1. Purpose

Sprint 33 Phase A で人間承認された翻訳（EN/ZH-HANS/ZH-HANT/KO）を用い、トップページを 5 locale 対応へ移行する。
外国語トップの noindex scaffold を各言語の正式トップページ本文へ置換する。単一関心事＝トップページ本文の多言語化。
Profile/Gallery/News 本文・metadata・404 は対象外。

## 2. Baseline

```text
branch = main / working tree = clean（着手時）
local HEAD = origin/main = remote ref = 6edfa7cd59c4c17fced1892611505bb73b05b1b4
latest commit = feat: add locale-aware navigation and language switcher
```

## 3. Decision-of-record references

Sprint 27（decision of record）/28/29/30/31/32。加えて本 Sprint Phase A（`docs/sprints/sprint-33-top-page-translation-review.md`）の
人間決定 D-A〜D-F と 4 言語 APPROVE。

## 4. Japanese source inventory

Phase A で抽出（同レビュー文書 §3）。トップ可視文字列 20 種（T01–T20）。本 Sprintで実際に反映したのは、外国語トップに
表示されるセクション（Hero・紹介・チャンネル）の文言。D-C/D-D/D-E により Gallery プレビュー内・News・FOLLOW aria・
外部リンク注記は本 Sprint 対象外（後述）。

## 5. Translation review process

Phase A: 日本語抽出 → 4 言語 AI 初稿 → レビュー文書化 → 人間確認依頼 → 停止。Phase B: 人間 APPROVE（全 4 言語）＋
D-A〜D-F 確定を受領 → 承認済み文言のみ実装（Sprint 27 D-03/D-06 遵守）。

## 6. Human approvals

`EN=APPROVE / ZH-HANS=APPROVE / ZH-HANT=APPROVE / KO=APPROVE`（報告訳文をそのまま承認）。決定:
D-A=Supitaro（全外国語）／D-B=①おぱぁ。日本語維持／D-C=A News 非表示／D-D=Sprint 35 まで Gallery プレビュー非表示／
D-E=(b) FOLLOW aria 延期・トップ固有のみ／D-F=全 4 言語一括。

## 7. Proper-noun decisions

- 名称: 外国語では `Supitaro`（D-A）。zh も Latin `Supitaro`。
- 口癖 `おぱぁ。`(T01): 全 locale で日本語維持（D-B。翻訳・ローマ字化しない）。`content/topPage.ts` の全 locale `hero.tagline="おぱぁ。"`。
- `YouTube`/`X`/`Twitch`/`FOLLOW`: 正式表記維持。

## 8. Top-page content model

**§15 Option B+C を採用**（型付きトップ locale コンテンツ ＋ Server から props）。新規 `content/topPage.ts`:
- 型 `TopPageContent`（hero{tagline, heading: string[], subtext, imageAlt, watchOnYoutube, viewProfile}, intro{heading, lines: string[], more}, channels{heading, youtubeCta, youtubeDesc, xCta, xDesc}）。
- ja（正本・byte 一致）＋ en/zh-hans/zh-hant/ko（各 `satisfies TopPageContent`）。`Record<Locale, TopPageContent>` ＋ `getTopPage(locale)`。
- 未知 locale を受け付けず、日本語黙示 fallback なし。runtime fetch なし・Server 同期・静的生成維持。
- `hero.heading` は string[]（ja=2 セグメントで読点後にモバイル改行 `<br sm:hidden>`、外国語=1 セグメント）＝ja の既存改行を保持しつつ外国語に対応。
- News/Gallery プレビューはトップ本文モデルに含めない（ページ側で ja のみ描画。D-C/D-D）。
- `any`・`Record<string,any>`・unsafe cast・runtime fetch・ja fallback・optional 欠落隠蔽は不使用。localeごとのページ複製・巨大 JSX 分岐なし。

編集コンテンツ（トップ本文）は `content/topPage.ts`、UI 定型文は `content/i18n`（辞書）と責務分離（§16）。

## 9. English implementation
`/en` 実配信: h1「A mysterious creature from outer space.」、subtext「Care to take a little peek at Supitaro?」、
CTA「Watch on YouTube」「View profile」、紹介「Who is Supitaro?」＋3 行、チャンネル「Channels」ほか。scaffold 除去済み・h1 あり・noindex。

## 10. Simplified Chinese implementation
`/zh-hans`: h1「来自宇宙的奇妙生物。」、「Supitaro 是谁？」、「频道」「官方账号」等。簡体字のみ（繁体字混在なし＝監査で確認）。

## 11. Traditional Chinese implementation
`/zh-hant`: h1「來自宇宙的奇妙生物。」、「Supitaro 是誰？」、「頻道」「官方帳號」等。繁体字のみ（簡体字混在なし＝監査で確認）。簡繁は機械変換でなく個別用字。

## 12. Korean implementation
`/ko`: h1「우주에서 온 신기한 생물.」、「Supitaro는 누구?」、「채널」「공식 계정」等。해요体で統一。

## 13. Japanese regression

日本語トップ `/` は従来と同一描画。`getTopPage("ja")` の値は既存表示文言と byte 一致（テスト＋監査で確認）。Hero 口癖・h1
（読点後モバイル改行含む）・subtext・CTA・紹介・チャンネル・Gallery プレビュー・FOLLOW・News・セクション順序・URL・デザインすべて不変。

## 14. News-section policy

D-C＝Option A。外国語トップでは News セクションを描画しない（`showJapaneseOnlySections = locale === "ja"` で gate）。日本語 News への
リンクも、存在しない外国語 News（/en/news 等＝404 契約）への誘導もしない。日本語トップの News は従来どおり表示。

## 15. Scaffold removal

home ルートについてのみ、承認済み 4 外国語で `LocaleScaffold` を撤去し正式トップ本文へ置換（§17・D-F 一括）。
`LocaleScaffold` コンポーネント自体は残す（`/[locale]/profile`・`/gallery` が引き続き使用＝Sprint 34/35 対象）。
Sprint 29 non-blocking の「外国語 scaffold の h1 欠落」はトップで h1 が入り解消（§29）。

## 16. noindex policy

外国語トップは **noindex を維持**（generateMetadata は非 ja で `robots:{index:false,follow:false}` を返す。無変更）。
理由: プロフィール/ギャラリー本文・言語別 metadata・canonical・hreflang・sitemap・独自ドメインが未整備で、検索公開は
別 Sprint で整備後に判断するため（§18）。noindex の解除はしていない。

## 17. Server and Client Component boundary

トップ本文は Server（page.tsx）で `getTopPage(locale)` を解決し、Hero/CharacterIntroduction/ChannelLinks（Server）へ text を props で渡す。
Client の FloatingSupitaro には alt 文字列のみ、HomeGallerySection/GalleryLightbox は ja のみ（従来どおり）。usePathname による本文切替なし・
hydration 後の言語切替なし・runtime fetch なし・辞書全体を Client へ渡さない。

## 18. No-JS behavior

外国語トップは JavaScript 無効でも本文（Hero・紹介・FOLLOW・チャンネル・Footer・言語切替）が表示される（監査: /en・/ko No-JS で
本文全提示・h1 あり・scaffold なし・横スクロール 0）。翻訳は Server 解決のため No-JS 非依存。

## 19. Accessibility

各外国語トップに `<html lang>`（en/zh-Hans/zh-Hant/ko）＋ h1（1 個）＋ section 見出し。Hero 画像 alt は locale 別。
Header/Footer/言語切替は Sprint 31/32 の locale 別 UI。h1 欠落（Sprint 29 finding）解消。keyboard/focus/reduced-motion は既存挙動維持。
**既知の日本語残**（本 Sprint 対象外・D-E/D-D）: FOLLOW アイコンの aria（共通 SocialFollowLinks）、外部リンク注記 sr-only（共通 Button）。

## 20. Tests

- `content/topPage.test.ts`（新規 8 件）: 5 locale 存在／全 locale 同一構造（必須フィールド・型・intro.lines 3 行）／tagline 全 locale「おぱぁ。」／
  **日本語本文 byte 一致（回帰ガード）**／日本語黙示 fallback なし／簡繁別本文（频道≠頻道）／英語主要文言。
- 既存 routes/dictionary/locales テストも併走。node は `.ts` 直接実行不可のため Sprint 30〜32 同様 tsc→CJS→`node --test`。
- Hero/紹介/チャンネルの描画は React テスト基盤未導入（package 追加禁止）のため実ブラウザ監査を同等の検証とする。

## 21. Validation results

```text
lint  (eslint)        : exit 0
test  (node --test)   : 43/43 pass（topPage 8 + routes 9 + dictionary 18 + locales 9 相当）
typecheck (tsc --noEmit): exit 0
build (next build)    : exit 0 / 19 static pages / 全 Static・SSG / News は /ja/news のみ
git diff --check      : exit 0
```

## 22. Browser audit

ローカル production（`next start`）+ playwright-core + キャッシュ Chromium。**ALL GREEN**。
- 5 トップ（JS-on）: `/`=日本語 byte 一致（Gallery/News 表示・h1・全文言）、`/en /zh-hans /zh-hant /ko`=各言語本文（h1 訳文・
  承認文言全提示・**scaffold 除去**・Gallery/News 非表示・noindex・profile CTA が locale 別 /…/profile・簡繁純度 OK・console/hydration/failed 0・横スクロール 0）。
- 回帰: `/profile /gallery /news`=日本語実ページ、`/en/profile /zh-hant/profile` 等=各言語 scaffold 維持（h1 なし・noindex）、`/no-such-page`=日本語 404。
- No-JS（/en・/ko・390）: 本文全提示・h1・scaffold なし・横スクロール 0。
- レスポンシブ 320/375/768/1024/1440 × 9URL: 横スクロール 0。

## 23. Changed files

新規 3: `content/topPage.ts`・`content/topPage.test.ts`・`docs/sprints/sprint-33-implement-multilingual-top-page.md`（本文書）。
（Phase A で `docs/sprints/sprint-33-top-page-translation-review.md` を作成・本 Phase で承認反映）。
変更 5: `app/[locale]/page.tsx`・`components/Hero.tsx`・`components/CharacterIntroduction.tsx`・`components/ChannelLinks.tsx`・`components/FloatingSupitaro.tsx`。
**無変更**: `content/{profile,gallery,news}.ts`・`config/site.ts`・`app/[locale]/{profile,gallery,news}`・`app/not-found.tsx`・`next.config.*`・
`package.json`・lockfile・`public/**`・`components/i18n/**`・`lib/i18n/**`。

## 24. Risks

- 外国語トップは正式翻訳済みだが **noindex 維持**（サイト全体多言語公開は未完成）。
- Gallery プレビュー・News・FOLLOW aria・外部リンク注記の日本語残は意図的（D-D/D-C/D-E・Sprint 34/35/共通 UI 校正へ）。
- `content/topPage.ts` の ja intro は `content/profile.ts` の intro と同一文言を複製（node テスト可用性のため import せず）。テストで byte 一致を固定し drift を検出。
- Hero/紹介/チャンネルの単体レンダリングテストは未追加（ブラウザ監査で代替）。

## 25. Deferred work

外国語 Profile 本文（Sprint 34）、外国語 Gallery 本文＋トップ Gallery プレビュー再表示（Sprint 35）、共通 UI（FOLLOW aria・外部リンク注記）の
locale 化（共通 UI 校正 Sprint）、言語別 metadata/OG・canonical・hreflang・sitemap・noindex 解除（ドメイン後・別 Sprint）、Header ロゴ変更・Footer 再設計。

## 26. Recommended next Sprint

**Sprint 34 — 各言語版プロフィールページの正式翻訳・人間確認**（本 Sprint と同じ二段階フロー。`content/topPage.ts` と同型のプロフィール locale
コンテンツ＋トレイト/シートの Server/Client 境界を扱う）。

## 27. Final verdict

**MULTILINGUAL_TOP_PAGE_IMPLEMENTED**

4 外国語すべて人間承認済みの正式訳でトップページを 5 locale 化。外国語 home scaffold を正式本文へ置換し h1 を付与、News/Gallery プレビューは
方針どおり非表示、noindex を維持、日本語トップは byte 一致で不変。lint/test/typecheck/build・実ブラウザ／No-JS 監査すべて green、許可外変更なし、
ルーティング・metadata（noindex 含む）契約不変。

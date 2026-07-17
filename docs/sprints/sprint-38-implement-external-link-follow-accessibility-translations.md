# Sprint 38 — Implement External-Link / FOLLOW Accessibility Translations（Phase B）

外部リンク補助文言と FOLLOW・チャンネル SNS リンクの accessible name を 5 locale 対応へ移行し、
外国語ページに残っていた日本語アクセシビリティ文言を解消した。

- 種別: Phase B（承認済み翻訳の実装・検証）。commit 前報告で停止。
- 判定: `EXTERNAL_LINK_FOLLOW_ACCESSIBILITY_TRANSLATIONS_IMPLEMENTED`

---

## 1. Purpose

日本語ハードコードだった外部リンク注記 `(外部リンク・新しいタブで開きます)` と FOLLOW SNS リンク（YouTube/X/Twitch）の
aria-label を型付き辞書へ移し、Server 側で locale 別に解決して props 配線する。ページ本文・デザイン・URL・metadata・SEO・
SNS リンク先は変更しない。

## 2. Baseline

```text
branch = main / working tree = clean（実装前）
local HEAD = origin/main = remote = be1312b550152348d54891cda853463f9918e4f9
latest commit = docs: approve shared interface translations
```

## 3. Decision-of-record

Sprint 33 §12 R2 / D-E（FOLLOW aria の locale 化を共通 UI 校正 Sprint へ延期）と Sprint 37 D-EXT=(A)（独立 Sprint へ分離）の
直接の履行。locale = ja/en/zh-hans/zh-hant/ko、`getDictionary` は日本語 fallback なし、外国語は noindex 継続。

## 4. Translation-review process

Phase A で `sprint-38-external-link-follow-accessibility-translation-review.md`（23 セクション・E01-E04・D-A〜D-H）を作成 →
人間確認。Sprint 33/37 と同じ二段階フロー。動作句・注記は Sprint 33 で人間承認済みの訳（T04/T16/T18/T20）を流用し整合。

## 5. Human approvals

```text
EN / ZH-HANS / ZH-HANT / KO : すべて APPROVE
D-A=1 キー externalLinkNote / D-B=KEEP（FOLLOW 維持）/ D-C・D-D・D-E=承認 /
D-F=共通辞書 social / D-G=完全文字列を locale 別保持 / D-H=一括
追認①=X 動作句「活動を追う」（実コード優先）/ 追認②=ContentCard 非変更
補足: Button は external 時のみ externalLinkNote 必須の型 / 404 は ja social を明示的に渡す
```

## 6. Japanese source inventory（byte 一致で辞書へ集約）

| ID | 日本語正本 | 集約先 |
|----|-----------|--------|
| E01 | `(外部リンク・新しいタブで開きます)` | `accessibility.externalLinkNote` |
| E02 | `YouTubeで配信を見る(外部リンク・新しいタブで開きます)` | `social.youtube` |
| E03 | `Xで活動を追う(外部リンク・新しいタブで開きます)` | `social.x` |
| E04 | `Twitchで配信を見る(外部リンク・新しいタブで開きます)` | `social.twitch` |

`od -c` で括弧＝半角 ASCII `()`・中点＝U+30FB `・` を確認し byte 一致で移設（表記変更なし）。`ja.ts` は既存文字列の**集約**であり日本語文言の変更ではない。

## 7. Dictionary-schema changes

- `content/i18n/ja.ts`（正本・`as const`）: `accessibility.externalLinkNote` 追加、`social`（youtube/x/twitch）セクション新設。
- `schema.ts`: `Dictionary` は `typeof ja` 由来で自動追随。プロップ型付け用に `SocialDictionary = Dictionary["social"]` を追加。
- `index.ts`: `SocialDictionary` を再エクスポート。
- 外国語 4 辞書（en/zh-hans/zh-hant/ko）: 同キーを承認済み値で追加。`satisfies Dictionary` で欠落/余剰キーを型検出。

各 locale の値は Phase A レビュー §8-11 のとおり（en/ko=半角括弧前スペース、zh=全角括弧、ja=密着）。

## 8. External-link helper implementation（E01）

`accessibility.externalLinkNote`（1 キー・完成済み文字列）。consumer:
- **Button**（`components/Button.tsx`）: external 分岐の sr-only を `props.externalLabel` に置換。
- **ChannelLinks**（`components/ChannelLinks.tsx`）: sr-only を `externalLinkNote` prop に置換。
- **ContentCard**: **非変更**（ja 専用 News・外国語 render なし・`app/[locale]/news/**` は変更禁止）。ja 注記リテラルを維持。

## 9. FOLLOW landmark implementation（D-B=KEEP）

FOLLOW 見出しは可視英字 `FOLLOW` を全 locale 維持（新 aria-label を追加しない）。section landmark 名は引き続き可視見出しで命名。
新 ja 文字列を作らず二重命名を避けた。実 defect（SNS リンク aria）は §10-12 で解消。

## 10. YouTube accessible name（E02 / D-C）

`social.youtube`。動作句「配信を見る」= Sprint 33 T04 承認訳 ＋ 注記。ja=`YouTubeで配信を見る(…)` / en=`Watch on YouTube (…)` /
zh-hans=`在 YouTube 观看直播（…）` / zh-hant=`在 YouTube 觀看直播（…）` / ko=`YouTube에서 방송 보기 (…)`。ブランド名維持。

## 11. X accessible name（E03 / D-D）

`social.x`。**動作句は実コード「活動を追う」を正本**（指示書想定「最新情報を見る」ではない）。ja=`Xで活動を追う(…)` /
en=`Follow along on X (…)` / zh-hans=`在 X 关注动态（…）` / zh-hant=`在 X 關注動態（…）` / ko=`X에서 소식 보기 (…)`。ブランド名維持。

## 12. Twitch accessible name（E04 / D-E）

`social.twitch`。Twitch は SocialFollowLinks のみ（可視 CTA なし・aria が唯一）。動作句「配信を見る」= Sprint 33 T20 承認訳 ＋ 注記。
en=`Watch on Twitch (…)` / zh-hans=`在 Twitch 观看直播（…）` / zh-hant=`在 Twitch 觀看直播（…）` / ko=`Twitch에서 방송 보기 (…)`。

## 13. Button integration

判別ユニオンで **external 時のみ `externalLabel: string` を必須**化（`{ external: true; externalLabel: string } | { external?: false; externalLabel?: never }`）。
内部リンク（既存の大多数・not-found/ChannelLinks 外の Button）は無変更＝壊さない最小設計。sr-only 文言は props から描画（ハードコード撤去）。
className・variant・target/rel・visible text 不変。

## 14. ContentCard integration

**非変更**（§8）。ja 専用 News で外国語出力が無く、`app/[locale]/news/**` は変更禁止。日本語注記が辞書と ContentCard に併存するが
同一文字列・ja 専用文脈のため実害なし（§27 リスク）。

## 15. Hero integration

`externalLinkNote: string` prop を追加し YouTube CTA の Button へ `externalLabel` として渡す。可視 CTA・画像・layout・animation・YouTube URL 不変。

## 16. ChannelLinks integration

`externalLinkNote: string` prop を追加。YouTube/X カードの sr-only を辞書値に。表示順・サービス名・URL・アイコン・色・target/rel 不変。

## 17. SocialFollowLinks integration

`social: SocialDictionary` prop を追加。内部 `socialLinks` を `{ key, label, href, Icon }` へ整理し、aria-label を `social[key]`（youtube/x/twitch）で解決。
アイコン（aria-hidden）・URL・順序・target/rel・variant スタイル不変。空 URL チャンネル除外ロジック維持。

## 18. Footer integration

`social: SocialDictionary` prop を追加し `<SocialFollowLinks variant="footer" social={social} />` へ渡す。Footer 構造・サイトメニュー・
言語切替・PAGE TOP・copyright 不変。

## 19. Server and Client boundary

- 対象は全て Server Component。辞書取得は Server（`getDictionary`）、props は解決済み文字列のみ。
- 配線: `SiteShell`（dict.social）→ Footer → SocialFollowLinks（全ページ・全 locale）/ `app/[locale]/page.tsx`（dict）→ Hero・ChannelLinks・section SocialFollowLinks /
  `app/not-found.tsx`（getDictionary("ja").social）→ Footer（**条件付き許可**・ja 値・最小差分）。
- Client（MobileMenu）は SNS/注記に非関与。runtime fetch/hydration 後切替なし・辞書全体を Client へ渡さない。

## 20. Japanese regression

ja トップ Footer/Hero/ChannelLinks の SNS aria・外部注記はブラウザ監査で byte 一致を確認。SNS リンクの rel=`noopener noreferrer` / target=`_blank` 不変。
可視文言・デザイン・リンク先・FOLLOW 見出しに変化なし。

## 21. No-JS behavior

`/zh-hant`・`/ko` を JavaScript 無効で確認: Footer SNS aria が初期 HTML に locale 別で存在、日本語注記の残存なし（Server 描画・Client JS 非依存）。

## 22. Accessibility audit

- FOLLOW landmark 名 = 可視 "FOLLOW"（維持）。YouTube/X/Twitch リンクの accessible name が locale 別（aria-label が唯一の名）。
- 外部注記は `target="_blank"` のリンクのみ。可視テキストとの矛盾なし。SNS はアイコン aria-hidden ＋ aria-label で二重読み上げなし。
- Button 外部リンクは可視テキスト＋sr-only 注記（重複読み上げなし）。focus/keyboard/rel は既存維持。

## 23. Tests

`content/i18n/dictionary.test.ts` に 6 件追加（21→**27 件**）:
- `externalLinkNote` の全 locale 存在＋ja byte 一致 / `social` 3 キーの全 locale 存在＋ja byte 一致。
- **各 social aria が同 locale の externalLinkNote を末尾に含む**（D-G 一体保持・ドリフト防止）。
- 外部注記・SNS aria の日本語 fallback なし（外国語固有値）。
- 承認済み外国語値（D-A/D-C/D-D/D-E/D-F）＋簡繁独立。
- X 動作句が実コード「活動を追う」始まり（追認①）。
- `REQUIRED_CATEGORIES` に `social` 追加。既存テスト（キー構造一致・fallback なし・簡繁独立）が新セクションも網羅。

## 24. Validation results

```text
npm run lint       → 0 problems
npx tsc --noEmit   → exit 0
npm run build      → 19 static pages（全 locale SSG・全 Static/SSG）
node tests         → dictionary 27/27・gallery 9/9・profile 8/8・topPage 7/7・locales 9/9・routes 9/9 = 69/69
git diff --check   → clean
```

テスト実行は Sprint 30〜37 と同方式（tsc で CJS へコンパイル → `@/` リゾルバ shim 付き `node --test`）。package.json に test script 追加なし。

## 25. Browser audit

ローカル production（`next start`）+ playwright-core + キャッシュ Chromium。**失敗 0**。

- 5 トップ（/・/en・/zh-hans・/zh-hant・/ko）: Footer/section の SNS aria が locale 別で期待値一致、外部注記 sr-only ×3（Hero＋Channels YouTube/X）、
  FOLLOW 見出し維持、外国語で日本語注記/aria 残存 0、console/failed 0、横スクロール 0（320-1440）。
- 非ホーム foreign（/en/profile・/en/gallery）: SiteShell Footer の SNS aria = en、日本語残存 0。
- 404（/no-such-page）: HTTP 404・lang=ja・Footer SNS aria = ja（日本語 chrome 維持）。
- No-JS（/zh-hant・/ko）: Footer SNS aria が初期 HTML に locale 別、日本語注記残存 0。
- ja 回帰（/）: Footer SNS aria 不変、外部注記 ×3、SNS rel/target 不変。

## 26. Changed files

```text
変更（コード 16）:
  content/i18n/ja.ts              （正本: externalLinkNote＋social 新設・byte 一致集約）
  content/i18n/en.ts / zh-hans.ts / zh-hant.ts / ko.ts （承認済み値追加）
  content/i18n/schema.ts          （SocialDictionary 型追加）
  content/i18n/index.ts           （SocialDictionary 再エクスポート）
  content/i18n/dictionary.test.ts （Sprint 38 テスト 6 件追加）
  components/Button.tsx           （external 時 externalLabel 必須の判別ユニオン・sr-only props 化）
  components/Hero.tsx             （externalLinkNote → Button）
  components/ChannelLinks.tsx     （externalLinkNote prop）
  components/SocialFollowLinks.tsx（social prop・key 対応）
  components/Footer.tsx           （social prop → SocialFollowLinks）
  components/i18n/SiteShell.tsx   （dict.social → Footer）
  app/[locale]/page.tsx           （getDictionary 配線: Hero/ChannelLinks/section SNS）
  app/not-found.tsx               （ja social → Footer・条件付き許可）
新規（docs 2）:
  docs/sprints/sprint-38-external-link-follow-accessibility-translation-review.md   （Phase A）
  docs/sprints/sprint-38-implement-external-link-follow-accessibility-translations.md（Phase B・本文書）
不変（重要）:
  components/ContentCard.tsx（ja 専用）・app/[locale]/news/page.tsx（変更禁止）・app/[locale]/layout.tsx・
  content/topPage.ts・config/site.ts・next.config.*・package.json・lockfile・public/**・
  content/{profile,gallery,news}.ts・profileContent.ts・galleryContent.ts・SNS URL・metadata・noindex
```

## 27. Risks

- ContentCard の日本語注記が辞書と併存（ja 専用・同一文字列・外国語 defect なし＝意図的・実害なし）。
- Button 判別ユニオンで external が型厳格化（external 呼び出しは Hero 1 箇所のみ→影響最小）。
- `social` セクション追加でスキーマが 5 辞書に要求（漏れは型エラーで検出＝設計どおり）。
- 外国語は引き続き noindex（本 Sprint は a11y 文言のみ・SEO 基盤/noindex 解除は対象外）。

## 28. Deferred work

- 外国語 metadata・canonical・hreflang・sitemap・robots・言語別 404 本文・noindex 解除（多言語 SEO 基盤 Sprint）。
- ContentCard/News の多言語化（Sprint 27 D-01=B で News は ja 専用の決定・現状維持）。

## 29. Recommended next Sprint

多言語 SEO 基盤（正式ドメイン確定 → metadataBase/canonical/hreflang/sitemap/robots）→ noindex 解除判断。
共通 UI・トップ・プロフィール・ギャラリー・外部リンク/FOLLOW の a11y 文言は正式化済みで、公開品質の残件は SEO 基盤が中心。

## 30. Final verdict

```text
EXTERNAL_LINK_FOLLOW_ACCESSIBILITY_TRANSLATIONS_IMPLEMENTED
（外部リンク補助文言と FOLLOW/チャンネル SNS aria を 5 locale 対応。外国語ページの日本語 a11y 文言を解消。
 日本語正本・可視文言・SNS URL・target/rel・FOLLOW 見出し・ContentCard・ページ本文・metadata・noindex は不変。
 全検証 green [lint 0 / tsc 0 / build 19 / node 69/69 / ブラウザ監査 失敗 0]。commit 前報告で停止。）
```

# Sprint 29 — Stage A Multilingual Routing Deployment Audit

> **種別**: report-only 監査。コード・設定・依存・コンテンツ・デザインは変更しない（成果物は本文書のみ）。
> **対象**: Vercel Stage A（`https://supitaro-site.vercel.app`）が配信する Sprint 28（`383faf7`）の多言語ルーティング基盤。

## 1. Purpose

Sprint 28 で実装・push した 5 locale ルーティング基盤が、Vercel Stage A の実配信で設計どおり動作するかを監査する（接頭辞なし日本語 URL・5 locale・`/ja` 正規化・不明 locale 404・外国語 News 404・locale 別 `<html lang>`・外国語 scaffold noindex・日本語既存回帰・カスタム 404・No-JS・Console/hydration/Network）。

## 2. Baseline

```text
branch = main / working tree = clean
local HEAD = origin/main = remote = 383faf7843205b5bdba12aa0fdc2985fab38b09d
latest commit = feat: implement multilingual routing foundation
```

## 3. Stage A deployment identity

Vercel はレスポンスヘッダに git SHA を出さないため、**Sprint 28 固有の挙動**で配信 commit を同定した（旧 Sprint 24 単一言語構成では成立しない挙動）:

- `/en`・`/zh-hant` = **200**（`x-vercel-cache=PRERENDER`）＝新 `app/[locale]` ルートが存在（旧構成なら 404）。
- `/ja` = **307 → `/`**（`/ja` 正規化 redirect＝Sprint 28 の next.config 由来）。
- `/no-such-page` = **404 かつ日本語カスタム 404**（Sprint 28 のグローバル `app/not-found.tsx`）。
- `/en/news` = **404**（News ja 限定）。
- Edge = `hnd1`（東京）。

→ **Stage A は Sprint 28（`383faf7`）を配信中（stale ではない）**。手動 Redeploy は行っていない。

## 4. Decision-of-record references

- `docs/sprints/sprint-26-design-multilingual-url-architecture.md`（R2/D1 設計）
- `docs/sprints/sprint-27-decide-initial-multilingual-implementation-policy.md`（人間決定・**decision of record**：`/zh` 廃止・`/zh-hans`＋`/zh-hant`）
- `docs/sprints/sprint-28-implement-multilingual-routing-foundation.md`（実装・既知リスク）
- 現行 locale = `ja / en / zh-hans / zh-hant / ko`。正式 URL = `/`・`/en`・`/zh-hans`・`/zh-hant`・`/ko`。`/ja`・`/zh` は正式 URL ではない。

## 5. Audit method

- HTTP: `node fetch`（`redirect:manual` で生 status/Location、`redirect:follow` で最終 status/URL/`<html lang>`/metadata）。`cache:no-store`＋cache-buster。
- 実ブラウザ: `playwright-core` ＋ キャッシュ Chromium（`chromium-1228`）で Stage A を直接監査（Console/pageerror/requestfailed/hydration・No-JS[`javaScriptEnabled:false`]・レスポンシブ・ja interactive）。
- `curl` 不在のため node を使用。証跡は本文書に記録（public/アプリコードへ画像を追加しない）。

## 6. Japanese prefixless URLs（§1）

| URL | HTTP | 最終URL | `<html lang>` | `/ja` 露出 | Console | hydration | No-JS |
|---|---|---|---|---|---|---|---|
| `/` | 200 | `/` | ja | なし | 0 | 0 | OK |
| `/profile` | 200 | `/profile` | ja | なし | 0 | 0 | OK |
| `/gallery` | 200 | `/gallery` | ja | なし | 0 | 0 | OK |
| `/news` | 200 | `/news` | ja | なし | 0 | 0 | OK |

title/description/OG/Header/Footer/日本語本文すべて既存維持。redirect なし・loop なし。

## 7. /ja canonical redirects（§2）

| URL | status | 最終URL | loop |
|---|---|---|---|
| `/ja` | 307 | `/` | なし |
| `/ja/profile` | 307 | `/profile` | なし |
| `/ja/gallery` | 307 | `/gallery` | なし |
| `/ja/news` | 307 | `/news` | なし |
| `/ja?ref=a` | 307 | `/?ref=a` | **query 維持** |
| `/ja/profile?ref=a&x=1` | 307 | `/profile?ref=a&x=1` | **query 維持** |

最終 HTML は `lang="ja"`。redirect 回数 1・loop なし。`/ja` は公開 URL として露出しない。

## 8. Foreign-language routes（§3・§4）

| URL | HTTP | `<html lang>` | noindex | scaffold | 日本語本文流用 | Header/Footer | No-JS |
|---|---|---|---|---|---|---|---|
| `/en` / `/en/profile` / `/en/gallery` | 200 | en | ○ | ○ | なし | 表示 | OK |
| `/zh-hans` / `/zh-hans/profile` / `/zh-hans/gallery` | 200 | zh-Hans | ○ | ○ | なし | 表示 | OK |
| `/zh-hant` / `/zh-hant/profile` / `/zh-hant/gallery` | 200 | zh-Hant | ○ | ○ | なし | 表示 | OK |
| `/ko` / `/ko/profile` / `/ko/gallery` | 200 | ko | ○ | ○ | なし | 表示 | OK |

外国語 scaffold は言語中立の最小表示（"This language version is being prepared."）で、日本語**本文**を流用していない（D-06 遵守）。Console/hydration/Network 問題 0。

## 9. HTML lang verification（§9 実装）

```text
/        → ja       /en      → en
/zh-hans → zh-Hans  /zh-hant → zh-Hant
/ko      → ko       404      → ja
```

内部 locale 値（`zh-hans`）と HTML `lang`（`zh-Hans`）が正しく分離。実配信で全一致。

## 10. noindex verification（§8）

- 外国語（`/en`・`/zh-hans`・`/zh-hant`・`/ko` とサブページ）= `robots: noindex, nofollow`。
- 日本語ページ（`/`・`/profile`・`/gallery`・`/news`）= robots meta なし（＝index 可能・既存挙動）。
- 404 = `noindex`（Next.js の not-found 既定）。

## 11. News exclusion（§5）

| URL | HTTP | redirect | 日本語 News fallback |
|---|---|---|---|
| `/en/news` | 404 | なし | なし |
| `/zh-hans/news` | 404 | なし | なし |
| `/zh-hant/news` | 404 | なし | なし |
| `/ko/news` | 404 | なし | なし |

200 を返さず、日本語 News へ redirect も本文 fallback もしない。Client-side だけの 404 模倣ではない（HTTP status 404）。

## 12. Unknown locale handling（§6）

| URL | HTTP | redirect | zh 自動転送 |
|---|---|---|---|
| `/zh` | 404 | なし | **なし**（`/zh-hans`・`/zh-hant` へ自動転送しない） |
| `/fr` | 404 | なし | なし |
| `/de` | 404 | なし | なし |
| `/es` | 404 | なし | なし |

不明 locale を有効扱いせず、日本語トップへ redirect も最近傍 locale への自動補正もしない。

## 13. 404 behavior（§7）

| URL | HTTP | `<html lang>` | 日本語カスタム | 英語既定表示 | Header | Footer | ホーム導線 |
|---|---|---|---|---|---|---|---|
| `/no-such-page` | 404 | ja | ○ | **なし** | ○ | ○ | `/` |
| `/en/no-such-page` | 404 | ja | ○ | なし | ○ | ○ | `/` |
| `/zh-hans/no-such-page` | 404 | ja | ○ | なし | ○ | ○ | `/` |
| `/zh-hant/no-such-page` | 404 | ja | ○ | なし | ○ | ○ | `/` |
| `/ko/no-such-page` | 404 | ja | ○ | なし | ○ | ○ | `/` |
| `/zh` `/fr` | 404 | ja | ○ | なし | ○ | ○ | `/` |

Sprint 28 で復元した自己完結型 `app/not-found.tsx` が実配信でも機能。title=「ページが見つかりません | すぴたろう公式サイト」、**Next 既定の英語 404（Sprint 23 Blocker B1）は再発せず**。No-JS でも 404 表示・ホーム導線可・横スクロール 0。外国語配下の 404 は現状**日本語 404 共通**（言語別 404 本文は後続 Sprint、Sprint 28 で意図済み）。

## 14. Metadata regression（§8）

- 日本語ページ title 維持（`/`＝「すぴたろう公式サイト」／`/profile`＝「プロフィール | すぴたろう公式サイト」等）。description・`og:image`・`twitter:card=summary_large_image` 維持。`canonical`/`og:url` **非出力**（対象外・意図どおり）。
- `icon.png` 200（image/png）、`/images/og/supitaro-og.png` 200（image/png）＝favicon/OG asset 取得可。
- 404 は title のみ（`og:image`/description なし＝グローバル not-found の最小 metadata）。noindex のため索引されない。
- 消失・破損・エラーなし。

## 15. Header and Footer regression（§9）

実ブラウザ実測で全対象ページ（ja・外国語・404）で **`<header>`×1・`<footer>`×1・`<main>`×1**（欠落なし・**重複なし**）。既存日本語ページの Header/Footer リンク機能（404 のホーム CTA → `/` 実測）。Sprint 28 リスク（404 側 Header/Footer 自己完結実装）について、実配信で **landmark 重複・視覚崩れ・二重表示は発生せず**（header/footer とも 1 個）。

## 16. No-JS audit（§10）

`/`・`/profile`・`/gallery`・`/news`・`/no-such-page`・`/en`・`/zh-hans`・`/zh-hant`・`/ko` を JS 無効で確認: 本文/scaffold 表示・Header/Footer 表示・Footer サイトメニュー 4 リンク・正しい `<html lang>`・横スクロール 0・404 表示。**locale 判定はクライアント JS 非依存**（URL ベース）、scaffold は空白にならない。

## 17. Console and hydration audit（§11）

代表 11 URL（ja 4＋404＋外国語 4＋`/zh`）で **Console error 0・hydration mismatch 0・pageerror 0**（404 の「Failed to load resource: 404」は 404 文書取得に伴う内在ログで、実装エラーではない＝Sprint 25 と同様に区別）。React error/uncaught exception/failed dynamic import なし。

## 18. Network audit（§11）

代表ページで **failed request 0**（`requestfailed` 0）。500 応答なし・意図しない 404 asset なし・redirect loop なし。favicon（`icon.png`）と OG 画像取得可。既存 asset 取得に回帰なし。CSP 重大問題なし。

## 19. Responsive audit（§12）

320 / 375 / 768 / 1024 / 1440px × 代表 9 URL（ja・外国語・404）で **横スクロール 0**。Header/Footer/scaffold/404 の崩れなし。既存日本語デザインの回帰なし。

## 20. HTTP audit matrix（§13）

| Requested URL | RAW | Redirect | Final URL | html lang | index | Verdict |
|---|---|---|---|---|---|---|
| `/` | 200 | - | `/` | ja | index | OK |
| `/profile` | 200 | - | `/profile` | ja | index | OK |
| `/gallery` | 200 | - | `/gallery` | ja | index | OK |
| `/news` | 200 | - | `/news` | ja | index | OK |
| `/ja` | 307 | →`/` | `/` | ja | index | OK |
| `/ja/profile` | 307 | →`/profile` | `/profile` | ja | index | OK |
| `/ja/gallery` | 307 | →`/gallery` | `/gallery` | ja | index | OK |
| `/ja/news` | 307 | →`/news` | `/news` | ja | index | OK |
| `/en` | 200 | - | `/en` | en | noindex | OK |
| `/en/profile` | 200 | - | `/en/profile` | en | noindex | OK |
| `/en/gallery` | 200 | - | `/en/gallery` | en | noindex | OK |
| `/en/news` | 404 | - | `/en/news` | ja | - | OK |
| `/zh-hans` | 200 | - | `/zh-hans` | zh-Hans | noindex | OK |
| `/zh-hans/profile` | 200 | - | `/zh-hans/profile` | zh-Hans | noindex | OK |
| `/zh-hans/gallery` | 200 | - | `/zh-hans/gallery` | zh-Hans | noindex | OK |
| `/zh-hans/news` | 404 | - | `/zh-hans/news` | ja | - | OK |
| `/zh-hant` | 200 | - | `/zh-hant` | zh-Hant | noindex | OK |
| `/zh-hant/profile` | 200 | - | `/zh-hant/profile` | zh-Hant | noindex | OK |
| `/zh-hant/gallery` | 200 | - | `/zh-hant/gallery` | zh-Hant | noindex | OK |
| `/zh-hant/news` | 404 | - | `/zh-hant/news` | ja | - | OK |
| `/ko` | 200 | - | `/ko` | ko | noindex | OK |
| `/ko/profile` | 200 | - | `/ko/profile` | ko | noindex | OK |
| `/ko/gallery` | 200 | - | `/ko/gallery` | ko | noindex | OK |
| `/ko/news` | 404 | - | `/ko/news` | ja | - | OK |
| `/zh` | 404 | - | `/zh` | ja | - | OK |
| `/fr` | 404 | - | `/fr` | ja | - | OK |
| `/no-such-page` | 404 | - | `/no-such-page` | ja | - | OK |
| `/en/no-such-page` | 404 | - | `/en/no-such-page` | ja | - | OK |
| `/zh-hans/no-such-page` | 404 | - | `/zh-hans/no-such-page` | ja | - | OK |
| `/zh-hant/no-such-page` | 404 | - | `/zh-hant/no-such-page` | ja | - | OK |
| `/ko/no-such-page` | 404 | - | `/ko/no-such-page` | ja | - | OK |

## 21. Findings

- 全監査項目が Stage A 実配信で設計どおり（HTTP マトリクス 31 行すべて Verdict OK）。Sprint 28 のローカル検証と実配信が一致。
- Sprint 28 リスク①（404 の Header/Footer 自己完結）は実配信で **landmark 重複・崩れなし**（header/footer 各 1）と確認され、実害なし。

## 22. Risks（実害なし・後続で解消予定）

1. **外国語 chrome 未翻訳**: Header/Footer/skip-link・外国語 scaffold の title は現状日本語（scaffold 本文は言語中立・全ページ noindex）。日本語**本文**の流用はなし（D-06 遵守）。→ 後続の辞書・各言語版・Footer 切替 Sprint。
2. **外国語 scaffold に h1 なし**: 最小プレースホルダー（noindex）。→ 各言語版実装で置換。
3. **言語別 404 未実装**: 外国語配下の 404 も日本語 404 共通。→ 後続の言語別 404 Sprint。
4. **404 metadata が title のみ**: グローバル not-found の最小 metadata（noindex のため索引影響なし）。
5. **redirect が暫定 307**: `/ja/*→/*` は 307。正式ドメイン確定時に 308 化を検討。
6. **canonical/hreflang/sitemap/robots 未実装**: 本 Sprint 対象外・ドメイン確定後。

いずれも Sprint 28 で意図・記録済みで、公開 Blocker ではない。

## 23. Blocking issues

**公開 Blocker = 0 件。** `/ja` 200・`/zh` 200・外国語 News 200・`<html lang>` 不一致・noindex 欠落・404 が 200・日本語 404 の英語既定表示・Header/Footer 欠落/重複・hydration error・Console error・asset 404・No-JS 破損・metadata 消失・レスポンシブ崩れ — いずれも**検出されず**。

## 24. Deferred work

翻訳辞書（`content/i18n/*`）・正式翻訳・Footer 言語切替 UI・言語別 title/description/OG・言語別 404・chrome（Header/Footer/skip）翻訳・scaffold の h1/デザイン・canonical・hreflang（ja/en/zh-Hans/zh-Hant/ko/x-default）・sitemap・robots・News 多言語化・`/ja` redirect の 308 化（ドメイン後）。

## 25. Recommended next Sprint

- **Sprint 30**: 型付き翻訳辞書基盤（`Dictionary` interface＋`content/i18n/{ja,en,zh-hans,zh-hant,ko}.ts`、欠落キーはビルドエラー）。まず ja を辞書経由に（画面 byte 一致）。
- 以降: トップ各言語版 → プロフィール → ギャラリー・言語別 404 → Footer 言語切替 → ドメイン後に canonical/hreflang/sitemap/robots/言語別 OG。

## 26. Final verdict

- Stage A 実配信で、接頭辞なし日本語 URL・5 locale・`/ja` 正規化（query 維持）・不明 locale 404（`/zh` 自動転送なし）・外国語 News 404・locale 別 `<html lang>`・外国語 noindex・日本語既存回帰・自己完結カスタム 404（英語既定なし）・No-JS・Console/hydration/Network・レスポンシブ、すべて設計どおり。公開 Blocker 0 件。
- report-only：コード・設定・依存の変更なし。commit/push/Redeploy なし。

```text
STAGE_A_MULTILINGUAL_ROUTING_DEPLOYMENT_VERIFIED
```

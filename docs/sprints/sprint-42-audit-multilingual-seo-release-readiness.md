# Sprint 42 — 多言語 SEO 配信準備状況の監査・noindex 解除可否判断（監査・意思決定のみ）

Sprint 41 で実装した多言語 SEO 基盤（SITE_URL helper・metadataBase・canonical・hreflang・x-default・
locale 別 OG/Twitter・sitemap・robots）の配信前監査を行い、外国語ページの `noindex` 解除可否を人間判断へ提示する。

- 種別: **監査・意思決定 Sprint（report-only）**。コード・設定・依存・metadata・noindex は変更しない（成果物は本文書のみ）。
- 正式ドメインは未決定・SITE_URL 実環境未設定のため、本 Sprint で外国語 noindex は**解除しない**。
- 判定: `NOINDEX_RELEASE_NOT_APPROVED_PRODUCTION_URL_PENDING`

---

## 1. Purpose

Sprint 41（`fd08a46`）で多言語 SEO 基盤の**技術実装**が完了した。本 Sprint はその配信準備状況を監査し、
Sprint 39 §22 の noindex 解除条件（17 項目）の充足状況を評価して、外国語 top/profile/gallery（12 ページ）の
`noindex` 解除を人間が判断できる材料を揃える。単一関心事 = **多言語 SEO 基盤の配信準備状況を監査し、外国語 noindex 解除可否を人間判断する**。

## 2. Baseline

```text
branch = main / working tree = clean
local HEAD = origin/main = remote ref = fd08a463765363975ac024a7289c51831cddb4aa
latest commit = feat: implement multilingual seo foundation
```

指示書の期待値（`fd08a46…` / `feat: implement multilingual seo foundation`）と**一致**。本 Sprint はコード無変更。

## 3. Decision-of-record references

読了: Sprint 27（初期多言語方針・locale 5 系統・R2・News ja のみ・簡繁独立）／29（Stage A ルーティング実配信監査）／
39（SEO 設計・D-A=SITE_URL / D-B=Stage A 検証 / D-C=x-default ja / D-E/F=lastmod/priority 省略 / D-G=一括 noindex 解除 / D-H=404 後回し）／
40（metadata 翻訳レビュー＋実装・`content/seoMetadata.ts`・absolute title）／41（SEO 基盤実装）。
競合時は Sprint 27／39／40／41 の人間決定を優先。

## 4. Production-domain status

```text
正式ドメイン: 未決定（本 Sprint 指示に具体ドメインの提示なし）
```

人間から新しい正式ドメイン情報の提示がないため、**未決定**として扱う。ドメインの推測・購入・設定は行わない（§禁止事項）。

## 5. SITE_URL status

```text
SITE_URL 本番値: 未設定
```

- コード上の source of truth = `lib/seo/site-url.ts`（Server 専用・`process.env.SITE_URL`・`NEXT_PUBLIC_` 不使用）。
- リポジトリに `.env*` は存在しない（`ls .env*` = なし）。コードに正式 URL のハードコードなし（`config/site.ts` から `siteUrl` フィールド撤去済み・Sprint 41）。
- Stage A（Vercel）にも SITE_URL は設定されていない（§9 で挙動から確認）。

## 6. Stage A role

```text
https://supitaro-site.vercel.app/  = 検証環境（正式公開 URL ではない・Sprint 39 D-B）
```

Stage A を正式 URL へ昇格しない。canonical fallback として Stage A URL を採用しない（Sprint 41 §7）。

## 7. Sprint 41 implementation audit

コードを再監査し、Sprint 41 実装が設計どおりであることを確認（変更なし）。

| 項目 | 実装 | 監査結果 |
|------|------|---------|
| SITE_URL 責務 | `lib/seo/site-url.ts`（https 限定・credentials/query/fragment/path 拒否・末尾スラッシュ正規化） | OK |
| SITE_URL 未設定時 | `getOptionalSiteUrl()`→null。canonical/hreflang/og:url 非出力・sitemap 空・robots Sitemap 行なし・Stage A fallback なし | OK |
| metadataBase | `app/[locale]/layout.tsx` = `getOptionalSiteUrl()`（未設定は null＝Next 未設定扱い） | OK |
| canonical | `buildCanonicalUrl`（`lib/seo/routes.ts`）＝ `origin + localizedPath`。ja 接頭辞なし・外国語 prefix | OK |
| hreflang | `buildLanguageAlternates` ＝ 有効 locale の htmlLang → 絶対 URL ＋ x-default | OK |
| x-default | 各ページの日本語対応 URL（top→/・profile→/profile・gallery→/gallery） | OK |
| Open Graph URL | `openGraph.url` = canonical helper 共用（SITE_URL 設定時のみ） | OK |
| Open Graph locale | `ogLocale`（`lib/i18n/locales.ts`）＝ ja_JP/en_US/zh_CN/zh_TW/ko_KR | OK |
| Twitter metadata | `card=summary_large_image`・title/description=seoMetadata 共用・images 維持 | OK |
| sitemap | `app/sitemap.ts`＝正式 16 URL・alternates（top/profile/gallery）・未設定時空配列 | OK |
| robots | `app/robots.ts`＝`Allow: /`・外国語 Disallow なし・Sitemap 行は設定時のみ | OK |
| 外国語 robots meta | `buildLocalizedPageMetadata` が外国語に `{index:false,follow:false}` を付与（維持） | OK |

## 8. noindex-release checklist（Sprint 39 §22 / 本指示 §4 の 17 条件）

| # | 条件 | 判定 | 根拠 |
|---|------|------|------|
| 1 | 正式ドメイン決定 | **PENDING** | 未決定（§4） |
| 2 | SITE_URL 設定 | **PENDING** | 未設定（§5） |
| 3 | locale 別 metadata 翻訳承認 | **PASS** | Sprint 40（4 外国語 APPROVE・`content/seoMetadata.ts`） |
| 4 | canonical 実装 | **PASS** | §12（設定時 16 URL 自己参照・実測） |
| 5 | hreflang 実装 | **PASS** | §13（top/profile/gallery 6 件・htmlLang キー） |
| 6 | x-default 実装 | **PASS** | §14（日本語対応 URL） |
| 7 | sitemap 実装 | **PASS** | §15（16 loc・90 hreflang） |
| 8 | robots 実装 | **PASS** | §16（Sitemap 行・Disallow なし） |
| 9 | Open Graph URL／locale 整合 | **PASS** | §17（og:url=canonical・og:locale locale 別） |
| 10 | 全正式 route の**本番**配信監査 | **PENDING** | 本番 URL 未確定のため不能。ローカル正式 URL 相当監査は PASS（§11-17）・Stage A 未設定監査は PASS（§9） |
| 11 | redirect／404 回帰確認 | **PASS** | §22/§23（/ja 307→/・/zh・外国語 News・404 に canonical/hreflang なし） |
| 12 | sitemap 16 URL 確認 | **PASS** | §15 |
| 13 | robots Sitemap 行確認 | **PASS** | §16（設定時のみ・未設定時なし） |
| 14 | canonical／hreflang 相互整合 | **PASS** | §12-14（相互対称・x-default=ja=canonical） |
| 15 | HTML lang 整合 | **PASS** | §9/§12（ja/en/zh-Hans/zh-Hant/ko） |
| 16 | 外国語本文・UI・a11y 正式化 | **PASS** | Sprint 30-38 で辞書・本文・共通 UI・外部リンク/FOLLOW a11y を正式翻訳済み。外国語 Header/Footer/skip-link・nav も locale 別（§9 実測・scaffold は本文へ置換済み） |
| 17 | 人間による解除承認 | **PENDING** | 本 Sprint の判断事項（§28-29） |

**PENDING = 4 件（#1・#2・#10・#17）**。いずれも**正式ドメイン未決定に起因**。FAIL = 0 件。残り 13 件は PASS。

## 9. Stage A audit（現行配信・SITE_URL 未設定）

`https://supitaro-site.vercel.app` を実測（`node fetch`・No-JS 相当の生 HTML）。**Stage A は Sprint 41〔`fd08a46`〕を配信中**（`/sitemap.xml`・`/robots.txt` route が 200 で存在＝Sprint 41 で新設された route。Sprint 40 以前なら 404）。

| URL | HTTP | html lang | robots | canonical / og:url / hreflang |
|---|---|---|---|---|
| `/` | 200 | ja | （なし＝indexable） | 全て非出力 |
| `/en` | 200 | en | noindex, nofollow | 全て非出力 |
| `/ko/gallery` | 200 | ko | noindex, nofollow | 全て非出力 |
| `/news` | 200 | ja | （なし） | 全て非出力 |
| `/sitemap.xml` | 200 | — | — | **空 urlset（`<loc>` 0）** |
| `/robots.txt` | 200 | — | — | `User-Agent: * / Allow: /`（**Sitemap 行なし**） |

→ SITE_URL 未設定契約どおり（canonical/hreflang/og:url 非出力・sitemap 空・robots Sitemap 行なし・Stage A URL 不在・外国語 noindex 維持・ja indexable）。**予期しない SITE_URL 設定・誤 URL は検出されず**（§7 の未設定挙動と一致）。Vercel 環境変数は変更・削除していない。

## 10. SITE_URL-unset build audit

通常環境 `npm run build`:

```text
build 成功 / 21 static（+ robots.txt + sitemap.xml + icon.png）
警告 = metadataBase 1 件（"using http://localhost:3000"）… Sprint 41 §28 で承認済みの既知事項（Stage A を正規 URL 化しないための意図的挙動）
新規の警告・エラー = なし
```

配信挙動は Stage A（§9）と同一（canonical/hreflang/og:url 非出力・sitemap 空・robots Sitemap 行なし・Stage A URL 不在）。

## 11. SITE_URL-set build audit

一時的な shell 環境変数のみ `SITE_URL=https://example.com npm run build`（コード・`.env` へ**保存しない**）:

```text
build 成功 / 21 static / metadataBase 警告 = 0 件（設定時は警告消失）
```

この build をローカル配信（`PORT=3100 SITE_URL=https://example.com npm start`）し §12-23 を実測。

## 12. Canonical audit（SITE_URL=example.com・実測）

16 正式 URL すべてに自己参照 canonical（絶対 URL・実測）:

```text
/         → https://example.com        （Next がルートを末尾スラッシュなしへ正規化）
/profile  → https://example.com/profile
/gallery  → https://example.com/gallery
/news     → https://example.com/news
/en → https://example.com/en   /en/profile → …/en/profile   /en/gallery → …/en/gallery
/zh-hans, /zh-hant, /ko も同様（各 3 ページ）
```

- ルート canonical＝`https://example.com`（末尾スラッシュなし）は Next の canonical 正規化。og:url・ja hreflang・x-default も同値で**相互一致**（矛盾なし）。
- html lang = ja/en/zh-Hans/zh-Hant/ko（全一致）。`/ja`・`/zh` 単独は canonical に現れない。

## 13. Hreflang audit

top/profile/gallery（15 ページ）で hreflang **6 件**（`ja / en / zh-Hans / zh-Hant / ko / x-default`）を実測:

- キーは公開 hreflang コード（`zh-Hans`/`zh-Hant`）で、**内部 locale ID（`zh-hans`/`zh-hant` 小文字）は露出しない**。
- 各値は絶対 URL・相互対称（あるページの alternates が全 locale の同一 route を指す）。
- News（`/news`）は hreflang **0 件**（単一言語・クラスタなし）。

## 14. x-default audit

```text
top:     x-default → https://example.com          （= ja）
profile: x-default → https://example.com/profile  （= ja）
gallery: x-default → https://example.com/gallery  （= ja）
```

各ページの日本語対応 URL（Sprint 39 D-C）。専用言語選択ページは生成していない。x-default = ja hreflang = canonical で一致。

## 15. Sitemap audit（SITE_URL=example.com）

`/sitemap.xml` = 200:

```text
<loc> = 16（重複 0・全て絶対 URL under https://example.com）
xhtml:link（hreflang alternates）= 90（top/profile/gallery の 15 entry × 6）
含む: / /profile /gallery /news ＋ en/zh-hans/zh-hant/ko × (top/profile/gallery)
含まない: /ja・/zh 単独・外国語 News・404・redirect 元（実測 0 件）
lastmod / changefreq / priority = すべてなし（Sprint 39 D-E/D-F）
News（/news）に alternates なし・top/profile/gallery に alternates あり
```

SITE_URL 未設定時は空（§9/§10）。

## 16. Robots audit（SITE_URL=example.com）

`/robots.txt` = 200:

```text
User-Agent: *
Allow: /

Sitemap: https://example.com/sitemap.xml
```

外国語 route の `Disallow` なし（クローラが meta robots の noindex を確認できる設計）。SITE_URL 未設定時は Sitemap 行なし（§9/§10）。

## 17. Open Graph audit

top/profile/gallery（15 ページ・実測）:

```text
og:title / og:description = content/seoMetadata.ts の承認値（= meta title/description と一致）
og:locale = ja_JP / en_US / zh_CN / zh_TW / ko_KR（locale 別）
og:url    = canonical と一致（SITE_URL 設定時）
og:image  = https://example.com/images/og/supitaro-og.png（絶対・1466×643・alt 不変）
og:site_name = すぴたろう公式サイト（全 locale で日本語・§19）
```

- News: 自己参照 canonical のみ付与し、full OG は組まない設計（Sprint 41 §10/§13）。og:title/og:description/og:url は root（日本語）継承のまま（og:url は root に無く**非出力**）。News は ja・indexable・canonical 正しく、公開共有時も日本語 OG で整合。**非 Blocker**。
- OG 画像の URL/alt/寸法は Sprint 41 以前から不変。

## 18. Twitter audit

top/profile/gallery（実測）:

```text
twitter:card  = summary_large_image（不変）
twitter:title = seoMetadata 承認値（= meta title）
twitter:description = seoMetadata 承認値
twitter:image = /images/og/supitaro-og.png（metadataBase で絶対化）
```

title/description は `content/seoMetadata.ts` の承認値と一致。card 種別・画像は不変。

## 19. og:site_name assessment（Sprint 41 R3）

`og:site_name` は**全 5 locale で `すぴたろう公式サイト`（日本語）**（root layout `openGraph.siteName` を共用・実測確認）。評価:

```text
A. ブランド固有名として日本語維持可能 …… site_name は「サイトの名称」であり、固有名として日本語のまま維持する立場は成立する。
B. 外国語では Supitaro へ変更すべき …… og:title/description は locale 化済みのため、site_name も揃える一貫性の観点。
C. noindex 解除前に修正必須 …… 現状 noindex 中で公開共有対象外。SEO index 判定に site_name は直接影響しない。
D. SEO 公開後の別課題でよい
```

**AI 評価 = C ではない（解除の Blocker ではない）**。site_name はクロール index 可否に影響せず、日本語ブランド名としても不整合ではない。
ただし外国語で og:title/description が英語/中国語/韓国語なのに site_name のみ日本語である点は一貫性の観点で改善余地がある。
**本 Sprint では変更しない**（許可外・Validate first）。人間判断 D-E で扱う（AI 推奨 = C：後続の別課題）。

## 20. Japanese robots audit

`/`・`/profile`・`/gallery`・`/news` = meta robots **非出力（indexable）**（Stage A・ローカル両方で実測）。
外国語 noindex 対応に巻き込まれて日本語へ `noindex` が付く事象は**なし**。

## 21. Foreign-language robots audit

外国語 12 ページ（en/zh-hans/zh-hant/ko × top/profile/gallery）= `noindex, nofollow`（Stage A・ローカル両方で実測・漏れ 0）。
本 Sprint の人間判断前に変更していない。

## 22. Redirect audit

```text
/ja          → 307 → /          （RAW Location=/）
/ja/profile  → 307 → /profile
```

`/ja` は正規化 redirect（307）。redirect 元に canonical/hreflang は付かない。

## 23. 404 audit

```text
/zh              → 404（lang=ja・canonical なし・hreflang 0）
/en/news         → 404（同上）
/zh-hans/news    → 404
/zh-hant/news    → 404
/ko/news         → 404
/no-such-page    → 404
/fr              → 404
```

外国語 News・不明 locale・存在しないページはすべて 404。404・redirect 元に canonical/hreflang は出ない。`/zh` は `/zh-hans`/`/zh-hant` へ自動転送しない（Sprint 29 と一致）。

## 24. No-JS audit

§9-23 の監査はすべて `node fetch`（JS 未実行の生 HTML）＝**No-JS 相当**で実施。title/description/robots/canonical/hreflang/x-default/OG/Twitter は
すべて初期 HTML head に Server 出力されており、hydration 後生成に依存していない。Header/Footer/言語切替も既存どおり（Sprint 29/41 で確認済み・本 Sprint で回帰なし）。

## 25. Risks

- **R1（正式ドメイン未決定）**: canonical/hreflang/sitemap の**本番実 URL 監査が不能**。ローカル正式 URL 相当（example.com）監査は全 PASS だが、本番ホスト固有（www 正規化・トレイリングスラッシュ・DNS）は未検証。→ ドメイン確定後 SITE_URL 設定して再監査。
- **R2（metadataBase 未設定警告）**: SITE_URL 未設定 build で警告 1 件（Sprint 41 承認済み・意図的）。
- **R3（og:site_name 日本語）**: 全 locale で `すぴたろう公式サイト`（§19）。noindex 中で共有対象外・index 非影響。人間判断 D-E。
- **R4（sitemap と noindex の一時矛盾）**: SITE_URL 設定時は外国語 URL も sitemap 掲載される一方、外国語 meta robots は noindex（§26 で評価）。

## 26. sitemap と noindex の整合（本指示 §26）

SITE_URL 設定時、外国語 URL は sitemap に掲載されるが meta robots は noindex。評価:

```text
- 公開前準備期間としては許容可能（sitemap 掲載は「index 意図の宣言」だが、meta robots noindex が優先されクロール後 index されない）。
- ただし正式配信環境で長期に「sitemap 掲載 + noindex」を残すと、クローラへ矛盾シグナルを送る。
- したがって「SITE_URL 設定」と「外国語 noindex 解除」を近接した公開単位にするのが安全（§27 Option C）。
```

現状 Stage A / 未設定 build では SITE_URL 未設定＝sitemap 空のため、この矛盾は**発生していない**（外国語 URL は sitemap に載らない）。矛盾が顕在化するのは SITE_URL を設定した瞬間から。

## 27. Production-release sequence options

```text
Option A: ドメイン接続 → SITE_URL 設定 → noindex 解除 → deploy → 実配信監査
          リスク: deploy 前後で一時的に「sitemap 掲載 + noindex」状態が生じ得る。

Option B: ドメイン接続 → noindex 解除コード準備 → SITE_URL 設定 → 同一 deploy → 実配信監査

Option C（AI 推奨）: ドメイン接続 → SITE_URL 設定 → noindex 維持のまま実配信 SEO 監査 → 次 deploy で noindex 解除
          理由: canonical/hreflang/sitemap/robots を本番 URL で先に検証でき、誤 URL があれば index 公開前に修正可能。
                noindex 解除を独立した最終判断にできる。
```

**AI 推奨 = Option C**。SITE_URL 設定を先行し、本番 URL で SEO 監査を通してから、別 deploy で外国語 noindex を一括解除する。

## 28. Human decisions required

| ID | 決定事項 | 選択肢 | AI 推奨（ドメイン未決定前提） |
|----|---------|--------|------------------------------|
| D-A | 正式ドメインは決定済みか | YES / NO | **NO** |
| D-B | Stage A は引き続き検証環境か | YES / NO | **YES** |
| D-C | 正式公開順序 | A / B / C | **C** |
| D-D | 正式ドメイン未決定時の noindex 解除 | APPROVE / DO NOT APPROVE | **DO NOT APPROVE** |
| D-E | og:site_name | A=日本語維持 / B=locale 別へ変更 / C=後続課題 | **C** |
| D-F | SITE_URL 設定後、noindex 維持で一度本番監査するか | YES / NO | **YES** |
| D-G | 外国語 noindex 解除を 12 ページ一括で行うか | YES / NO | **YES** |
| D-H | Search Console 等を SEO 公開後の別課題とするか | YES / NO | **YES** |

補足:
- D-A で正式ドメインを提示する場合でも、本 Sprint 内で Vercel 環境変数設定・独自ドメイン接続・DNS 設定は行わない（明示承認のある別作業）。
- D-D は、正式ドメイン未決定である限り AI は解除を実装できない（条件付き許可の発動条件を満たさない）。

## 29. Human decision

（未受領。下記フォーマットで回答してください。）

```text
D-A / D-B / D-C / D-D / D-E / D-F / D-G / D-H の回答
（正式ドメインを決定済みの場合は SITE_URL 完全値・www 正規化方針も）
```

## 30. noindex-release result

```text
外国語 noindex 解除 = 保留（未実施）
理由: 正式ドメイン未決定（#1 PENDING）・SITE_URL 未設定（#2 PENDING）・本番配信監査不能（#10 PENDING）・人間解除承認なし（#17 PENDING）。
技術基盤（canonical/hreflang/x-default/OG/sitemap/robots）はローカル正式 URL 相当監査で全 PASS。
```

## 31. Deferred work

- 正式ドメイン決定 → SITE_URL 設定 → 本番 URL で canonical/hreflang/x-default/sitemap 16/robots Sitemap 行/OG URL・locale/全 route status を実配信監査（§27 Option C）。
- 外国語 noindex 一括解除（12 ページ・Sprint 39 D-G）。解除時の条件付き許可対象 = `app/[locale]/{page,profile/page,gallery/page}.tsx`・`lib/seo/metadata.ts`（＋test）。
- og:site_name の locale 化（D-E 次第・R3）。言語別 404（Sprint 39 D-H）。`/ja` redirect の 308 化（ドメイン後）。
- Google Search Console / Bing Webmaster / sitemap 送信 / 所有権確認 / DNS TXT / analytics（正式公開後の運用課題・本 Sprint コード対象外）。

## 32. Final verdict

```text
NOINDEX_RELEASE_NOT_APPROVED_PRODUCTION_URL_PENDING
（Sprint 41 実装は設計どおりで、locale 別 canonical/hreflang/x-default/OG locale・URL/sitemap 16/robots Sitemap 行を
 ローカル正式 URL 相当〔SITE_URL=example.com〕監査で全 PASS。Stage A〔未設定〕は canonical/hreflang/og:url 非出力・
 sitemap 空・robots Sitemap 行なし・外国語 noindex 維持・ja indexable で契約どおり。全検証 green
 〔lint 0 / tsc 0 / build 両モード成功・警告は承認済み 1 件のみ / node 103/103 / head・sitemap・robots・回帰 実失敗 0〕。
 noindex 解除条件 17 のうち PENDING 4〔正式ドメイン・SITE_URL・本番配信監査・人間承認〕はすべて正式ドメイン未決定に起因し、
 FAIL は 0。したがって外国語 noindex 解除は保留し、正式ドメイン決定を待つ。コード・noindex・設定は無変更。）
```

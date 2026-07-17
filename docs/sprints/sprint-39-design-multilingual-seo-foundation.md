# Sprint 39 — 多言語 SEO 基盤・正式公開 URL 設計（設計・意思決定のみ）

Status: **APPROVED**（2026-07-18・D-A=C / D-B=B / D-C=A / D-D=B / D-E=A / D-F=A / D-G=A / D-H=B・正式ドメイン未決定・Stage A=検証環境・SITE_URL 契約確定）

> 人間決定（確定）:
> - **D-A=C**: SITE_URL（Server 専用・非公開）で本番 URL を切替。正式ドメイン確定まで本番値を設定せず外国語 noindex 維持。
>   公開切替前は未設定時に誤 canonical を出さない設計、切替時は SITE_URL 必須化＝未設定/不正なら build 失敗。
> - **D-B=B**: Stage A（`https://supitaro-site.vercel.app`）は検証環境。正式ドメインは未決定。
> - **D-C=A**: x-default は各ページの日本語対応 URL（トップ→`/`・プロフィール→`/profile`・ギャラリー→`/gallery`）。
> - **D-D=B**: metadata 翻訳レビューを先行（Sprint 40）。
> - **D-E=A**: lastModified 省略。 **D-F=A**: changeFrequency・priority 省略。
> - **D-G=A**: SEO 基盤全完了後に一括で noindex 解除。 **D-H=B**: 404 多言語化は SEO 公開後の別課題。
> - SITE_URL 用途 = metadataBase / canonical / openGraph.url / hreflang / sitemap / robots。`NEXT_PUBLIC_` 不要。
> - hreflang = ja / en / zh-Hans / zh-Hant / ko。News は ja のみ（canonical `/news`・hreflang クラスタなし）。
> - robots = 全体クロール許可・Sitemap URL 記載・外国語を Disallow しない。外国語 sitemap 掲載＋noindex 解除は基盤全完了後に一括。
> - 後続: Sprint 40=metadata 翻訳レビュー／Sprint 41=SITE_URL helper・metadataBase・canonical・hreflang・x-default・sitemap・robots・OG locale/URL 是正／Sprint 42=配信監査・noindex 解除可否の最終判断。

> 本 Sprint は **設計・意思決定・実装スコープ確定のみ**。SEO コード・metadata・sitemap・robots・noindex は変更しない。
> 単一関心事: 多言語 SEO 基盤の公開 URL・alternate・index 制御契約を設計する。
> 判定: `MULTILINGUAL_SEO_FOUNDATION_DESIGN_READY_FOR_HUMAN_DECISION`

---

## 1. Purpose

Sprint 28〜38 で 5 locale の多言語実装（ルーティング・辞書・ナビ・言語切替・トップ/プロフィール/ギャラリー正式翻訳・
共通 UI 承認・外部リンク/FOLLOW a11y locale 化）が完了した。外国語ページは正式本文を持つが、検索公開に必要な SEO 基盤
（正式ドメイン・metadataBase・canonical・hreflang・x-default・sitemap・robots）が未実装のため `noindex` を維持している。
本 Sprint はこれらを設計・決定し、後続実装 Sprint の境界を確定する。

## 2. Baseline

```text
branch = main / working tree = clean
local HEAD = origin/main = remote = dc05465e2cd90cf60052317af7e0b7e1c8511036
latest commit = feat: localize external link accessibility labels
```

一致確認済み（本 Sprint はコード無変更）。

## 3. Decision-of-record references

- **Sprint 27**（decision of record・競合時優先）: locale=ja/en/zh-hans/zh-hant/ko、ja は接頭辞なし、News は ja のみ（D-01=B）、
  簡繁独立（D-02=D）、ルーティング R2（D-08）。
- **Sprint 28/29**: R2 ルーティング（rewrites で ja 接頭辞なし配信・redirects で `/ja`→`/` 正規化・middleware なし）、Stage A 実配信検証。
- **Sprint 32**: `localizedPath`/`RouteKey`/`isRouteAvailable`/`languageSwitchTarget`（URL 生成の source of truth）。
- **Sprint 33/34/35**: 各ページ正式翻訳＋外国語 noindex 維持（各 §18/§19/§20）。
- **Sprint 37/38**: 共通 UI・外部リンク/FOLLOW a11y の正式化。

競合時は Sprint 27 を優先。

## 4. Current locale inventory

```text
内部 locale（URL セグメント・小文字）: ja / en / zh-hans / zh-hant / ko   （lib/i18n/locales.ts）
HTML lang（BCP-47）:                  ja / en / zh-Hans / zh-Hant / ko   （htmlLang()）
defaultLocale = ja（接頭辞なし公開）
localesWithNews = ["ja"] のみ
```

**内部 locale ID（zh-hans）と公開 hreflang 値（zh-Hans）は別物**。hreflang には `htmlLang()` を再利用する（§7）。

## 5. Current route inventory

公開パス契約（Sprint 28）:

```text
ja      : /            /profile        /gallery        /news
en      : /en          /en/profile     /en/gallery
zh-hans : /zh-hans     /zh-hans/profile /zh-hans/gallery
zh-hant : /zh-hant     /zh-hant/profile /zh-hant/gallery
ko      : /ko          /ko/profile     /ko/gallery
```

正式 URL でないもの: `/ja`（→`/` に redirect）・`/zh`（404）・外国語 News（`/en/news` 等は 404・dynamicParams=false）。
build 出力 = 19 static（Sprint 38 で確認済み）。route 一覧はコード（generateStaticParams＋localesWithNews）から確定でき、
本 Sprint では build 実行は不要と判断（設計・調査目的の範囲で code 読解で足りる）。

## 6. Existing metadata audit

| 箇所 | 現状 |
|------|------|
| `app/[locale]/layout.tsx` root metadata | `metadataBase: new URL("https://supitaro-site.vercel.app")`（**Stage A ハードコード**）。`title.default/template`（`%s \| すぴたろう公式サイト`）、`description`、`openGraph`（title/description/siteName/`locale:"ja_JP"` 固定/type/images）、`twitter`。 |
| `alternates.canonical` | `...(siteConfig.siteUrl ? { alternates: { canonical: "/" } } : {})` → `siteUrl=""` のため **全ページで canonical 非出力**（ja 含む）。 |
| `openGraph.url`（トップレベル） | **未設定**（images 内の `url` は OG 画像パス）→ **og:url 非出力**。OG locale は `ja_JP` 固定（外国語でも ja_JP）。 |
| トップ `generateMetadata` | ja→`{}`（root 継承・indexable）／外国語→`{ robots: { index:false, follow:false } }`。 |
| プロフィール `generateMetadata` | ja→`{title:"プロフィール", description:…}`（indexable）／外国語→noindex。 |
| ギャラリー `generateMetadata` | ja→`{title:"ギャラリー", description:…}`（indexable）／外国語→noindex。 |
| News `metadata`（ja route のみ） | `{title:"お知らせ", description:…}` 静的・robots override なし＝indexable。外国語 News は 404。 |

**外国語 metadata 文言（title/description）は未翻訳**（root の日本語 title template を継承しつつ noindex）。

## 7. Existing noindex audit

- **日本語ページ（/・/profile・/gallery・/news）は全て indexable**（robots override なし＝root 既定）。**ja への noindex 漏れは無し**（確認済み）。
- **外国語ページ（トップ・プロフィール・ギャラリー全 3 種 × 4 locale）は全て `robots:{index:false,follow:false}`**（各ページ generateMetadata の非 ja 分岐）。
- 404（`app/not-found.tsx`）は Next 既定（noindex 明示なし・HTTP 404）。

## 8. Existing sitemap audit

**未実装**。`app/sitemap.ts`／`app/sitemap.xml`／`public/sitemap.xml` いずれも不在。

## 9. Existing robots audit

**未実装**。`app/robots.ts`／`public/robots.txt` いずれも不在。現状クロールは無制限（Disallow なし）で、外国語は meta robots の noindex のみで制御。

## 10. Current Stage A URL

```text
https://supitaro-site.vercel.app
```

`metadataBase` にハードコードされている（唯一の URL 定義箇所）。`config/site.ts` の `siteUrl` は空文字（canonical/OG 用の正式 URL は未確定）。

## 11. Production URL options

| Option | 内容 | 評価 |
|--------|------|------|
| A | 現在の Vercel URL を正式 URL とする | すぐ進められるが、独自ドメイン移行時に canonical 全変更・本番/検証境界が曖昧。 |
| B | 独自ドメイン確定まで SEO 公開を保留 | canonical 再変更を避け一度で確定できる／noindex 解除は遅れる。 |
| **C** | 設定値（`SITE_URL`）で本番 URL を切替可能にする | Stage A と本番を分離・移行時のコード変更ゼロ。未設定時の契約（§24/§27）が必要。**実装 Sprint の推奨機構**。 |

**正式ドメインの決定状況**: 本 Sprint 指示に具体ドメインの提示は無い → **未決定として扱う**（§3・推測/購入/設定しない）。
→ AI 推奨は **機構は C（`SITE_URL` env）を導入し、タイミングは B（正式ドメイン確定＋設定まで noindex 解除しない）** の組合せ（§28 の D-A）。

## 12. metadataBase design

- **URL source of truth を 1 箇所に**: Server 専用ヘルパー（例 `lib/seo/siteUrl.ts` の `getSiteUrl()`）が `process.env.SITE_URL` を読み、
  絶対 https・末尾スラッシュ除去で正規化して返す。`config/site.ts` の既存 `siteUrl` フィールドはこの値を指す形へ整理（実装 Sprint）。
- `metadataBase = new URL(getSiteUrl())`。canonical・OG・sitemap・robots が同一 helper を共用（重複連結を各所に作らない・§23）。
- Server 側のみ・build 時確定・locale/ページで重複しない・不正 URL を黙認しない（§27）。
- 現状の Stage A ハードコードは実装 Sprint で `getSiteUrl()` へ置換（**本 Sprint では変更しない**）。

## 13. Canonical design

各公開ページの**自己参照 canonical**（絶対 URL・ja は接頭辞なし）:

```text
/         → <SITE_URL>/            /profile → <SITE_URL>/profile
/gallery  → <SITE_URL>/gallery     /news    → <SITE_URL>/news
/en       → <SITE_URL>/en          /en/profile → <SITE_URL>/en/profile   /en/gallery → …
（zh-hans / zh-hant / ko も同様）
```

canonical を付与しない: `/ja`・`/zh`・外国語 News・404・存在しない route。日本語の接頭辞なし URL を必ず canonical とする。
生成は `localizedPath(locale, route)` を絶対化（§9 の helper）。

## 14. hreflang design

相互に対応するページだけを alternate 列挙（`alternates.languages`）:

- **トップ / プロフィール / ギャラリー**: `ja / en / zh-Hans / zh-Hant / ko` ＋ `x-default`。各値は `htmlLang(locale)` → 絶対 URL。
- **News**: 日本語のみ存在 → **hreflang クラスタを付けない**（canonical のみ）。外国語 News URL は存在しないため架空の hreflang を作らない（§6）。
- 対称性: あるページの alternates は、その route が存在する全 locale（`isRouteAvailable`）を相互に指す。

## 15. x-default design

| Option | 内容 |
|--------|------|
| **A（推奨）** | `x-default` → 日本語対応ページ（トップ=`/`、プロフィール=`/profile`、ギャラリー=`/gallery`） |
| B | 専用言語選択ページ（現状不在・新規実装が必要） |
| C | x-default を付けない |

**AI 推奨 = A**。理由: 日本語が接頭辞なしの正本・専用言語選択ページが無い・現行ルーティング契約と整合。
プロフィール/ギャラリーの x-default も**各々の日本語対応ページ**（`/profile`・`/gallery`）へ向ける。

## 16. News policy

News は ja のみ（Sprint 27 D-01=B）。canonical=`<SITE_URL>/news`（日本語のみ）、hreflang なし、sitemap に ja `/news` のみ掲載。
外国語 News（`/en/news` 等）は 404 のまま・alternate/sitemap に含めない。News 記事の個別ページは現状存在しない（一覧 `/news` のみ）。

## 17. 404 policy

現行 404 = グローバル日本語ページ（`app/not-found.tsx`・HTTP 404・`<html lang="ja">`）。SEO 上以下を維持:

```text
HTTP 404 / canonical なし / hreflang なし / sitemap 非掲載 / index 対象外
```

言語別 404 は本 Sprint で実装しない（§30 D-H・将来課題）。

## 18. Sitemap design

`app/sitemap.ts`（`MetadataRoute.Sitemap`）で以下の**正式 URL のみ**を列挙（計 16）:

```text
ja      : /  /profile  /gallery  /news              （4）
en      : /en  /en/profile  /en/gallery             （3）
zh-hans : /zh-hans  /zh-hans/profile  /zh-hans/gallery
zh-hant : /zh-hant  /zh-hant/profile  /zh-hant/gallery
ko      : /ko  /ko/profile  /ko/gallery
```

含めない: `/ja`・`/zh`・外国語 News・404・redirect 元・存在しない URL。生成は `localizedPath`＋`isRouteAvailable`（News ゲート）で重複なく列挙。
**sitemap の掲載＝index 意図**のため、外国語 URL の sitemap 掲載は **noindex 解除（§22・D-G）と同時**に有効化する（noindex 中に foreign を sitemap 掲載しない／
または実装 Sprint で ja のみ先行掲載し解除時に foreign 追加）。この結合を実装 Sprint で明示する。

## 19. lastModified policy

| Option | 評価 |
|--------|------|
| **A（推奨）省略** | 信頼できる更新日の source of truth が無い現状では省略。毎 build 現在時刻を入れると実変更なしで全 URL 更新扱いになる。 |
| B build 時刻 / C コンテンツ更新日 / D Git 情報 / E 省略 | C（コンテンツ更新日を新設）は将来 content に `updatedAt` を持てば妥当だが現状根拠なし。 |

**AI 推奨 = A（省略）**。

## 20. changeFrequency and priority policy

**AI 推奨 = 省略（A）**。実質的な検索制御効果が限定的・更新頻度の根拠がない・不要な SEO 装飾を避ける。設定する場合は明確な根拠を要文書化。

## 21. robots design

`app/robots.ts`（`MetadataRoute.Robots`）:

```text
User-agent: *
Allow: /
Sitemap: <SITE_URL>/sitemap.xml
```

- **外国語 noindex 中もクロールを robots.txt で禁止しない**（Disallow しない）。理由: Disallow するとクローラが meta robots の noindex を確認できず、
  かえって index 残存の恐れがある。
- `host` は任意（Next のサポート状況に応じ実装 Sprint で判断）。Sitemap URL は `getSiteUrl()` から生成（ハードコードしない）。

## 22. noindex release conditions

外国語トップ・プロフィール・ギャラリーの noindex 解除は、以下を**全て**満たすまで行わない（AI 推奨 = 一括解除・§30 D-G=A）:

```text
□ 正式公開ドメイン確定（D-A）
□ SITE_URL 設定・metadataBase が正式 URL を指す
□ locale 別 title/description の人間承認（Sprint 40）
□ canonical 実装（自己参照・ja 接頭辞なし）
□ hreflang 相互リンク実装（5 locale＋x-default／News 除外）
□ x-default 方針確定（A）
□ sitemap 実装（正式 URL のみ）
□ robots 実装（Disallow なし・Sitemap 記載）
□ Stage A または本番で全 URL 監査（§26）
□ lang / noindex / canonical / hreflang / OG URL 整合
□ 404・存在しない locale（/zh・/fr）の回帰確認
```

## 23. Environment-variable option（Option C 採用時）

```text
変数名           : SITE_URL（秘密情報でない・Server metadata/sitemap/robots 専用 → NEXT_PUBLIC_ 不要）
必須/任意        : SEO 出力（canonical/sitemap/OG url）を出す時のみ必須（§24 と連動）
local development : 未設定（または http://localhost:3000）
preview deployment: 未設定 または Stage A（noindex 維持なので canonical 出さない運用も可）
production        : 正式ドメイン（https・末尾スラッシュなし）
未設定時の挙動    : canonical/sitemap/OG url を出さない（§24 の D）。noindex 解除もしない。
URL validation   : `new URL()` で絶対 https を検証・不正は拒否
末尾スラッシュ    : 正規化で除去（`https://host`。ページ側は localizedPath がパスを付ける）
```

`NEXT_PUBLIC_` は不要（Client で URL を使わない・Server の metadata/sitemap/robots のみ）。

## 24. Error policy

本番 URL 設定が不正/未設定時の挙動（層別）:

```text
noindex 維持期（正式ドメイン未確定）:
  SITE_URL 未設定 → canonical/sitemap/OG url を出さない（Option D）。build は成功。noindex 継続。

noindex 解除・本番 SEO 公開時:
  SITE_URL 必須 → 未設定/不正なら build 失敗（Option A）。誤った canonical を静かに出すより build 失敗を優先（§27）。
```

開発/preview（noindex 期）は Option D で分離し、本番公開の切替時に Option A で厳格化する。C（localhost fallback）は本番 canonical 事故の恐れがあり非採用。

## 25. Test plan（後続実装 Sprint 用・本 Sprint では追加しない）

- **URL helper**: ja 接頭辞なし／4 外国語 prefix／`/ja` 不生成／`/zh` 不生成／外国語 News 不生成／絶対 URL／末尾スラッシュ統一。
- **canonical**: 各正式 route の自己参照／404 なし／redirect 元なし。
- **hreflang**: top/profile/gallery は 5 locale＋x-default／htmlLang 値（zh-Hans/zh-Hant）／News は ja のみ（クラスタなし）／相互対称。
- **sitemap**: 正式 URL のみ／重複なし／404・redirect 元・外国語 News・`/ja`・`/zh` なし。
- **robots**: Sitemap URL 記載／クロール禁止の誤設定なし。
- 既存方式（tsc→CJS＋`@/` resolver shim・`node --test`）を踏襲。package.json に test script 追加しない。

## 26. Browser-audit plan（後続実装後）

確認項目: document head の canonical／hreflang 一覧／x-default／robots meta／OG URL／sitemap.xml／robots.txt／status／redirects／404／noindex／html lang／final URL。

対象 URL:

```text
/  /profile  /gallery  /news
/en  /en/profile  /en/gallery
/zh-hans  /zh-hant/profile  /ko/gallery
/ja  /zh  /en/news  /no-such-page
```

## 27. Human decisions required

| ID | 決定事項 | 選択肢 | AI 推奨（ドメイン未確定前提） |
|----|---------|--------|------------------------------|
| D-A | 正式公開 URL | A=Vercel URL / B=独自ドメイン確定まで保留 / C=環境変数切替 | **B または C**（機構=C、タイミング=B） |
| D-B | Stage A の位置づけ | A=正式公開環境 / B=検証環境 | **B（検証環境）** |
| D-C | x-default | A=日本語対応ページ / B=なし / C=言語選択ページ後続 | **A** |
| D-D | metadata 翻訳と SEO 実装の順序 | A=同一 Sprint / B=翻訳レビュー先行 / C=SEO 構造のみ先行・noindex 維持 | **B** |
| D-E | sitemap lastModified | A=省略 / B=build 時刻 / C=更新日新設 | **A** |
| D-F | changeFrequency・priority | A=省略 / B=設定 | **A** |
| D-G | noindex 解除 | A=全完了後一括 / B=locale 順次 / C=ページ種別順次 | **A** |
| D-H | 404 多言語化 | A=SEO 公開前に必要 / B=SEO 公開後の別課題 | **B** |

補足の確認事項:
- **正式ドメインを既に決定しているか**（scheme/host/www 有無/末尾スラッシュ/http→https/www 正規化）。未提示のため未決定として設計した。決定済みなら D-A=C の `SITE_URL` 値として提供を。

## 28. AI recommendation

```text
D-A=B または C（機構 C＝SITE_URL 導入、解除タイミングは B）/ D-B=B / D-C=A / D-D=B /
D-E=A / D-F=A / D-G=A / D-H=B
```

- 正式ドメイン未確定でも設計は完成できる（ドメインは D-A の入力）。誤った canonical を先行出力しないため、確定・設定・全 SEO 基盤完了まで noindex を一括維持。
- 正式ドメインが確定済みなら Sprint 40・41 を連続実施可能。

## 29. Implementation Sprint boundaries

```text
Sprint 40: locale 別 metadata（title/description）翻訳レビュー・人間承認（二段階フロー・本文翻訳）
Sprint 41: SEO URL helper（getSiteUrl/canonical/alternates）・metadataBase・canonical・hreflang・sitemap・robots 実装
           （SITE_URL 機構・OG url を canonical helper と共用・テスト追加）
Sprint 42: 本番または Stage A 監査・§22 の解除条件充足確認・noindex 解除判断
```

D-D=B を採用した場合の推奨順。正式ドメイン確定済みなら 40→41 連続、42 で監査・解除。

## 30. Risks

- **R1（Stage A ハードコード）**: `metadataBase` が Stage A 固定。実装 Sprint で `getSiteUrl()` へ置換予定。本 Sprint では変更しない（設計記録のみ）。
- **R2（canonical 未出力）**: `siteUrl` 空ゲートで ja 含め canonical 非出力。設計上、SITE_URL 導入で自己参照 canonical を全公開ページに付与。
- **R3（OG locale 固定）**: `openGraph.locale:"ja_JP"` が外国語でも ja_JP。実装 Sprint で locale 別 OG locale（ja_JP/en_US/zh_CN/zh_TW/ko_KR 等）を検討（本 Sprint では決定のみ保留・Sprint 41 スコープ）。
- **R4（sitemap と noindex の結合）**: noindex 中に foreign を sitemap 掲載すると矛盾。§18 のとおり解除と同時に有効化。
- **R5（正式ドメイン未確定）**: canonical/hreflang/sitemap の絶対 URL を確定できないため、値の実装は D-A 確定後。設計（構造・helper・対象 URL 集合）は確定済み。
- **R6（sitemap alternates API）**: Next 16.2.10 は `MetadataRoute.Sitemap` の per-entry `alternates.languages` に対応。実装 Sprint で HTML の `alternates.languages` と sitemap 側のどちらを主にするか最終確認（§13 仕様確認は実装時に再検証）。

## 31. Deferred work

- 外国語 metadata 文言翻訳（Sprint 40）。SEO helper/canonical/hreflang/sitemap/robots 実装（Sprint 41）。noindex 解除監査（Sprint 42）。
- 言語別 404（D-H=B・SEO 公開後の別課題）。locale 別 OG locale（R3）。正式ドメイン確定後の DNS/www 正規化・trailing slash 最終確認・Search Console 登録（運用手順・§24）。
- 「Validate first」で発見した既存 metadata の状態（R1/R2/R3）は**修正せず**本 Sprint 設計へ記録し、Sprint 41 で一括是正。

## 32. Final verdict

```text
MULTILINGUAL_SEO_FOUNDATION_DESIGN_READY_FOR_HUMAN_DECISION
（多言語 SEO 基盤の公開 URL・canonical・hreflang・x-default・sitemap・robots・noindex 解除条件・環境変数・エラー方針・
 後続 Sprint 境界を設計し、人間判断 D-A〜D-H を提示。正式ドメインは未提示のため未決定として扱い、機構=SITE_URL（C）／
 タイミング=確定まで noindex 維持（B）を推奨。既存の Stage A ハードコード・canonical 未出力・OG locale 固定は修正せず記録。
 コード・metadata・sitemap・robots・noindex は無変更。）
```

# Sprint 41 — 多言語 SEO 基盤実装

多言語 SEO の URL・alternate・sitemap・robots・共有 metadata 基盤を実装し、noindex 解除前の技術準備を完成させた。
外国語ページの noindex は**解除しない**（正式ドメイン未決定・Stage A は検証環境）。

- 種別: 単一フェーズ実装（検証まで完了・commit 前報告で停止）。
- 判定: `MULTILINGUAL_SEO_FOUNDATION_IMPLEMENTED_NO_INDEX_RELEASE_PENDING`

---

## 1. Purpose

Sprint 39 設計・Sprint 40 metadata 翻訳を受け、SITE_URL helper・metadataBase 統一・canonical・hreflang・x-default・
locale 別 OG/Twitter・OG locale/URL・sitemap・robots を実装する。正式公開（noindex 解除）は Sprint 42。

## 2. Baseline

```text
branch = main / working tree = clean（実装前）
local HEAD = origin/main = remote = 74b47645dbe0fa105973e6f42a4fea64d8a60044
latest commit = feat: localize page metadata
```

## 3. Decision-of-record references

Sprint 27（locale 方針）／39（SEO 設計: D-A=SITE_URL / D-B=Stage A 検証 / D-C=x-default ja / D-E/F=lastmod/priority 省略 /
D-G=一括 noindex 解除 / D-H=404 後回し）／40（metadata 翻訳・content/seoMetadata.ts）。競合時は 27/39/40 を優先。

## 4. Existing SEO audit（実装前）

- `app/layout.tsx` 不在（root は `app/[locale]/layout.tsx`）。sitemap/robots は**完全未実装**。
- root metadata: `metadataBase = new URL("https://supitaro-site.vercel.app")`（Stage A ハードコード）、`alternates.canonical` は
  `siteConfig.siteUrl`（空）ゲートで**全ページ非出力**（潜在バグ: 設定時に全ページ canonical="/" になる誤り）。
- `siteConfig.siteUrl=""`（参照は config 定義＋layout ゲートのみ）。`config/site.ts` は Client（FloatingSupitaro）からも import される。
- OG/Twitter は root の日本語を全ページ継承（外国語も ja）。`localizedPath`/`htmlLang`/`isRouteAvailable`/`localesWithNews` は再利用可能。

## 5. SITE_URL contract

`lib/seo/site-url.ts`（Server 専用・`NEXT_PUBLIC_` 不使用）。用途 = metadataBase / canonical / hreflang / x-default /
`og:url` / sitemap / robots。config/site.ts には URL を持たせない（Client import があるため `process.env` を埋め込まない・§33）。

## 6. SITE_URL validation

`new URL()` で解析し、**https 限定・credentials/query/fragment/path 拒否・末尾スラッシュ正規化**（origin のみ返す）。
未設定/空/空白は null（optional）。不正値は例外（誤 URL を黙って出さない）。テスト 12 件で網羅。

## 7. Unset behavior

Sprint 39 §26 の「環境変数を増やさず code で安全に進める」契約を採用:

```text
ページ metadata : SITE_URL 未設定なら canonical / hreflang / og:url を非出力
sitemap         : 未設定なら空配列
robots          : 未設定なら Sitemap 行を省略（Allow: / は維持）
```

**Stage A / localhost への fallback は禁止**（§7）。新しい公開フラグ（SEO_PUBLICATION_ENABLED 等）は追加しない（過剰設計回避）。
正式公開切替は Sprint 42 で SITE_URL 設定＋監査後に判断。

## 8. metadataBase implementation

`app/[locale]/layout.tsx`: Stage A ハードコードを撤去し `metadataBase: getOptionalSiteUrl()`（`URL | null`。null は Next の未設定扱い）。
未設定時は Next が localhost 既定を使い警告（1 件）を出すが、**Stage A URL は出力しない**（§8 A 案）。旧 canonical ゲートは削除（潜在バグ解消）。

## 9. Canonical helper

`lib/seo/routes.ts` の `buildCanonicalUrl(siteUrl, locale, route)` = `${siteUrl.origin}${localizedPath(locale, route)}`。
`localizedPath` 再利用で route 文字列を重複させない。ja 接頭辞なし・外国語 prefix・query/fragment なし・末尾スラッシュなし
（root は Next が `https://<host>` に正規化）。

## 10. Canonical page coverage

top/profile/gallery（buildLocalizedPageMetadata 経由）＋ news（`app/[locale]/news/page.tsx` で ja `/news`）に自己参照 canonical。
**SITE_URL 設定時のみ出力**。`/ja`・`/zh`・外国語 News・404・redirect 元には付けない（実配信監査で確認）。

## 11. Hreflang helper

`buildLanguageAlternates(siteUrl, route)` → `Partial<Record<HtmlLang | "x-default", string>>`。route が存在する locale のみ
（`isRouteAvailable`）を `htmlLang` コード（ja/en/zh-Hans/zh-Hant/ko）→絶対 URL で列挙し、x-default（ja ページ）を追加。
キー型を限定したため Next の `Languages`（HrefLang）へ**型安全**に渡せる（cast なし）。top/profile/gallery のみ（News は単一言語で付けない）。

## 12. x-default

x-default は各ページの**日本語対応 URL**（top→/、profile→/profile、gallery→/gallery。Sprint 39 D-C）。専用言語選択ページは作らない。

## 13. News policy

News は ja のみ。canonical=`/news`（SITE_URL 設定時）、**hreflang なし**、sitemap に ja `/news` のみ。外国語 News は 404 維持・alternate/sitemap に含めない。

## 14. Open Graph title and description

`lib/seo/metadata.ts` の `buildLocalizedPageMetadata` が top/profile/gallery の openGraph.title/description に
**Sprint 40 承認の seoMetadata**（copy.title/description）を明示設定（新規翻訳は作らない）。外国語は日本語 root を継承しなくなった。
ja も承認済み ja 値（＝ページ title/description）を OG に使用（従来 OG は site 名固定だったが、承認値へ統一）。

## 15. Open Graph locale

`lib/i18n/locales.ts` に `ogLocale`（SEO 専用・htmlLang と別）を追加: ja_JP / en_US / zh_CN / zh_TW / ko_KR。
全 locale 必須（型で網羅）。地域は OG 仕様上の代表値（推測で複数地域を混在させない）。

## 16. Open Graph URL

`openGraph.url` は canonical と同じ helper（buildCanonicalUrl）から生成し **canonical と一致**。SITE_URL 未設定時は非出力（Stage A ハードコードなし）。

## 17. Open Graph image preservation

Next は openGraph を深いマージしないため、page で openGraph を設定すると root の images が失われる。`buildLocalizedPageMetadata` が
`siteConfig.images.og`（url/alt/寸法 1466×643）から**明示再利用**して継承漏れを防止。画像 URL/alt/寸法は変更なし。metadataBase 設定時は
`https://<host>/images/og/...` に解決（実配信監査で確認）。

## 18. Twitter metadata

top/profile/gallery の twitter.title/description に seoMetadata を共用。`twitter.card`（summary_large_image）・`twitter.images` は維持。Twitter 用 URL フィールドは追加しない。

## 19. Metadata shared helper

`buildLocalizedPageMetadata(locale, page)` が title/description/alternates/openGraph/twitter/robots を 1 箇所で組み立て、3 ページの重複を排除。
巨大な汎用抽象化はしない（top/profile/gallery 専用の小さな helper）。

## 20. Sitemap implementation

`app/sitemap.ts`（`MetadataRoute.Sitemap`）。SITE_URL 設定時に**16 URL**（ja 4＋外国語 4locale×3）を絶対 URL で出力。
`/ja`・`/zh`・外国語 News・404・redirect 元を含めない・重複なし。**未設定時は空配列**。lastModified/changeFrequency/priority なし（§28/§29）。

## 21. Sitemap alternates

Next 16.2.10 の `MetadataRoute.Sitemap` は per-entry `alternates.languages` を型サポート（確認済み）。top/profile/gallery の各 entry に
hreflang alternates（5 locale＋x-default）を付与。News は付けない。実配信で 16 `<loc>`＋90 hreflang link（15 entry×6）を確認。

## 22. Robots implementation

`app/robots.ts`（`MetadataRoute.Robots`）。`User-Agent: * / Allow: /`。**外国語を Disallow しない**（クローラが meta robots の noindex を
確認できるように・§32）。Sitemap 行は SITE_URL 設定時のみ（未設定時に Stage A URL を出さない）。

## 23. noindex preservation

外国語 top/profile/gallery は `robots:{index:false,follow:false}` を**維持**（buildLocalizedPageMetadata が locale 別に付与・値は不変）。
日本語は indexable 維持。**本 Sprint では noindex を解除しない**（Sprint 42 で判断）。実配信で全 locale の robots を確認。

## 24. Japanese regression

ja `/`・`/profile`・`/gallery`・`/news` の title/description は Sprint 40 と byte 一致（未設定・設定の両 build で確認）。
ja canonical（設定時 `https://<host>/` 等）・OG は承認 ja 値。ページ本文・Header/Footer・言語切替は非変更。

## 25. Invalid-route regression

`/ja`→307→`/`（canonical は最終 `/`）・`/zh` 404・外国語 News 404・`/no-such-page` 404。これらに canonical/hreflang は付かない（実配信確認）。

## 26. No-JS behavior

metadata/canonical/hreflang/OG/Twitter は初期 HTML head へ Server 出力。`fetch`（JS 未実行の生 HTML）で全項目を確認＝No-JS でも正しい。
console/hydration/failed = 0（/・/en・/ko/gallery・/zh-hans/profile）。本文・Header/Footer・言語切替も既存どおり。

## 27. Tests

追加（新規）:
- `lib/seo/site-url.test.ts`（12）: 未設定/空/https/http 拒否/相対拒否/query/fragment/credentials/path 拒否/末尾スラッシュ正規化/require。env は try/finally で復元（§40）。
- `lib/seo/routes.test.ts`（6）: canonical ja 接頭辞なし/外国語 prefix/`/ja`・`/zh` 不生成/hreflang 5＋x-default/相互対称/x-default=ja。
- `lib/seo/metadata.test.ts`（6）: 未設定で alternates/og:url 非出力/設定で canonical/hreflang/og:url/title↔seoMetadata 共用（OG/Twitter）/robots ja↔外国語/og:locale/OG 画像維持。

更新: `lib/i18n/locales.test.ts`（+2＝ogLocale・htmlLang との相異）。既存（seoMetadata 8・dictionary 27・gallery 9・profile 8・topPage 7・i18n routes 9）回帰なし。

## 28. Validation results

```text
npm run lint                    → 0 problems
npx tsc --noEmit                → exit 0
npm run build（SITE_URL 未設定）→ 成功・21 static（+sitemap/robots）・metadataBase 警告 1（localhost 既定・Stage A fallback なし）
SITE_URL=… npm run build        → 成功・21 static・metadataBase 警告なし
node tests                      → site-url 12 + seo/routes 6 + seo/metadata 6 + locales 11 + i18n/routes 9 +
                                   seoMetadata 8 + dictionary 27 + gallery 9 + profile 8 + topPage 7 = 103/103
git diff --check                → clean
```

テストは既存方式（tsc→CJS＋`@/` resolver shim・`node --test`）。package.json へ test script 追加なし。

## 29. HTML head audit

一時 `SITE_URL=https://example.com`（コード非保存）で全 16 ページ head を実測。**失敗 0**。
canonical=自己参照絶対 URL・hreflang 5＋x-default（top/profile/gallery）/News 0・og:url=canonical・og:locale=locale 別・
og:image=`https://example.com/images/og/...`・robots（ja none / 外国語 noindex,nofollow）・og/twitter title=seoMetadata。回帰（redirect/404）正常。

## 30. Sitemap audit

`SITE_URL=…` で `/sitemap.xml`=200・`<loc>` **16**・hreflang link 90・`/ja`/`/zh`/外国語 News/404 なし・重複なし・lastmod/priority/changefreq なし。
**未設定時は `<loc>` 0（空）・Stage A なし**。

## 31. Robots audit

`SITE_URL=…` で `/robots.txt`=200・`User-Agent: *`・`Allow: /`・`Sitemap: https://example.com/sitemap.xml`・外国語 Disallow なし・Stage A なし。
**未設定時は Sitemap 行なし**（Allow: / は維持）・Stage A なし。

## 32. SITE_URL-unset audit

未設定 build/配信で全ページ: canonical/hreflang/og:url **非出力**・**Stage A URL 不在**・robots 維持（ja none/外国語 noindex）・ja title/description byte 一致。sitemap 空・robots Sitemap 行なし。

## 33. Changed files

```text
新規（8）:
  lib/seo/site-url.ts / site-url.test.ts     （SITE_URL helper＋検証）
  lib/seo/routes.ts / routes.test.ts         （canonical / hreflang helper）
  lib/seo/metadata.ts / metadata.test.ts     （buildLocalizedPageMetadata）
  app/sitemap.ts                             （sitemap route）
  app/robots.ts                              （robots route）
変更（8）:
  app/[locale]/layout.tsx        （metadataBase を SITE_URL 化・旧 canonical ゲート削除）
  app/[locale]/page.tsx          （top を buildLocalizedPageMetadata へ）
  app/[locale]/profile/page.tsx  （profile へ）
  app/[locale]/gallery/page.tsx  （gallery へ）
  app/[locale]/news/page.tsx     （ja canonical を条件付き付与）
  config/site.ts                 （dead siteUrl フィールド削除・責務を SITE_URL helper へ）
  lib/i18n/locales.ts            （htmlLang 型を union 化・ogLocale 追加）
  lib/i18n/locales.test.ts       （ogLocale テスト＋2）
新規（docs）:
  docs/sprints/sprint-41-implement-multilingual-seo-foundation.md（本文書）
不変（重要）:
  app/not-found.tsx・app/[locale]/news 配下の他ファイル・components/**・content/{topPage,profile,profileContent,
  gallery,galleryContent}.ts・content/i18n/**・content/seoMetadata.ts・next.config.*・package.json・lockfile・public/**・.env*
```

## 34. Risks

- **R1（noindex 継続）**: 外国語は noindex 維持。技術準備のみ完了。解除は Sprint 42（正式ドメイン確定が前提）。
- **R2（metadataBase 未設定警告）**: SITE_URL 未設定 build で Next 警告 1 件（localhost 既定）。Stage A を出さないための意図的挙動（§8 許容）。
- **R3（og:site_name）**: og:site_name は全 locale で `すぴたろう公式サイト`（サイト名・§17 は og:title/description のみ対象）。ブランド識別として維持。
- **R4（未設定時 og:image=localhost）**: SITE_URL 未設定時 og:image は localhost 既定（Stage A ではない）。noindex 中で共有対象外。設定時は正しく解決。
- **R5（Stage A ハードコード）**: runtime metadata から撤去済み。歴史的 Sprint 文書・README の記載は変更しない（§34）。

## 35. Deferred work

- 正式ドメイン確定 → SITE_URL 設定 → 実配信で canonical/hreflang/sitemap/robots/OG を監査 → **外国語 noindex 一括解除**（Sprint 42）。
- 言語別 404（Sprint 39 D-H）。Search Console/Bing 登録（運用手順）。og:site_name の locale 化（必要なら別課題）。

## 36. Recommended next Sprint

Sprint 42（配信監査・noindex 解除可否の最終判断）。正式ドメイン未決定の場合は noindex 解除を承認しない。

## 37. Final verdict

```text
MULTILINGUAL_SEO_FOUNDATION_IMPLEMENTED_NO_INDEX_RELEASE_PENDING
（SITE_URL helper・metadataBase 統一・canonical・hreflang・x-default・locale 別 OG/Twitter・OG locale/URL・sitemap・robots を実装。
 SITE_URL 未設定時は canonical/hreflang/og:url/sitemap/robots-Sitemap を非出力し Stage A へ fallback しない。外国語 noindex は維持（未解除）。
 日本語は byte 一致・indexable 維持。全検証 green [lint 0 / tsc 0 / build 両モード成功 / node 103/103 / head・sitemap・robots・未設定監査 失敗 0]。commit 前報告で停止。）
```

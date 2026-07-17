# Sprint 37 — Shared-UI Translation Review（Phase A）

Sprint 30〜32 で AI 初稿として導入した外国語**共通 UI 文言**の正式確認・校正。加えて Sprint 33 D-E で
延期された外部リンク補助文言・FOLLOW aria の扱いを確認する。

- 種別: Phase A（現行文言抽出・校正案・人間確認）。**コード変更なし**。本文書のみ新規作成。
- 先例: Sprint 33〜35 の二段階フロー。
- 判定: `SHARED_UI_TRANSLATION_REVIEW_READY_FOR_HUMAN_APPROVAL`

---

## 1. Purpose

外国語共通 UI 文言（Header/MobileMenu/Footer ナビ・言語切替・skip リンク・nav aria・メニュー開閉・
ロゴ home ラベル）を人間確認済みの正式翻訳へ確定する。Profile/Gallery 固有 UI（Sprint 34/35 承認済み）の
整合確認と、外部リンク補助文言・FOLLOW aria の扱い決定を含む。ページ本文・metadata・SEO・デザイン・
ルーティングは変更しない。

## 2. Baseline

```text
branch = main / working tree = clean
local HEAD = origin/main = remote = 4e5c3f80cd9036e0b5e5eacde1140bfdf67df1d5
latest commit = refactor: remove unused locale scaffold
```

## 3. Current dictionary structure（Sprint 36 完了時点）

`content/i18n/{ja,en,zh-hans,zh-hant,ko}.ts` の共通 UI 辞書（`schema.ts` が ja から `Dictionary` 型導出）:

```text
common        : home / profile / gallery / news
navigation    : mainNavigationLabel / mobileNavigationLabel / footerNavigationLabel / languageSwitcherLabel
language       : name（自称表記・Sprint 36 で byte 固定・本 Sprint 変更禁止）
accessibility : skipToContent / openMenu / closeMenu
```

本文コンテンツは `content/{topPage,profileContent,galleryContent}.ts`（辞書へ移動しない）。

## 4. Runtime consumer inventory

| 文字列群 | consumer | locale 解決 | 本 Sprint で校正可能か |
| --- | --- | --- | --- |
| common（nav 項目名） | `resolveNav`→Header/MobileMenu/Footer（SiteShell 経由） | Server・配線済み | ○（辞書値編集のみ） |
| navigation（aria 領域名） | SiteShell→Header/MobileMenu/Footer/LanguageSwitcher | Server・配線済み | ○ |
| language.name | LanguageSwitcher | Server・配線済み | 変更禁止（Sprint 36 固定） |
| accessibility（skip/menu） | SiteShell（skip）・MobileMenu（open/close） | Server・配線済み | ○ |
| Profile 固有 UI | `content/profileContent.ts`→ProfileTraitGrid/Card/DetailSheet | Server 解決・props | ○（Sprint 34 承認済み・整合確認） |
| Gallery 固有 UI | `content/galleryContent.ts`→GalleryCard/Grid/Lightbox/HomeGallerySection | Server 解決・props | ○（Sprint 35 承認済み・整合確認） |
| **外部リンク補助文言** | **`Button.tsx`・`ContentCard.tsx`・`ChannelLinks.tsx`・`SocialFollowLinks.tsx`（ハードコード JP）** | **なし（全 locale 日本語）** | **§15 参照（許可外依存）** |
| **FOLLOW SNS aria** | **`SocialFollowLinks.tsx`（ハードコード JP）** | **なし（全 locale 日本語）** | **§16 参照（許可外依存）** |

## 5. Japanese source inventory（正本・不変）

| ID | UI location | dict/content path | Japanese source |
| --- | --- | --- | --- |
| U01 | Header/Footer/Mobile nav | common.home | `ホーム` |
| U02 | 同上 | common.profile | `プロフィール` |
| U03 | 同上 | common.gallery | `ギャラリー` |
| U04 | nav（ja のみ・外国語 nav は news 除外） | common.news | `お知らせ` |
| U05 | Header nav aria-label | navigation.mainNavigationLabel | `メインナビゲーション` |
| U06 | Mobile nav aria-label | navigation.mobileNavigationLabel | `モバイルナビゲーション` |
| U07 | Footer nav aria-labelledby 見出し | navigation.footerNavigationLabel | `サイトメニュー` |
| U08 | LanguageSwitcher nav aria-label | navigation.languageSwitcherLabel | `言語` |
| U09 | LanguageSwitcher 表示名 | language.name | `日本語`（変更禁止） |
| U10 | skip リンク | accessibility.skipToContent | `本文へスキップ` |
| U11 | Mobile メニュー開く sr-only | accessibility.openMenu | `メニューを開く` |
| U12 | Mobile メニュー閉じる sr-only | accessibility.closeMenu | `メニューを閉じる` |
| U13 | ロゴ home ラベル（`${characterName} ${home}`） | common.home 再利用 | `ホーム`（U01 と同一） |
| U14 | Profile カード操作ヒント | profileContent.traits.moreLabel | `くわしく見る` |
| U15 | Profile シート閉じる sr-only | profileContent.traits.closeLabel | `閉じる` |
| U16 | Gallery カード拡大ヒント | galleryContent.viewLarger | `大きく見る` |
| U17 | Gallery lightbox 閉じる | galleryContent.closeLabel | `画像を閉じる` |
| U18 | Gallery カード aria（開く） | galleryContent openLabel | `{名}を大きく見る` |
| U19 | 外部リンク補助（sr-only/aria 内） | Button/ContentCard/ChannelLinks/SocialFollowLinks（ハードコード） | `(外部リンク・新しいタブで開きます)` |
| U20 | FOLLOW YouTube aria | SocialFollowLinks（ハードコード） | `YouTubeで配信を見る(外部リンク・新しいタブで開きます)` |
| U21 | FOLLOW X aria | SocialFollowLinks（ハードコード） | `Xで活動を追う(外部リンク・新しいタブで開きます)` |
| U22 | FOLLOW Twitch aria | SocialFollowLinks（ハードコード） | `Twitchで配信を見る(外部リンク・新しいタブで開きます)` |
| U23 | FOLLOW 見出し | SocialFollowLinks | `FOLLOW`（ブランド・翻訳しない） |

§3 に従い U01〜U23 の**日本語値は変更しない**。

## 6–9. Current foreign values（現行 AI 初稿）

| ID | en | zh-hans | zh-hant | ko |
| --- | --- | --- | --- | --- |
| U01 home | Home | 首页 | 首頁 | 홈 |
| U02 profile | Profile | 简介 | 簡介 | 프로필 |
| U03 gallery | Gallery | **图库** | **圖庫** | 갤러리 |
| U04 news | News | 通知 | 公告 | 소식 |
| U05 mainNav | Main navigation | 主导航 | 主導覽 | 주 내비게이션 |
| U06 mobileNav | Mobile navigation | 移动端导航 | 行動版導覽 | 모바일 내비게이션 |
| U07 footerNav | Site menu | 网站菜单 | 網站選單 | 사이트 메뉴 |
| U08 langLabel | Languages | 语言 | 語言 | 언어 |
| U10 skip | Skip to content | 跳到正文 | 跳至內文 | 본문으로 건너뛰기 |
| U11 openMenu | Open menu | 打开菜单 | 開啟選單 | 메뉴 열기 |
| U12 closeMenu | Close menu | 关闭菜单 | 關閉選單 | 메뉴 닫기 |
| U14 moreLabel | See more | 查看详情 | 查看詳情 | 자세히 보기 |
| U15 close(profile) | Close | 关闭 | 關閉 | 닫기 |
| U16 viewLarger | View larger | 放大查看 | 放大檢視 | 크게 보기 |
| U17 close(gallery) | Close image | 关闭图片 | 關閉圖片 | 이미지 닫기 |
| U18 gallery title | Gallery | **画廊** | **畫廊** | 갤러리 |

（U18 = galleryContent.pageTitle。U03 = common.gallery。**zh で不一致**＝§10 参照。）

## 10. Navigation review

- **U03 common.gallery の nav↔ページ不一致（要 REVISE・D-GAL）**: nav 項目 `图库/圖庫` に対し、Sprint 35 で
  人間承認済みの Gallery ページ h1（galleryContent.pageTitle）は `画廊/畫廊`。**同一ページなのに zh でナビ表記と
  ページ見出しが相違**（ユーザーが「图库」を押すと「画廊」ページが開く）。EN/JA/KO は一致（Gallery/ギャラリー/갤러리）。
  → **提案: common.gallery を `画廊`（hans）/`畫廊`（hant）へ統一**し、Sprint 35 承認値に合わせる。
- **U04 common.news 外国語値**: `resolveNav` は外国語で news を除外（`isRouteAvailable(news)=ja のみ`）ため、
  **外国語 nav に news 項目は出ない＝通知/公告/소식 は非表示**。実害なし → KEEP（表示されない値の校正は不要）。
- U01/U02/U05/U06/U07: 各言語で自然。KEEP。

## 11. Accessibility review

- U10 skip（跳到正文/跳至內文/본문으로 건너뛰기/Skip to content）・U11 open（打开菜单/開啟選單/메뉴 열기/Open menu）・
  U12 close（关闭菜单/關閉選單/메뉴 닫기/Close menu）: いずれも各言語で一般的な UI 表現。KEEP。
- 同一ページの nav landmark（main/mobile/footer/language）は 4 領域名が相互に異なる（テスト保証済み）。KEEP。
- U13 ロゴ home ラベル: `${characterName} ${common.home}` の連結（例 en `すぴたろう Home`）。characterName は
  `config/site.ts`（変更禁止）で全 locale 共通「すぴたろう」。→ home 部分は U01 に従う。KEEP。

## 12. Language-switcher review

- U08 navigation.languageSwitcherLabel（Languages/语言/語言/언어）: 言語一覧 nav の aria-label。各言語で自然。
  英語 `Languages`（複数）は言語リストの領域名として妥当。KEEP（D-LANG で確認）。
- U09 language.name: Sprint 36 で byte 固定・**本 Sprint 変更禁止**。KEEP。

## 13. Profile-specific UI review（Sprint 34 承認済み）

| ID | 値 | 判定 |
| --- | --- | --- |
| U14 moreLabel | See more / 查看详情 / 查看詳情 / 자세히 보기 | KEEP（Sprint 34 承認） |
| U15 closeLabel | Close / 关闭 / 關閉 / 닫기 | KEEP（Sprint 34 承認・D-CLOSE で共通化可否確認） |

profileContent.ts の他の値（pageTitle/traits.heading/lead/words/upcoming）も Sprint 34 承認済み。KEEP。
§12 に従い、単一箇所固有の文言を共通辞書へ無理に移動しない。

## 14. Gallery-specific UI review（Sprint 35 承認済み）

| ID | 値 | 判定 |
| --- | --- | --- |
| U16 viewLarger | View larger / 放大查看 / 放大檢視 / 크게 보기 | KEEP（Sprint 35 承認） |
| U17 closeLabel | Close image / 关闭图片 / 關閉圖片 / 이미지 닫기 | KEEP（Sprint 35 承認・D-CLOSE） |
| U18 pageTitle | Gallery / 画廊 / 畫廊 / 갤러리 | KEEP（Sprint 35 承認・§10 の統一先） |

**D-CLOSE**: Profile 閉じる（U15＝汎用「Close/关闭/關閉/닫기」）と Gallery 閉じる（U17＝「Close image/关闭图片/
關閉圖片/이미지 닫기」）は**別文言**。閉じる対象が異なる（詳細シート vs 画像 lightbox）ため
**KEEP-separate を推奨**（screen reader に操作対象が明確。共通化は sr 情報量を減らす）。

## 15. External-link review（U19・重要な制約）

現行 `(外部リンク・新しいタブで開きます)` は **4 コンポーネントに日本語ハードコード**（§Validate「同一文言が複数
モデルに重複」該当）:

```text
components/Button.tsx:44        sr-only（Hero の YouTube 外部 CTA=トップページで使用）
components/ContentCard.tsx:37   sr-only（News=ja のみレンダリング）
components/ChannelLinks.tsx:62  sr-only（トップページ channels）
components/SocialFollowLinks.tsx  aria-label 内（U20-U22 に埋め込み・Footer=全ページ＋トップ FOLLOW）
```

**外国語ページで日本語のまま出る箇所**: Footer の FOLLOW aria（全外国語ページ）・トップページの Hero 外部 CTA/
ChannelLinks/FOLLOW（外国語トップ）。

### 制約（許可外依存・§Validate「app 配下/許可外変更が不可避」）

これらを **locale 化するには Sprint 37 の許可外ファイルの変更が不可避**:

- `Button.tsx`・`ContentCard.tsx`・`Hero.tsx` … **Phase B 許可ファイルに含まれない**。
- `SocialFollowLinks.tsx`・`ChannelLinks.tsx` … 許可対象だが、これらは **`app/[locale]/page.tsx`（変更禁止）**から
  props を受け取る（トップページ・FOLLOW section・Hero）。SocialFollowLinks は Footer（SiteShell 経由・許可）と
  トップページ（app・禁止）の**両方**が同一コンポーネントを呼ぶため、シグネチャ変更は禁止側 caller を壊す。
- 日本語 fallback の付与は §16 で禁止。

→ **本 Sprint 内での外部リンク補助文言の完全 locale 化は不可能**（許可外ファイル必須）。**D-EXT で人間判断**:
（A）**専用 Sprint へ分離**〔recommend。app/[locale]/page.tsx・Button・ContentCard・Hero・SocialFollowLinks・
ChannelLinks をまとめて許可し、`accessibility.externalLink`＋`opensInNewTab` 等の新キー〔§17〕を追加〕、
（B）本 Sprint の許可ファイルを人間が拡張、（C）現状維持。

## 16. FOLLOW review（U20-U23・重要な制約）

- U23 `FOLLOW` 見出し: ブランド表記。全 locale 維持（翻訳しない）。KEEP。
- FOLLOW section の aria-label は `<h2>FOLLOW</h2>` の `aria-labelledby` 参照＝「FOLLOW」（別途 aria 文字列なし）。KEEP。
- U20-U22（SNS aria-label）: `YouTubeで配信を見る…`／`Xで活動を追う…`／`Twitchで配信を見る…` は
  `SocialFollowLinks.tsx` に日本語ハードコード。**§15 と同じ制約**（app/[locale]/page.tsx が同コンポーネントを呼ぶ）で
  本 Sprint 内 locale 化は不可能。ブランド名（YouTube/X/Twitch）は翻訳しない。→ **D-EXT に含める**。

（参考・将来 Sprint 用の訳案。本 Sprint では未反映）:

| ID | en | zh-hans | zh-hant | ko |
| --- | --- | --- | --- | --- |
| U19 note | `(external link, opens in a new tab)` | `（外部链接，在新标签页中打开）` | `（外部連結，在新分頁中開啟）` | `(외부 링크, 새 탭에서 열림)` |
| U20 YouTube | `Watch streams on YouTube` +note | `在 YouTube 观看直播` +note | `在 YouTube 觀看直播` +note | `YouTube에서 방송 보기` +note |
| U21 X | `Follow along on X` +note | `在 X 关注动态` +note | `在 X 關注動態` +note | `X에서 소식 보기` +note |
| U22 Twitch | `Watch streams on Twitch` +note | `在 Twitch 观看直播` +note | `在 Twitch 觀看直播` +note | `Twitch에서 방송 보기` +note |

※上表は D-EXT が（A/B）の場合に別途正式確認する初稿。本 Sprint では**反映しない**。

## 17. Proposed revisions（本 Sprint で反映する校正）

| ID | 対象 | 現行 | 提案 | 理由 |
| --- | --- | --- | --- | --- |
| U03 | common.gallery（zh-hans） | 图库 | **画廊** | Gallery ページ h1（Sprint 35 承認 `画廊`）と nav 表記を統一（D-GAL） |
| U03 | common.gallery（zh-hant） | 圖庫 | **畫廊** | 同上（`畫廊`）（D-GAL） |

上記以外の共通 UI 辞書値は **KEEP**（AI 初稿が各言語で自然＝人間確認により正式化）。

## 18. Unchanged translations（KEEP）

- common: home/profile/news（U01/U02/U04）
- navigation: main/mobile/footer/language（U05-U08）
- language.name（U09・変更禁止）
- accessibility: skip/open/close（U10-U12）
- Profile 固有（U14/U15・Sprint 34 承認）、Gallery 固有（U16-U18・Sprint 35 承認）
- 日本語正本（U01-U23 すべて）

## 19. Responsibility decisions

- 外部リンク補助文言（U19）: 現状 4 コンポーネントに重複ハードコード。将来的に `accessibility.externalLink`＋
  `opensInNewTab`（§17）へ集約が望ましいが、consumer に app/**・Button・ContentCard・Hero を含むため
  **本 Sprint では新キーを追加しない**（§17「将来用キーの大量追加」禁止・未使用キー回避）。D-EXT で方針決定。
- Profile/Gallery 固有 UI（U14-U18）: それぞれのコンテンツモデルに保持（Sprint 34/35 の責務を尊重・移動しない）。
- language.name: Sprint 36 の責務（言語切替 UI）を維持。

## 20. Ambiguous strings

- U04 common.news 外国語値: 外国語 nav 非表示のため実際には出ない（`通知`/`公告`/`소식` の register 差は
  ユーザーに見えない）。修正不要（KEEP）。将来 News を多言語化する場合に別途確認。
- U19-U22（外部リンク/FOLLOW）: §15/§16 の許可外制約により本 Sprint 反映不可。D-EXT。

## 21. Human decisions required

| ID | 決定事項 | 選択肢 | AI 推奨 |
| --- | --- | --- | --- |
| D-COMMON | 共通 UI 辞書値（U01-U12、U03 除く）を正式承認 | APPROVE(KEEP) / REVISE | **APPROVE（KEEP）** |
| D-GAL | common.gallery zh を Gallery ページ h1 と統一 | 画廊/畫廊 へ REVISE / 图库/圖庫 のまま KEEP | **画廊/畫廊 へ統一** |
| D-LANG | languageSwitcherLabel（Languages/语言/語言/언어） | KEEP / REVISE | **KEEP** |
| D-FOOTER | footerNavigationLabel（Site menu/网站菜单/網站選單/사이트 메뉴） | KEEP / REVISE | **KEEP** |
| D-CLOSE | Profile「閉じる」(U15) と Gallery「画像を閉じる」(U17) の共通化 | 別のまま KEEP / 共通化 | **別のまま KEEP** |
| D-EXT | 外部リンク補助文言・FOLLOW aria の locale 化（U19-U22・**許可外ファイル必須**） | (A)専用 Sprint へ分離 / (B)本 Sprint 許可拡張 / (C)現状維持 | **(A) 専用 Sprint へ分離** |
| D-PARTIAL | 部分承認時の扱い | 承認分のみ反映 / 全体 HOLD | 承認分のみ反映 |

### locale 単位の回答様式

```text
EN: APPROVE / REVISE / HOLD
ZH-HANS: APPROVE / REVISE / HOLD
ZH-HANT: APPROVE / REVISE / HOLD
KO: APPROVE / REVISE / HOLD
```

文字列単位（必要時）: `U03: REVISE: 画廊` / `U08: KEEP` 等。

## 22. Human approvals（確定）

| locale | 判定 | 備考 |
| --- | --- | --- |
| EN | **APPROVE** | 現行案を正式承認 |
| ZH-HANS | **APPROVE** | U03 のみ REVISE（图库→画廊）、他は現行案承認 |
| ZH-HANT | **APPROVE** | U03 のみ REVISE（圖庫→畫廊）、他は現行案承認 |
| KO | **APPROVE** | 現行案を正式承認 |

| 決定 | 回答（確定） | 内容 |
| --- | --- | --- |
| D-COMMON | **KEEP 承認** | 共通 UI 辞書値（U03 除く）を正式承認。EN/KO 含む現行案を正式化 |
| D-GAL | **画廊 / 畫廊 へ統一** | common.gallery を zh-hans `画廊`・zh-hant `畫廊` へ変更し Sprint 35 承認の Gallery ページ見出しと統一 |
| D-LANG | **KEEP** | languageSwitcherLabel 現行維持 |
| D-FOOTER | **KEEP** | footerNavigationLabel 現行維持 |
| D-CLOSE | **別のまま KEEP** | Profile「閉じる」と Gallery「画像を閉じる」は用途が異なるため共通化しない |
| D-EXT | **(A) 専用 Sprint へ分離** | 外部リンク補助文言・FOLLOW aria は本 Sprint で変更しない。必要な `app/[locale]/page.tsx`・`Button.tsx`・`ContentCard.tsx`・`Hero.tsx` 等を明示許可する独立 Sprint へ分離 |
| D-PARTIAL | **承認分のみ反映** | 部分承認時は承認済み言語・文字列だけ反映し未承認部分は変更しない（本件は全 4 言語承認済み） |

`language.name` の 5 自称表記は変更しない。日本語正本（U01-U23）は不変。

## 23. Approval status

```text
STATUS: APPROVED — all 4 foreign locales APPROVE; D-COMMON〜D-PARTIAL decided
VERDICT: SHARED_UI_TRANSLATIONS_HUMAN_APPROVED → proceed to Phase B
```

Phase B の実装対象は **承認済み共通辞書値の正式化（コメント caveat の除去）＋ `common.gallery` の
zh-hans/zh-hant 修正（图库/圖庫→画廊/畫廊）＋ 承認値の回帰テスト**に限定する。
日本語文言・UI 構造・コンポーネント・ページ本文・外部リンク補助文言・FOLLOW・URL・metadata・noindex は
変更しない。D-EXT の外部リンク/FOLLOW 実装は独立 Sprint（許可ファイル拡張）で扱う。

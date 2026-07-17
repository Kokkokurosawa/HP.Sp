# Sprint 33 Phase A — トップページ翻訳レビュー（人間確認用）

Status: **APPROVED**（2026-07-17・EN/ZH-HANS/ZH-HANT/KO すべて APPROVE、D-A〜D-F 回答済み → Phase B へ）

> Phase A 成果物。外国語ドラフトは AI 初稿だったが、下記のとおり **人間により全 4 言語 APPROVE・決定 D-A〜D-F 確定**。
> 承認済み文言のみ Phase B でコードへ反映する（Sprint 27 D-03/D-06）。

## 1. Purpose

トップページ本文を 5 locale（ja/en/zh-hans/zh-hant/ko）対応へ移行する準備として、日本語トップページの可視文字列を
抽出・分類し、en/zh-hans/zh-hant/ko の翻訳初稿を作成して人間確認に回す。本 Sprint の単一関心事はトップページ本文の
多言語化。プロフィール本文・ギャラリー詳細・News・metadata・404 は対象外。

## 2. Baseline

```text
branch = main / working tree = clean
local HEAD = origin/main = remote ref = 6edfa7cd59c4c17fced1892611505bb73b05b1b4
latest commit = feat: add locale-aware navigation and language switcher
```

## 3. Japanese source inventory（トップページ可視文字列）

セクション順（§2 で不変）: Hero → デザインギャラリー → すぴたろうって？ → FOLLOW → チャンネル → お知らせ → Footer。

| ID | UI location | 日本語原文 | source file |
|----|-------------|-----------|-------------|
| T01 | Hero 小見出し（口癖） | `おぱぁ。` | components/Hero.tsx |
| T02 | Hero h1（`hero-heading`） | `宇宙から来た、ふしぎないきもの。` | components/Hero.tsx（モバイルは読点後で改行） |
| T03 | Hero 補足文 | `すぴたろうのこと、すこしだけ、のぞいてみませんか。` | components/Hero.tsx |
| T04 | Hero CTA / チャンネル CTA | `YouTubeで配信を見る` | Hero.tsx / ChannelLinks.tsx（同一文言） |
| T05 | Hero CTA | `プロフィールを見る` | components/Hero.tsx |
| T06 | ギャラリー見出し（`home-gallery-heading`） | `デザインギャラリー` | components/home/HomeGallerySection.tsx |
| T07 | ギャラリー説明 | `すぴたろうのデザインを、すこしだけ。` | components/home/HomeGallerySection.tsx |
| T08 | ギャラリー CTA | `ギャラリーを見る` | components/home/HomeGallerySection.tsx |
| T09 | 紹介見出し（`introduction-heading`） | `すぴたろうって？` | components/CharacterIntroduction.tsx |
| T10 | 紹介文 1（＝T02 と同一文字列） | `宇宙から来た、ふしぎないきもの。` | content/profile.ts `intro[0]` |
| T11 | 紹介文 2 | `丸いものが好き。` | content/profile.ts `intro[1]` |
| T12 | 紹介文 3 | `家主の留守中に、こっそりゲーム配信をしている。` | content/profile.ts `intro[2]` |
| T13 | 紹介 CTA | `もっとくわしく` | components/CharacterIntroduction.tsx |
| T14 | チャンネル見出し（`channels-heading`） | `チャンネル` | components/ChannelLinks.tsx |
| T15 | YouTube カード説明 | `こっそりゲーム配信をしているチャンネル` | components/ChannelLinks.tsx |
| T16 | X カード CTA | `Xで活動を追う` | components/ChannelLinks.tsx |
| T17 | X カード説明 | `公式アカウント` | components/ChannelLinks.tsx |
| T18 | 外部リンク注記（sr-only・複数箇所共通） | `(外部リンク・新しいタブで開きます)` | Button.tsx / ChannelLinks.tsx / ContentCard.tsx |
| T19 | Hero 画像 alt | `白い体に青い目、額の青いひし形、青い耳と尻尾を持つ、すぴたろうの全身イラスト` | config/site.ts `images.hero.alt` |
| T20 | FOLLOW Twitch aria 動作部（下記 §Risk R2） | `Twitchで配信を見る` | components/SocialFollowLinks.tsx |

抽出した可視/アクセシブル文字列 = 20 種（T04 は 2 箇所・T18 は 3 箇所・T02=T10 で重複を含む）。

### 休眠フォールバック（現在レンダリングされない・翻訳対象外）
`画像準備中`（Hero プレースホルダー・画像設定済で非表示）、`準備中`（チャンネル未設定分岐・URL 設定済で非表示）、
Hero プレースホルダー aria `すぴたろうのメインビジュアル(画像準備中)`。→ 発火しないため本 Sprint では扱わない。

## 4. Translation scope

- **A. 翻訳対象**: T02/T03/T05/T06/T07/T08/T09/T11/T12/T13/T14/T15/T16/T17/T18/T19（＋ T04・T20 の「動作説明」部分。ブランド名は維持）。
- **B. 原語維持（固有語・ブランド名）**: `すぴたろう`/`Supitaro`、`YouTube`、`X`、`Twitch`、`FOLLOW`（見出し。§6 参照）、`おぱぁ。`（T01・口癖。§7 決定要）。
- **C. 今回対象外**: Header/Footer 共通 UI（Sprint 31/32 済）、Profile ページ本文、Gallery カード内テキスト（title/alt/「大きく見る」＝Sprint 35）、News 記事本文、metadata/OG、404 本文。

## 5. Out-of-scope strings（重要）

- **Gallery カード内**（`すぴたろう デザインアート`/画像 alt/`大きく見る`/aria `…を大きく見る`）＝ Gallery 詳細（§20）→ **Sprint 35**。
  本 Sprint はトップの**ギャラリー見出し・説明（T06/T07）のみ**。外国語トップにプレビューを出す場合、カード内テキストは
  当面日本語のまま（§Risk R3・人間決定 D-D）。
- **News 記事**（`公式サイトの土台ができました` 等・カテゴリ `サイト`）＝ News（§19）→ 多言語化しない。
- **Header/Footer 共通 UI**＝ Sprint 31/32 で locale 別化済み。本 Sprint で再変更しない（§24）。

## 6. Proper-noun policy

| 対象 | 方針 |
|------|------|
| すぴたろう | 外国語では **`Supitaro`**（既存ローマ字・YouTube ハンドル `@supitaro_oo` と整合）を推奨。**人間決定 D-A**。 |
| YouTube / X / Twitch | 全 locale で正式表記維持（翻訳しない）。 |
| FOLLOW | 見出しは英字 `FOLLOW` を全 locale 維持（サイトのブランド的定型・短い記号的見出し）。**理由の妥当性を人間確認**。 |
| おぱぁ。(T01) | キャラクターの口癖。表記方法は **人間決定 D-B**（①日本語のまま `おぱぁ。` ②ローマ字 ③日本語＋ローマ字）。AI 推奨=①維持。 |

## 7. English draft

| ID | JA | EN draft |
|----|----|----------|
| T02/T10 | 宇宙から来た、ふしぎないきもの。 | A mysterious creature from outer space. |
| T03 | すぴたろうのこと、すこしだけ、のぞいてみませんか。 | Care to take a little peek at Supitaro? |
| T04 | YouTubeで配信を見る | Watch on YouTube |
| T05 | プロフィールを見る | View profile |
| T06 | デザインギャラリー | Design Gallery |
| T07 | すぴたろうのデザインを、すこしだけ。 | A little look at Supitaro's designs. |
| T08 | ギャラリーを見る | View gallery |
| T09 | すぴたろうって？ | Who is Supitaro? |
| T11 | 丸いものが好き。 | Loves round things. |
| T12 | 家主の留守中に、こっそりゲーム配信をしている。 | Secretly streams games while the homeowner is away. |
| T13 | もっとくわしく | Learn more |
| T14 | チャンネル | Channels |
| T15 | こっそりゲーム配信をしているチャンネル | The channel for secret game streams. |
| T16 | Xで活動を追う | Follow along on X |
| T17 | 公式アカウント | Official account |
| T18 | (外部リンク・新しいタブで開きます) | (external link, opens in a new tab) |
| T19 | （Hero alt） | A full-body illustration of Supitaro — white body, blue eyes, a blue diamond on the forehead, and blue ears and tail. |
| T20 | Twitchで配信を見る | Watch on Twitch |

## 8. Simplified Chinese draft（简体字 / zh-hans）

| ID | JA | ZH-HANS draft |
|----|----|---------------|
| T02/T10 | 宇宙から来た、ふしぎないきもの。 | 来自宇宙的奇妙生物。 |
| T03 | すぴたろうのこと、… | 要不要稍微认识一下 Supitaro 呢？ |
| T04 | YouTubeで配信を見る | 在 YouTube 观看直播 |
| T05 | プロフィールを見る | 查看简介 |
| T06 | デザインギャラリー | 设计图库 |
| T07 | すぴたろうのデザインを、すこしだけ。 | 稍微看看 Supitaro 的设计。 |
| T08 | ギャラリーを見る | 查看图库 |
| T09 | すぴたろうって？ | Supitaro 是谁？ |
| T11 | 丸いものが好き。 | 喜欢圆圆的东西。 |
| T12 | 家主の留守中に、… | 趁房主不在时，偷偷做游戏直播。 |
| T13 | もっとくわしく | 了解更多 |
| T14 | チャンネル | 频道 |
| T15 | こっそりゲーム配信をしているチャンネル | 偷偷做游戏直播的频道 |
| T16 | Xで活動を追う | 在 X 关注动态 |
| T17 | 公式アカウント | 官方账号 |
| T18 | (外部リンク・…) | （外部链接，将在新标签页中打开） |
| T19 | （Hero alt） | Supitaro 的全身插画：白色身体、蓝色眼睛、额头上有蓝色菱形、蓝色耳朵和尾巴。 |
| T20 | Twitchで配信を見る | 在 Twitch 观看直播 |

## 9. Traditional Chinese draft（繁體字 / zh-hant）

| ID | JA | ZH-HANT draft |
|----|----|---------------|
| T02/T10 | 宇宙から来た、ふしぎないきもの。 | 來自宇宙的奇妙生物。 |
| T03 | すぴたろうのこと、… | 要不要稍微認識一下 Supitaro 呢？ |
| T04 | YouTubeで配信を見る | 在 YouTube 觀看直播 |
| T05 | プロフィールを見る | 查看簡介 |
| T06 | デザインギャラリー | 設計圖庫 |
| T07 | すぴたろうのデザインを、すこしだけ。 | 稍微看看 Supitaro 的設計。 |
| T08 | ギャラリーを見る | 查看圖庫 |
| T09 | すぴたろうって？ | Supitaro 是誰？ |
| T11 | 丸いものが好き。 | 喜歡圓圓的東西。 |
| T12 | 家主の留守中に、… | 趁屋主不在時，偷偷做遊戲直播。 |
| T13 | もっとくわしく | 了解更多 |
| T14 | チャンネル | 頻道 |
| T15 | こっそりゲーム配信をしているチャンネル | 偷偷做遊戲直播的頻道 |
| T16 | Xで活動を追う | 在 X 關注動態 |
| T17 | 公式アカウント | 官方帳號 |
| T18 | (外部リンク・…) | （外部連結，將在新分頁中開啟） |
| T19 | （Hero alt） | Supitaro 的全身插畫：白色身體、藍色眼睛、額頭上有藍色菱形、藍色耳朵和尾巴。 |
| T20 | Twitchで配信を見る | 在 Twitch 觀看直播 |

> 簡繁は機械変換ではなく個別に用字（例: 简体「查看简介/频道/账号」↔ 繁体「查看簡介/頻道/帳號」、「视频/影片」語彙差に留意）。
> 地域差が大きく一意に決めにくい語は現時点で無し（あれば §11 に追記して確認）。

## 10. Korean draft（한국어 / ko）

| ID | JA | KO draft |
|----|----|----------|
| T02/T10 | 宇宙から来た、ふしぎないきもの。 | 우주에서 온 신기한 생물. |
| T03 | すぴたろうのこと、… | Supitaro에 대해 조금만 들여다볼래요? |
| T04 | YouTubeで配信を見る | YouTube에서 방송 보기 |
| T05 | プロフィールを見る | 프로필 보기 |
| T06 | デザインギャラリー | 디자인 갤러리 |
| T07 | すぴたろうのデザインを、すこしだけ。 | Supitaro의 디자인을 조금만. |
| T08 | ギャラリーを見る | 갤러리 보기 |
| T09 | すぴたろうって？ | Supitaro는 누구? |
| T11 | 丸いものが好き。 | 동그란 걸 좋아해요. |
| T12 | 家主の留守中に、… | 집주인이 없는 사이, 몰래 게임 방송을 해요. |
| T13 | もっとくわしく | 자세히 보기 |
| T14 | チャンネル | 채널 |
| T15 | こっそりゲーム配信をしているチャンネル | 몰래 게임 방송을 하는 채널 |
| T16 | Xで活動を追う | X에서 소식 보기 |
| T17 | 公式アカウント | 공식 계정 |
| T18 | (外部リンク・…) | (외부 링크, 새 탭에서 열립니다) |
| T19 | （Hero alt） | 흰 몸에 파란 눈, 이마에 파란 마름모, 파란 귀와 꼬리를 가진 Supitaro의 전신 일러스트. |
| T20 | Twitchで配信を見る | Twitch에서 방송 보기 |

> 敬語レベルはページ全体で「해요체」中心に統一（CTA は名詞止め「보기」）。

## 11. Ambiguous source strings（曖昧・翻訳注意の日本語）

- T03 `すこしだけ` / T07 `すこしだけ`: 「ほんの少し・気軽に」の余白感。直訳の "just a little" より "a little peek" で
  柔らかさを出したが、各言語で堅くなりすぎ/幼くなりすぎないか確認したい。
- T12 `家主`: 「（すぴたろうが居候している家の）家主＝人間の飼い主/住人」。英 "homeowner"、中「房主/屋主」、韓「집주인」を
  当てたが、キャラ設定上の含意（飼い主 vs 家の持ち主）が曖昧。原文を変えず、訳語の含意を確認したい。
- T09 `すぴたろうって？`: 口語的な問いかけ。"Who is Supitaro?" は素直だが原文の軽さは一部失われる（許容範囲か確認）。
- 日本語原文の修正提案は**しない**（§5）。曖昧点は訳語選択の確認事項として提示。

## 12. Translation risks（実装上のリスク・境界。Phase B 設計に影響）

- **R1（profile.intro の共有）**: T10-T12 は `content/profile.ts` の `intro` で、**トップページ（CharacterIntroduction）と
  /profile ページの両方**が参照する。/profile は本 Sprint 対象外（scaffold 維持）。→ トップ用の翻訳を /profile に波及させない
  ため、Phase B ではトップページ専用の locale コンテンツ（§15 Option B/C）で intro のトップ用訳を保持する想定。日本語 intro は不変。
- **R2（SocialFollowLinks の共有）**: FOLLOW（T04 系 aria・T20）は `SocialFollowLinks` が担い、**Footer でも同じ部品**を使う。
  Footer 共通 UI は §24 で再変更しない。→ トップの FOLLOW aria を locale 化すると Footer にも影響しうる。
  **人間決定 D-E**: (a) aria を props 化して両呼び出し側が locale 文字列を渡す（Footer も同時 locale 化）/(b) FOLLOW aria の
  locale 化は共通 UI 校正 Sprint へ延期し、本 Sprint は **ChannelLinks（トップ専用）と Hero/紹介/ギャラリー見出しのみ**を対象。
  AI 推奨=(b)（§24 の Footer 非変更方針と最小差分を優先。FOLLOW 見出しは "FOLLOW" 維持で表示変化なし）。
- **R3（Gallery プレビュー内の日本語）**: 外国語トップにギャラリープレビューを出すと、カードの title/alt/「大きく見る」は
  当面日本語（§20・Sprint 35）。→ **人間決定 D-D**: プレビューを出す（カード内は日本語のまま許容）/Sprint 35 まで外国語トップでは
  プレビュー非表示。AI 推奨=出す（§20「表示してよい」に従い、カード内訳は Sprint 35）。
- **R4（News セクション）**: §19。AI 推奨=**Option A（外国語トップで News セクション非表示）**。→ **人間決定 D-C**。
- **R5（コンテンツモデル）**: トップ本文の 5 locale 管理方式は Phase B で §15 に従い選定（Option B/C 想定・日本語回帰厳守）。
  Hero/ChannelLinks/HomeGallerySection/CharacterIntroduction は現在 config/content 直読みの prop-less 構造のため、
  トップ用翻訳 props を Server から渡す最小改修が必要（デザイン・日本語文言・他ページ回帰なし）。

## 13. Human review instructions

各 locale について、以下のいずれかで回答してください（一括可）。

```text
EN:      APPROVE  /  REVISE: <修正文（該当 ID を明記）>  /  HOLD
ZH-HANS: APPROVE  /  REVISE: <…>  /  HOLD
ZH-HANT: APPROVE  /  REVISE: <…>  /  HOLD
KO:      APPROVE  /  REVISE: <…>  /  HOLD
```

- 1 件でも `HOLD`・未回答の locale はコードへ反映しません（§13）。
- 個別 ID の修正は `REVISE: T12 EN = "…"` の形式で指定してください。
- あわせて下記の人間決定 D-A〜D-E をご回答ください（未回答は実装を保留します）。

## 14. Human decisions（要回答・未確定）

| ID | 決定事項 | 選択肢 | AI 推奨 | 人間回答（確定） |
|----|---------|--------|---------|------------------|
| D-A | 外国語での名称表記 | `Supitaro` / `すぴたろう` / 中国語のみ音訳 | Supitaro | **Supitaro（全外国語に統一）** |
| D-B | `おぱぁ。`(T01) の表記 | ①日本語維持 / ②ローマ字 / ③併記 | ①維持 | **① 日本語維持（翻訳・ローマ字化しない）** |
| D-C | 外国語トップの News セクション | A 非表示 / B リンク明示 / C 日本語表示 | A 非表示 | **A 非表示（日本語 News・外国語 News 誘導も行わない）** |
| D-D | 外国語トップの Gallery プレビュー | 表示（カード内 Sprint 35 まで日本語） / Sprint 35 まで非表示 | 表示 | **Sprint 35 まで非表示（日本語トップは現状維持）** |
| D-E | FOLLOW aria の locale 化（Footer 共有） | (a) 今 props 化 / (b) 共通 UI 校正 Sprint へ延期 | (b) 延期 | **(b) 延期（本 Sprint はトップ固有対象のみ反映）** |
| D-F | 翻訳の部分承認時の公開 | 一括 / 順次 | 一括 | **全 4 外国語承認後に一括実装（部分公開なし）** |

翻訳承認: **EN=APPROVE / ZH-HANS=APPROVE / ZH-HANT=APPROVE / KO=APPROVE**（報告した訳文・方針をそのまま承認）。

## 15. Approval status

**APPROVED**。4 外国語すべて APPROVE、D-A〜D-F 確定。Phase B（型付きトップコンテンツ実装・home scaffold 置換・検証）へ進む。
実装は D-C（News 非表示）・D-D（Gallery プレビュー非表示）・D-E（FOLLOW aria 延期・トップ固有のみ）・D-F（一括）に従う。
外国語トップは **noindex を維持**、日本語トップの文言・構成・表示は不変。

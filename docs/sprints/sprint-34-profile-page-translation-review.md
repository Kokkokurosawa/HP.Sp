# Sprint 34 — Profile Page Translation Review (Phase A)

- Sprint: 34
- Phase: A（翻訳案作成・人間確認）
- Verdict: `PROFILE_PAGE_TRANSLATION_DRAFT_READY_FOR_HUMAN_REVIEW`
- Approval status: **APPROVED**（4 外国語すべて APPROVE・D-A〜D-F 決定済み。Phase B 実装へ進行）
- Scope: プロフィールページ本文の 5 locale 化（単一関心事）。トップ/ギャラリー/News/404/metadata/Header/Footer は対象外。

Phase A ではコードを変更しない。本文書のみを新規作成する。

---

## 1. Purpose

Sprint 27 で採用した初回多言語対象範囲のうち、プロフィールページを 5 locale（ja / en / zh-hans / zh-hant / ko）へ移行する。本 Phase A では日本語原文を抽出し、4 外国語の翻訳案を提示して人間確認を得る（実装は Phase B）。

日本語プロフィールは正本として一切変更しない。外国語は AI 初稿 → 人間承認後にのみ Phase B で実装する。日本語への黙示 fallback は禁止。外国語プロフィールは実装後も当面 `noindex` を維持する。

---

## 2. Baseline

作業開始時に確認済み。

```text
branch = main
working tree = clean
local HEAD = origin/main = remote ref = 2931d515a95c68c2bf9b37ec356443ac1d3085b5
latest commit = feat: implement multilingual top page
```

Baseline は期待値と完全一致。

---

## 3. Japanese profile structure

参照ファイル:

```text
app/[locale]/profile/page.tsx     … ページ本体（ja=JapaneseProfile / 外国語=LocaleScaffold）
content/profile.ts                … プロフィールデータ（name / intro[3] / traits[4] / words[6] / upcoming[]）
components/profile/ProfileTraitGrid.tsx   … カードグリッド + シート開閉制御（Client）
components/profile/ProfileTraitCard.tsx   … カード 1 枚（進行的強化: No-JS 静的 / JS button）
components/profile/ProfileDetailSheet.tsx … 詳細ダイアログ / ボトムシート（Client, portal）
config/site.ts                    … profile 画像 src/alt/notice・characterName
components/i18n/SiteShell.tsx      … 共通 chrome（Header/main/Footer/言語切替）
components/i18n/LocaleScaffold.tsx … 外国語プレースホルダー（今回 profile では置換、Gallery では継続利用）
lib/i18n/{locales,routes}.ts      … locale / route の source of truth
content/i18n/**                   … 共通 UI 辞書（Sprint 30-32）
```

ページ構成（縦順）:

1. `h1`「プロフィール」
2. プロフィール画像（`config/site.ts` の profile 画像。src 設定済みのため実画像。alt あり）
3. 基本セクション（見出し = キャラクター名「すぴたろう」＋ intro 3 行）
4. 「すぴたろうのこと」セクション（リード文 + トレイトカード 4 件のグリッド）
   - 各カード: 見出し(label) + 要約(summary)。No-JS では詳細(detail)全文をインライン表示。JS 有効時は button 化し「くわしく見る」→ シートで detail を表示。
5. 「すぴたろうの言葉」セクション（リード文 + words 6 個のチップ）
6. 「くわしい設定」セクション（`upcoming` は空 → 準備中プレースホルダー表示）

ダイアログ / ボトムシート（`ProfileDetailSheet`）:
- タイトル = 対応トレイトの `label`（同一文字列を再利用）
- 本文 = 対応トレイトの `detail`（同一文字列を再利用）
- 閉じるボタン sr-only「閉じる」
- `aria-labelledby` = タイトル要素 / `aria-describedby` = 本文要素（別途の翻訳文字列は無い）

レスポンシブ / インタラクション:
- デスクトップ = 中央ダイアログ、モバイル = ボトムシート（同一コンポーネントを CSS で適応）
- focus trap / Escape で閉じる / focus return / background scroll ロック / reduced-motion 即時表示

---

## 4. Japanese source inventory

翻訳 ID・UI 位置・日本語原文の一覧（詳細な訳文は §9-§14）。

| ID | UI location | Japanese source |
| --- | --- | --- |
| P01 | page h1 | プロフィール |
| P02 | profile 画像 alt | 白い体に青い目、額の青いひし形、青い耳と2本の尻尾を持つ、すぴたろうの全身イラスト |
| P03 | 基本セクション見出し（＝キャラクター名） | すぴたろう |
| P04 | intro 1 行目 | 宇宙から来た、ふしぎないきもの。 |
| P05 | intro 2 行目 | 丸いものが好き。 |
| P06 | intro 3 行目 | 家主の留守中に、こっそりゲーム配信をしている。 |
| P07 | 「すぴたろうのこと」見出し | すぴたろうのこと |
| P08 | 同セクションのリード文 | 気になる項目をえらぶと、すぴたろうのことをすこしずつ知れます。 |
| P09 | trait origin: label | どこから来たの？ |
| P10 | trait origin: summary | 宇宙から来たよ。 |
| P11 | trait origin: detail | 宇宙から来た、ふしぎないきもの。どんな星から来たのかは、まだ分かっていません。 |
| P12 | trait creature: label | どんな生き物？ |
| P13 | trait creature: summary | ふしぎないきもの。 |
| P14 | trait creature: detail | 宇宙から来た、ふしぎないきもの。今わかっているのは、丸いものが好きだということくらい。ほかのことは、これからすこしずつ。 |
| P15 | trait likes: label | 好きなものは？ |
| P16 | trait likes: summary | 丸いものが好き。 |
| P17 | trait likes: detail | 好きなものは、丸いもの。まんまるのかたちが、お気に入りのようです。 |
| P18 | trait streaming: label | なにをしているの？ |
| P19 | trait streaming: summary | こっそりゲーム配信。 |
| P20 | trait streaming: detail | 家主が留守のあいだに、こっそりゲーム配信をしています。だれにもないしょの、ひみつの時間です。 |
| P21 | trait card 操作ヒント（JS 有効時） | くわしく見る |
| P22 | 「すぴたろうの言葉」見出し | すぴたろうの言葉 |
| P23 | 同セクションのリード文 | すぴたろうは、人間が完全には理解できない独自の言葉を話します。 |
| P24 | words チップ（6 個） | おぱぁ / アパ？ / いぱ / まぁっ！ / ハッピー / めーおー |
| P25 | 「くわしい設定」見出し | くわしい設定 |
| P26 | 「くわしい設定」空プレースホルダー | 準備中です。すこしずつ増えていきます。 |
| P27 | シート閉じるボタン sr-only | 閉じる |

**同一性の記録:**
- P04-P06（intro 3 行）は `content/topPage.ts` の `intro.lines` と**バイト一致**。Sprint 33 で人間承認済みの訳を再利用する（同一原文＝同一訳、整合性保証）。
- P16「丸いものが好き。」は P05（intro 2 行目）と同一。同じ訳を再利用する。
- シートのタイトル/本文は各 trait の label/detail を再利用（新規訳なし）。

**抽出文字列数:** 翻訳対象の distinct 文字列 = **24**（P01-P23, P25-P27。ただし P04-P06 は Sprint 33 既承認訳の再利用、P16 は P05 と同一）。日本語維持（翻訳しない）= P24 の 6 チップ。

---

## 5. Translation scope

翻訳対象（本 Sprint）:

```text
- ページ h1（P01）
- profile 画像 alt（P02）
- 基本セクション見出し＝キャラクター名（P03 → 固有名 Supitaro）
- intro 3 行（P04-P06、Sprint 33 既承認訳を再利用）
- 「すぴたろうのこと」見出し・リード（P07-P08）
- トレイトカード 4 件の label / summary / detail（P09-P20）
- トレイトカード操作ヒント「くわしく見る」（P21）
- 「すぴたろうの言葉」見出し・リード（P22-P23）
- 「くわしい設定」見出し・空プレースホルダー（P25-P26）
- シート閉じる sr-only（P27）
```

日本語維持（翻訳しない）:

```text
- words チップ 6 個（P24 = 口癖・鳴き声。§5 分類 B → 原則日本語維持。D-A で人間確認）
```

---

## 6. Out-of-scope strings

本 Sprint では翻訳・変更しない:

```text
- Header / Footer 共通 UI（nav ラベル・skip・メニュー aria 等 = 共通 UI 辞書）
- トップページ本文 / Gallery 本文 / Gallery カード / News 本文 / 404 本文
- metadata（title / description）… foreign profile は現状どおり noindex のみ返す（翻訳しない）
- OG / canonical / hreflang / sitemap / robots
- FOLLOW 共有 UI・外部リンク共通注記
- 画像プレースホルダー分岐の文言（「画像準備中」「すぴたろうのプロフィール画像(画像準備中)」）
  … profile 画像 src は設定済みのため**この分岐は描画されない dead branch**。翻訳対象外（§16 リスク参照）。
```

---

## 7. Proper-noun inventory

`§5 固有名詞・設定用語` 分類:

| 分類 | 該当 | 方針 |
| --- | --- | --- |
| A. 名称 | すぴたろう（P03、及び各所） | **Supitaro**（Sprint 33 D-A 継続） |
| B. 口癖・鳴き声 | おぱぁ / アパ？ / いぱ / まぁっ！ / ハッピー / めーおー（P24） | **日本語維持**（D-A で確認。「ハッピー」も口癖として日本語維持） |
| C. 地名・天体名 | 「宇宙」（一般語） | 各言語の一般語へ翻訳（outer space / 宇宙 / 우주）。固有天体名（海王星 等）は**プロフィールに出現しない** |
| D. キャラクター設定用語 | 「家主」「留守」「ゲーム配信」等 | 通常説明として翻訳（新規の固有設定用語なし） |
| E. 通常説明文 | intro / trait detail 等 | 各言語方針（§7-§10）で翻訳 |
| F. 数値・単位 | **該当なし**（身長・体長・数量の記載なし） | — |

**AI が代理決定した新規固有語: なし。** Supitaro 以外に固有表記の判断を要する新語はプロフィール内に存在しない。

---

## 8. Numeric and unit policy

プロフィールに数値・単位（身長・体長・数量・年齢・体重等）は**一切含まれない**。したがって本 Sprint では数値・単位の翻訳/換算は発生しない。原文にない数値情報（年齢・性別・体重・cm/inch 換算等）を追加しない。

---

## 9. English draft

方針（§7）: 公式キャラクタープロフィールとして自然で簡潔。過度な幼児語・企業的硬さ・"cute" 多用を避け、主語省略の原文に不要な he/she を足さない（Supitaro もしくは主語省略の自然文）。

| ID | Japanese | English draft |
| --- | --- | --- |
| P01 | プロフィール | Profile |
| P02 | （画像 alt） | A full-body illustration of Supitaro — white body, blue eyes, a blue diamond on the forehead, blue ears, and two blue tails. |
| P03 | すぴたろう | Supitaro |
| P04 | 宇宙から来た、ふしぎないきもの。 | A mysterious creature from outer space. |
| P05 | 丸いものが好き。 | Loves round things. |
| P06 | 家主の留守中に、こっそりゲーム配信をしている。 | Secretly streams games while the homeowner is away. |
| P07 | すぴたろうのこと | About Supitaro |
| P08 | 気になる項目をえらぶと、すぴたろうのことをすこしずつ知れます。 | Pick a topic you’re curious about to get to know Supitaro little by little. |
| P09 | どこから来たの？ | Where are you from? |
| P10 | 宇宙から来たよ。 | From outer space. |
| P11 | 宇宙から来た、ふしぎないきもの。どんな星から来たのかは、まだ分かっていません。 | A mysterious creature from outer space. Which planet it came from is still unknown. |
| P12 | どんな生き物？ | What kind of creature? |
| P13 | ふしぎないきもの。 | A mysterious creature. |
| P14 | 宇宙から来た、ふしぎないきもの。今わかっているのは、丸いものが好きだということくらい。ほかのことは、これからすこしずつ。 | A mysterious creature from outer space. About all we know so far is that it loves round things. Everything else, little by little from here. |
| P15 | 好きなものは？ | What do you like? |
| P16 | 丸いものが好き。 | Loves round things. |
| P17 | 好きなものは、丸いもの。まんまるのかたちが、お気に入りのようです。 | What it likes: round things. Perfectly round shapes seem to be its favorite. |
| P18 | なにをしているの？ | What do you do? |
| P19 | こっそりゲーム配信。 | Secret game streams. |
| P20 | 家主が留守のあいだに、こっそりゲーム配信をしています。だれにもないしょの、ひみつの時間です。 | While the homeowner is away, it secretly streams games. A secret little time known to no one. |
| P21 | くわしく見る | See more |
| P22 | すぴたろうの言葉 | Supitaro’s words |
| P23 | すぴたろうは、人間が完全には理解できない独自の言葉を話します。 | Supitaro speaks a language all its own that humans can’t fully understand. |
| P24 | （words 6 個） | （日本語維持: おぱぁ / アパ？ / いぱ / まぁっ！ / ハッピー / めーおー） |
| P25 | くわしい設定 | More details |
| P26 | 準備中です。すこしずつ増えていきます。 | Coming soon. More will be added little by little. |
| P27 | 閉じる | Close |

---

## 10. Simplified Chinese draft

方針（§8）: 簡体字のみ。中国本土で自然な一般語彙。繁体字/台湾語彙を混在させない。日本語漢字の直接流用を避ける。固有名 Supitaro 維持。過剰な擬人化を加えない。非人称の生物代名詞は「它」。

| ID | Japanese | 简体中文 draft |
| --- | --- | --- |
| P01 | プロフィール | 简介 |
| P02 | （画像 alt） | Supitaro 的全身插画：白色身体、蓝色眼睛、额头上有蓝色菱形、蓝色耳朵和两条蓝色尾巴。 |
| P03 | すぴたろう | Supitaro |
| P04 | 宇宙から来た、ふしぎないきもの。 | 来自宇宙的奇妙生物。 |
| P05 | 丸いものが好き。 | 喜欢圆圆的东西。 |
| P06 | 家主の留守中に、こっそりゲーム配信をしている。 | 趁房主不在时，偷偷做游戏直播。 |
| P07 | すぴたろうのこと | 关于 Supitaro |
| P08 | 気になる項目をえらぶと、すぴたろうのことをすこしずつ知れます。 | 选择你感兴趣的项目，一点一点认识 Supitaro。 |
| P09 | どこから来たの？ | 你从哪里来？ |
| P10 | 宇宙から来たよ。 | 来自宇宙。 |
| P11 | 宇宙から来た、ふしぎないきもの。どんな星から来たのかは、まだ分かっていません。 | 来自宇宙的奇妙生物。究竟来自哪颗星球，目前还不清楚。 |
| P12 | どんな生き物？ | 是什么样的生物？ |
| P13 | ふしぎないきもの。 | 奇妙的生物。 |
| P14 | 宇宙から来た、ふしぎないきもの。今わかっているのは、丸いものが好きだということくらい。ほかのことは、これからすこしずつ。 | 来自宇宙的奇妙生物。目前知道的，只有它喜欢圆圆的东西。其他的，往后再一点一点了解。 |
| P15 | 好きなものは？ | 喜欢什么？ |
| P16 | 丸いものが好き。 | 喜欢圆圆的东西。 |
| P17 | 好きなものは、丸いもの。まんまるのかたちが、お気に入りのようです。 | 喜欢的东西，是圆圆的东西。圆滚滚的形状，似乎是它的最爱。 |
| P18 | なにをしているの？ | 在做什么？ |
| P19 | こっそりゲーム配信。 | 偷偷做游戏直播。 |
| P20 | 家主が留守のあいだに、こっそりゲーム配信をしています。だれにもないしょの、ひみつの時間です。 | 趁房主不在的时候，偷偷做游戏直播。这是不告诉任何人的、秘密的时间。 |
| P21 | くわしく見る | 查看详情 |
| P22 | すぴたろうの言葉 | Supitaro 的话语 |
| P23 | すぴたろうは、人間が完全には理解できない独自の言葉を話します。 | Supitaro 说着人类无法完全理解的、独有的语言。 |
| P24 | （words 6 個） | （日本語維持: おぱぁ / アパ？ / いぱ / まぁっ！ / ハッピー / めーおー） |
| P25 | くわしい設定 | 详细设定 |
| P26 | 準備中です。すこしずつ増えていきます。 | 正在准备中。会一点一点增加。 |
| P27 | 閉じる | 关闭 |

---

## 11. Traditional Chinese draft

方針（§9）: 繁体字のみ。簡体字の機械変換で済ませない。台湾・香港いずれでも違和感の少ない中立表現。固有名 Supitaro 維持。非人称の生物代名詞は「牠」。「房主/屋主」等の語彙は Sprint 33 既承認訳（屋主）と整合。

| ID | Japanese | 繁體中文 draft |
| --- | --- | --- |
| P01 | プロフィール | 簡介 |
| P02 | （画像 alt） | Supitaro 的全身插畫：白色身體、藍色眼睛、額頭上有藍色菱形、藍色耳朵和兩條藍色尾巴。 |
| P03 | すぴたろう | Supitaro |
| P04 | 宇宙から来た、ふしぎないきもの。 | 來自宇宙的奇妙生物。 |
| P05 | 丸いものが好き。 | 喜歡圓圓的東西。 |
| P06 | 家主の留守中に、こっそりゲーム配信をしている。 | 趁屋主不在時，偷偷做遊戲直播。 |
| P07 | すぴたろうのこと | 關於 Supitaro |
| P08 | 気になる項目をえらぶと、すぴたろうのことをすこしずつ知れます。 | 選擇你感興趣的項目，一點一點認識 Supitaro。 |
| P09 | どこから来たの？ | 你從哪裡來？ |
| P10 | 宇宙から来たよ。 | 來自宇宙。 |
| P11 | 宇宙から来た、ふしぎないきもの。どんな星から来たのかは、まだ分かっていません。 | 來自宇宙的奇妙生物。究竟來自哪顆星球，目前還不清楚。 |
| P12 | どんな生き物？ | 是什麼樣的生物？ |
| P13 | ふしぎないきもの。 | 奇妙的生物。 |
| P14 | 宇宙から来た、ふしぎないきもの。今わかっているのは、丸いものが好きだということくらい。ほかのことは、これからすこしずつ。 | 來自宇宙的奇妙生物。目前知道的，只有牠喜歡圓圓的東西。其他的，往後再一點一點了解。 |
| P15 | 好きなものは？ | 喜歡什麼？ |
| P16 | 丸いものが好き。 | 喜歡圓圓的東西。 |
| P17 | 好きなものは、丸いもの。まんまるのかたちが、お気に入りのようです。 | 喜歡的東西，是圓圓的東西。圓滾滾的形狀，似乎是牠的最愛。 |
| P18 | なにをしているの？ | 在做什麼？ |
| P19 | こっそりゲーム配信。 | 偷偷做遊戲直播。 |
| P20 | 家主が留守のあいだに、こっそりゲーム配信をしています。だれにもないしょの、ひみつの時間です。 | 趁屋主不在的時候，偷偷做遊戲直播。這是不告訴任何人的、祕密的時間。 |
| P21 | くわしく見る | 查看詳情 |
| P22 | すぴたろうの言葉 | Supitaro 的話語 |
| P23 | すぴたろうは、人間が完全には理解できない独自の言葉を話します。 | Supitaro 說著人類無法完全理解的、獨有的語言。 |
| P24 | （words 6 個） | （日本語維持: おぱぁ / アパ？ / いぱ / まぁっ！ / ハッピー / めーおー） |
| P25 | くわしい設定 | 詳細設定 |
| P26 | 準備中です。すこしずつ増えていきます。 | 正在準備中。會一點一點增加。 |
| P27 | 閉じる | 關閉 |

---

## 12. Korean draft

方針（§10）: 語尾は해요体で統一（Sprint 33 との整合）。逐語訳を避ける。固有名 Supitaro 維持。原文にない呼びかけを足さない。カードタイトルは短く。

| ID | Japanese | 한국어 draft |
| --- | --- | --- |
| P01 | プロフィール | 프로필 |
| P02 | （画像 alt） | 흰 몸에 파란 눈, 이마에 파란 마름모, 파란 귀와 두 개의 파란 꼬리를 가진 Supitaro의 전신 일러스트. |
| P03 | すぴたろう | Supitaro |
| P04 | 宇宙から来た、ふしぎないきもの。 | 우주에서 온 신기한 생물. |
| P05 | 丸いものが好き。 | 동그란 걸 좋아해요. |
| P06 | 家主の留守中に、こっそりゲーム配信をしている。 | 집주인이 없는 사이, 몰래 게임 방송을 해요. |
| P07 | すぴたろうのこと | Supitaro에 대해 |
| P08 | 気になる項目をえらぶと、すぴたろうのことをすこしずつ知れます。 | 궁금한 항목을 골라 Supitaro를 조금씩 알아가 보세요. |
| P09 | どこから来たの？ | 어디에서 왔어요? |
| P10 | 宇宙から来たよ。 | 우주에서 왔어요. |
| P11 | 宇宙から来た、ふしぎないきもの。どんな星から来たのかは、まだ分かっていません。 | 우주에서 온 신기한 생물. 어느 별에서 왔는지는 아직 밝혀지지 않았어요. |
| P12 | どんな生き物？ | 어떤 생물이에요? |
| P13 | ふしぎないきもの。 | 신기한 생물. |
| P14 | 宇宙から来た、ふしぎないきもの。今わかっているのは、丸いものが好きだということくらい。ほかのことは、これからすこしずつ。 | 우주에서 온 신기한 생물. 지금 알 수 있는 건 동그란 걸 좋아한다는 것 정도. 나머지는 앞으로 조금씩. |
| P15 | 好きなものは？ | 좋아하는 건 뭐예요? |
| P16 | 丸いものが好き。 | 동그란 걸 좋아해요. |
| P17 | 好きなものは、丸いもの。まんまるのかたちが、お気に入りのようです。 | 좋아하는 건 동그란 것. 동글동글한 모양을 특히 좋아하는 것 같아요. |
| P18 | なにをしているの？ | 뭘 하고 있어요? |
| P19 | こっそりゲーム配信。 | 몰래 게임 방송. |
| P20 | 家主が留守のあいだに、こっそりゲーム配信をしています。だれにもないしょの、ひみつの時間です。 | 집주인이 없는 사이, 몰래 게임 방송을 하고 있어요. 아무에게도 말하지 않은, 비밀의 시간이에요. |
| P21 | くわしく見る | 자세히 보기 |
| P22 | すぴたろうの言葉 | Supitaro의 말 |
| P23 | すぴたろうは、人間が完全には理解できない独自の言葉を話します。 | Supitaro는 사람이 완전히 이해할 수 없는 자신만의 말을 해요. |
| P24 | （words 6 個） | （日本語維持: おぱぁ / アパ？ / いぱ / まぁっ！ / ハッピー / めーおー） |
| P25 | くわしい設定 | 자세한 설정 |
| P26 | 準備中です。すこしずつ増えていきます。 | 준비 중이에요. 조금씩 늘어날 거예요. |
| P27 | 閉じる | 닫기 |

---

## 13. Trait-card translation matrix

4 カード。数・順序・id は不変（`origin → creature → likes → streaming`）。label = カード見出し／シートタイトル、summary = カード要約、detail = No-JS インライン全文／シート本文。

### origin（id: origin）

| field | ja | en | zh-hans | zh-hant | ko |
| --- | --- | --- | --- | --- | --- |
| label | どこから来たの？ | Where are you from? | 你从哪里来？ | 你從哪裡來？ | 어디에서 왔어요? |
| summary | 宇宙から来たよ。 | From outer space. | 来自宇宙。 | 來自宇宙。 | 우주에서 왔어요. |
| detail | 宇宙から来た、ふしぎないきもの。どんな星から来たのかは、まだ分かっていません。 | A mysterious creature from outer space. Which planet it came from is still unknown. | 来自宇宙的奇妙生物。究竟来自哪颗星球，目前还不清楚。 | 來自宇宙的奇妙生物。究竟來自哪顆星球，目前還不清楚。 | 우주에서 온 신기한 생물. 어느 별에서 왔는지는 아직 밝혀지지 않았어요. |

### creature（id: creature）

| field | ja | en | zh-hans | zh-hant | ko |
| --- | --- | --- | --- | --- | --- |
| label | どんな生き物？ | What kind of creature? | 是什么样的生物？ | 是什麼樣的生物？ | 어떤 생물이에요? |
| summary | ふしぎないきもの。 | A mysterious creature. | 奇妙的生物。 | 奇妙的生物。 | 신기한 생물. |
| detail | 宇宙から来た、ふしぎないきもの。今わかっているのは、丸いものが好きだということくらい。ほかのことは、これからすこしずつ。 | A mysterious creature from outer space. About all we know so far is that it loves round things. Everything else, little by little from here. | 来自宇宙的奇妙生物。目前知道的，只有它喜欢圆圆的东西。其他的，往后再一点一点了解。 | 來自宇宙的奇妙生物。目前知道的，只有牠喜歡圓圓的東西。其他的，往後再一點一點了解。 | 우주에서 온 신기한 생물. 지금 알 수 있는 건 동그란 걸 좋아한다는 것 정도. 나머지는 앞으로 조금씩. |

### likes（id: likes）

| field | ja | en | zh-hans | zh-hant | ko |
| --- | --- | --- | --- | --- | --- |
| label | 好きなものは？ | What do you like? | 喜欢什么？ | 喜歡什麼？ | 좋아하는 건 뭐예요? |
| summary | 丸いものが好き。 | Loves round things. | 喜欢圆圆的东西。 | 喜歡圓圓的東西。 | 동그란 걸 좋아해요. |
| detail | 好きなものは、丸いもの。まんまるのかたちが、お気に入りのようです。 | What it likes: round things. Perfectly round shapes seem to be its favorite. | 喜欢的东西，是圆圆的东西。圆滚滚的形状，似乎是它的最爱。 | 喜歡的東西，是圓圓的東西。圓滾滾的形狀，似乎是牠的最愛。 | 좋아하는 건 동그란 것. 동글동글한 모양을 특히 좋아하는 것 같아요. |

### streaming（id: streaming）

| field | ja | en | zh-hans | zh-hant | ko |
| --- | --- | --- | --- | --- | --- |
| label | なにをしているの？ | What do you do? | 在做什么？ | 在做什麼？ | 뭘 하고 있어요? |
| summary | こっそりゲーム配信。 | Secret game streams. | 偷偷做游戏直播。 | 偷偷做遊戲直播。 | 몰래 게임 방송. |
| detail | 家主が留守のあいだに、こっそりゲーム配信をしています。だれにもないしょの、ひみつの時間です。 | While the homeowner is away, it secretly streams games. A secret little time known to no one. | 趁房主不在的时候，偷偷做游戏直播。这是不告诉任何人的、秘密的时间。 | 趁屋主不在的時候，偷偷做遊戲直播。這是不告訴任何人的、祕密的時間。 | 집주인이 없는 사이, 몰래 게임 방송을 하고 있어요. 아무에게도 말하지 않은, 비밀의 시간이에요. |

カード操作ヒント「くわしく見る」（JS 有効時のみ表示、No-JS では非表示）: EN `See more` / zh-hans `查看详情` / zh-hant `查看詳情` / ko `자세히 보기`。

---

## 14. Dialog/bottom-sheet translation matrix

シート固有の翻訳文字列は「閉じる」のみ。タイトル/本文は各 trait の label/detail を再利用（§13）。

| 要素 | ja | en | zh-hans | zh-hant | ko | 備考 |
| --- | --- | --- | --- | --- | --- | --- |
| タイトル（`aria-labelledby`） | trait.label | trait.label | trait.label | trait.label | trait.label | §13 の label を再利用 |
| 本文（`aria-describedby`） | trait.detail | trait.detail | trait.detail | trait.detail | trait.detail | §13 の detail を再利用 |
| 閉じるボタン sr-only（P27） | 閉じる | Close | 关闭 | 關閉 | 닫기 | 共通 UI 辞書に汎用「閉じる」は**未存在**（`closeMenu` のみ）。配置は D-C |

維持するインタラクション（翻訳で変えない）: focus trap / Escape / focus return / background scroll ロック / キーボード操作 / reduced-motion / No-JS 時の詳細全文表示。

---

## 15. Ambiguous source strings

| 原文 | 曖昧点 | 本案の解釈 |
| --- | --- | --- |
| くわしい設定（P25） | 「設定」= キャラクター設定（lore/背景）か UI 設定か。当セクションは `upcoming` 空で準備中表示のみ。 | キャラクター設定（今後の詳細設定）と解釈。EN=More details / zh=详细设定・詳細設定 / ko=자세한 설정。UI 設定の意ではない。 |
| すぴたろうの言葉 + words 6 個（P22-P24） | 外国語ページに日本語 words（おぱぁ 等）がそのまま並ぶ。 | 意図的（口癖＝日本語維持。§5 分類 B）。リード文（P23）で「独自の言葉」と説明されるため文脈上成立。 |
| ハッピー（P24） | 借用語（happy）に見えるため翻訳したくなる。 | 口癖の一部として日本語維持（他 5 語と統一）。D-A で確認。 |
| P14/P17 の生物代名詞 | 日本語は主語省略。中国語で「它/牠」を補うか。 | zh-hans=它、zh-hant=牠（各言語で自然な非人称生物代名詞）。EN は "it"、ko は主語省略。 |

**日本語原文の誤字・不自然表現: 発見なし**（かな多用「いきもの」「ないしょ」等は意図的な柔らかい表記であり誤字ではない）。§2 に従い、仮に発見しても Phase A では報告のみで修正しない。

---

## 16. Translation risks

| リスク | 内容 | 対応 |
| --- | --- | --- |
| カード face overflow | grid-cols-2 の 2 列カード。カード表面は label + summary + 「くわしく見る」のみ（detail はシート/No-JS インライン）。EN の label/summary は短く overflow 低リスク。 | Phase B の 320px ブラウザ監査で確認。重大 overflow は修正せず報告（§11）。 |
| No-JS 詳細長文 | detail は No-JS 時カード内インライン全文。EN detail が長め。 | インラインは折返し表示（既存挙動）。320px で横スクロール 0 を確認。 |
| 簡繁混在 | zh-hans/zh-hant の用字クロスコンタミ。 | Phase B テスト＋監査で用字ガード（认识/認識・频道/頻道・简介/簡介・详情/詳情・关闭/關閉 等）。 |
| 日本語 words の外国語ページ露出 | 意図的だが未説明だと違和感。 | リード文（P23 訳）で「独自の言葉」と明示。仕様どおり。 |
| 画像 alt の出所 | ja alt は `config/site.ts`。翻訳版をどこに置くか。 | Phase B: profile コンテンツモデルに imageAlt を locale 別で保持。ja は config を参照（config 不変・重複なし）。§17 D-D 参照。 |

---

## 17. Human decisions required

| ID | 決定事項 | 選択肢 | AI 推奨 |
| --- | --- | --- | --- |
| D-A | words チップ 6 個（おぱぁ/アパ？/いぱ/まぁっ！/ハッピー/めーおー）の扱い | (a) 全て日本語維持 / (b) 一部翻訳 | **(a) 日本語維持**（§5 分類 B・口癖）。ハッピー含め統一。 |
| D-B | 「くわしい設定」セクション（`upcoming` 空）を外国語でも維持し、見出し＋準備中プレースホルダーを翻訳表示するか | (a) 見出し＋準備中を翻訳して維持 / (b) 外国語では当セクション非表示 | **(a) 翻訳して維持**（ja と同一構成・No-JS 情報量を揃える）。 |
| D-C | シート閉じる「閉じる」の配置 | (a) 共通 UI 辞書へ汎用 `accessibility.close` を新設し再利用 / (b) profile コンテンツモデル内に closeLabel として保持 | **(b) profile モデル内**（本 Sprint 単一関心事＝profile。共通 UI へ手を入れず scope を絞る。汎用 close は現状不在のため §12 の「既存再利用」は非該当）。 |
| D-D | プロフィールコンテンツモデルの方式（§17 Option A/B/C） | A: `content/profile.ts` を locale 拡張 / B: 新規 `content/profileContent.ts` の多言語モデル（ja は profile.ts を正本参照）/ C: 別マップを Server で統合 | **B**（`content/profile.ts` を ja 正本のまま維持し新規 `content/profileContent.ts` を追加。ja エントリは profile.ts / siteConfig を参照して**二重定義を作らない**。foreign は `satisfies` で型検査。欠落キーを build 時検出・日本語 fallback なし・Client へは必要文字列のみ）。 |
| D-E | page h1「プロフィール」の中国語訳 | 简介/簡介 か 个人资料/個人資料 か | **简介 / 簡介**（Sprint 33 トップ CTA「查看简介/查看簡介」と整合）。 |
| D-F | 部分承認時の扱い | 全 4 外国語 APPROVE 後に一括実装 / locale 単位で順次 | **全 4 外国語 APPROVE 後に一括実装**（Sprint 33 D-F と同じ）。 |

### Human decision（確定）

| ID | 決定 | 補足 |
| --- | --- | --- |
| D-A | **全 6 語を日本語維持** | 「ハッピー」含む 6 語をキャラクター固有の発話として全 locale で日本語表記維持。 |
| D-B | **翻訳して維持** | 「くわしい設定」セクションを外国語プロフィールでも残し、見出しと準備中文を各言語へ翻訳。 |
| D-C | **profile モデル内に保持** | シート固有の「閉じる」を profile コンテンツモデルで管理。共通 UI 辞書は拡張しない。 |
| D-D | **Option B** | `content/profileContent.ts` を新設。ja は既存 `content/profile.ts` と `siteConfig` を参照し重複定義を避ける。 |
| D-E | **简介 / 簡介** | 簡体字＝「简介」、繁体字＝「簡介」。 |
| D-F | **全 4 外国語承認後に一括実装** | 4 外国語を同時実装。部分実装・部分公開は行わない。 |

---

## 18. Human approvals

人間確認の結果、以下を受領した（翻訳案は報告どおり承認）。

locale 単位:

```text
EN: APPROVE
ZH-HANS: APPROVE
ZH-HANT: APPROVE
KO: APPROVE
```

判断事項:

```text
D-A: 全 6 語を日本語維持
D-B: 翻訳して維持
D-C: profile モデル内に保持
D-D: Option B
D-E: 简介 / 簡介
D-F: 全 4 外国語承認後に一括実装
```

文字列単位の REVISE / HOLD はなし（全 ID を報告どおり承認）。外国語プロフィールは実装後も `noindex` を維持。日本語プロフィールの文言・順序・表示・カード操作・dialog／bottom sheet・No-JS 契約は変更しない。

---

## 19. Approval status

**APPROVED** — 4 外国語すべて APPROVE、D-A〜D-F 決定済み。Phase B（型付きプロフィールコンテンツ実装・scaffold 置換・トレイトカード/シート多言語化・検証）へ進行する。外国語プロフィールは `noindex` を維持し、日本語プロフィールの表示・順序・操作・No-JS 契約は不変とする。実装結果は `docs/sprints/sprint-34-implement-multilingual-profile-page.md` に記録する。

import type { Metadata } from "next";
import Button from "@/components/Button";

/**
 * カスタム 404 ページ。存在しない URL で表示される(HTTP ステータスは 404 のまま)。
 * Header / Footer は root layout が付与するため、ここは main の主要領域だけを描く。
 * 画像・必須アニメーションは足さず、サイトの余白・角丸・文字色に合わせる。
 */
export const metadata: Metadata = {
  title: "ページが見つかりません",
};

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-20 text-center sm:px-6 sm:py-24">
      <p className="text-sm font-bold tracking-[0.3em] text-deepblue-600">404</p>
      <h1 className="mt-4 text-2xl font-bold text-night-900 sm:text-3xl">
        ページが見つかりません
      </h1>
      <p className="mt-4 leading-relaxed text-night-800/80">
        お探しのページは、移動したか、まだ存在しないようです。
      </p>
      <div className="mt-8">
        <Button href="/">トップへ戻る</Button>
      </div>
    </div>
  );
}

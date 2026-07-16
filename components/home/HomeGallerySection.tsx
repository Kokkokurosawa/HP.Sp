"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/components/Button";
import SectionHeading from "@/components/SectionHeading";
import GalleryCard from "@/components/gallery/GalleryCard";
import GalleryLightbox from "@/components/gallery/GalleryLightbox";
import type { GalleryItem } from "@/content/gallery";

/**
 * トップページのデザインギャラリー(プレビュー)。
 * - 専用 /gallery とは別に、ホームでは小さめのカードでさっと見せる(全面表示はしない)。
 * - カード(GalleryCard)とライトボックス(GalleryLightbox)は /gallery と共通のものを再利用する
 *   (別ライトボックスは作らない。No-JS では figure、JS 有効時にカード全面が button 化する挙動も共通)。
 * - 配列を前提に描画し、単一項目を直書きしない。カードは独立し、選択中の項目を state で管理する。
 *   将来公開作品が増えたら、この <ul> を横並びトラック(overflow-x-auto)へ替えるだけでカルーセルへ移行できる。
 * - 空判定はページ側で行う前提(ここは 1 件以上を受け取る。念のため空なら何も描画しない)。
 */
export default function HomeGallerySection({ items }: { items: GalleryItem[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const active = activeId
    ? (items.find((item) => item.id === activeId) ?? null)
    : null;

  // 閉じたら、開いた起点のカードへフォーカスを返す(/gallery と同じ挙動)。
  useEffect(() => {
    if (activeId !== null) return;
    const trigger = triggerRef.current;
    if (trigger) {
      trigger.focus();
      triggerRef.current = null;
    }
  }, [activeId]);

  if (items.length === 0) return null;

  return (
    <section
      aria-labelledby="home-gallery-heading"
      className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16"
    >
      <SectionHeading id="home-gallery-heading">デザインギャラリー</SectionHeading>
      <p className="mt-4 leading-relaxed text-night-800/80">
        すぴたろうのデザインを、すこしだけ。
      </p>

      {/* プレビュー用トラック: 現在は中央寄せ。将来は横並び(overflow-x-auto)へ拡張できる。
          li の幅でカードを小さく保つ(モバイルは画面幅の約 68%・最大 260px、sm 以上は 200px)。 */}
      <ul className="mt-8 flex flex-wrap justify-center gap-4">
        {items.map((item) => (
          <li key={item.id} className="w-[min(68vw,260px)] sm:w-[200px]">
            <GalleryCard
              item={item}
              variant="compact"
              onOpen={(selected, trigger) => {
                triggerRef.current = trigger;
                setActiveId(selected.id);
              }}
            />
          </li>
        ))}
      </ul>

      {/* 専用ページへの導線。ライトボックスを開く操作(カードの button)とは別要素の純粋なリンク。 */}
      <div className="mt-8 text-center">
        <Button href="/gallery" variant="secondary">
          ギャラリーを見る
        </Button>
      </div>

      <GalleryLightbox item={active} onClose={() => setActiveId(null)} />
    </section>
  );
}

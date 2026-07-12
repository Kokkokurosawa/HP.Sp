"use client";

import { useEffect, useRef, useState } from "react";
import type { GalleryItem } from "@/content/gallery";
import GalleryCard from "./GalleryCard";
import GalleryLightbox from "./GalleryLightbox";

/**
 * ギャラリーのグリッド + ライトボックスの開閉制御。
 * - 360/390px は 1 列、sm 以上で 2 列、lg 以上で 3 列。
 * - カードを押すと画像を大きく表示するライトボックス(GalleryLightbox)を開く。
 * - インタラクションに必要な最小範囲だけを Client Component にする(ページは Server Component のまま)。
 * - 画像・タイトルはカードに常時表示され、No-JS でも通常の静的ギャラリーとして読める。
 * 空判定はページ側で行い、ここは 1 件以上の配列を受け取る前提。
 */
export default function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const active = activeId
    ? (items.find((item) => item.id === activeId) ?? null)
    : null;

  // 閉じたら、開いた起点のカードへフォーカスを返す(初回マウント時は何もしない)。
  useEffect(() => {
    if (activeId !== null) return;
    const trigger = triggerRef.current;
    if (trigger) {
      trigger.focus();
      triggerRef.current = null;
    }
  }, [activeId]);

  return (
    <>
      <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <li key={item.id}>
            <GalleryCard
              item={item}
              onOpen={(selected, trigger) => {
                triggerRef.current = trigger;
                setActiveId(selected.id);
              }}
            />
          </li>
        ))}
      </ul>
      <GalleryLightbox item={active} onClose={() => setActiveId(null)} />
    </>
  );
}

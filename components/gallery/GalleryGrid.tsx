import Image from "next/image";
import type { GalleryItem } from "@/content/gallery";

/**
 * ギャラリーのグリッド表示。
 * - 360/390px は 1 列、十分な幅(sm 以上)で 2 列、lg 以上で 3 列。
 * - アスペクト比が混在しても切らない(object-contain + 白背景の枠)。
 * - 画像は遅延読み込み(priority なし)。alt は必須。
 * - 現時点ではカードはクリック不可。ボタン風の見た目にはしない。
 * 空判定はページ側で行い、ここは 1 件以上の配列を受け取る前提。
 */
export default function GalleryGrid({ items }: { items: GalleryItem[] }) {
  return (
    <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <li
          key={item.id}
          className="overflow-hidden rounded-2xl border border-babyblue-200 bg-white"
        >
          <div className="flex aspect-square items-center justify-center bg-white p-3">
            <Image
              src={item.image.src}
              alt={item.image.alt}
              width={800}
              height={800}
              loading="lazy"
              sizes="(min-width: 1024px) 300px, (min-width: 640px) 45vw, 90vw"
              className="max-h-full w-auto object-contain"
            />
          </div>
          {(item.title || item.description) && (
            <div className="border-t border-babyblue-100 px-4 py-3">
              {item.title && (
                <p className="font-bold text-night-900">{item.title.ja}</p>
              )}
              {item.description && (
                <p className="mt-1 text-sm text-night-800/70">
                  {item.description.ja}
                </p>
              )}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

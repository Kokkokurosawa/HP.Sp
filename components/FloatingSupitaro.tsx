"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { siteConfig } from "@/config/site";

/**
 * すぴたろうのメインビジュアル。ゆっくり上下に浮遊する。
 * prefers-reduced-motion 時は浮遊を停止する。
 * 画像パスが未設定の間は、明確なプレースホルダーを表示する。
 */
export default function FloatingSupitaro() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      animate={shouldReduceMotion ? undefined : { y: [0, -14, 0] }}
      transition={
        shouldReduceMotion
          ? undefined
          : { duration: 5, repeat: Infinity, ease: "easeInOut" }
      }
      className="shrink-0"
    >
      {siteConfig.images.characterMain ? (
        <Image
          src={siteConfig.images.characterMain}
          alt={siteConfig.characterName}
          width={280}
          height={280}
          priority
          className="size-56 object-contain sm:size-70"
        />
      ) : (
        <div
          role="img"
          aria-label="すぴたろうのメインビジュアル(画像準備中)"
          className="flex size-56 flex-col items-center justify-center gap-2 rounded-full border-2 border-dashed border-babyblue-400 bg-white/70 text-center sm:size-70"
        >
          <span
            aria-hidden="true"
            className="inline-block size-8 rounded-full bg-babyblue-200"
          />
          <span aria-hidden="true" className="text-sm font-bold text-deepblue-600">
            {siteConfig.characterName}
          </span>
          <span aria-hidden="true" className="text-xs text-deepblue-600">
            画像準備中
          </span>
        </div>
      )}
    </motion.div>
  );
}

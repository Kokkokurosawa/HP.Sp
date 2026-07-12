"use client";

import { useEffect, useRef, useState } from "react";
import type { ProfileTrait } from "@/content/profile";
import ProfileTraitCard from "./ProfileTraitCard";
import ProfileDetailSheet from "./ProfileDetailSheet";

/**
 * タップできるプロフィール項目のグリッド + 詳細シートの開閉制御。
 * インタラクションに必要な最小範囲だけを Client Component にする。
 * 詳細本文は各カードに No-JS 用として SSR 済みで、JS 有効時はシートで表示する。
 */
export default function ProfileTraitGrid({
  traits,
}: {
  traits: ProfileTrait[];
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const active = activeId
    ? (traits.find((trait) => trait.id === activeId) ?? null)
    : null;

  // シートを閉じたら、開いた起点のカードへフォーカスを返す(初回マウント時は何もしない)。
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
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:gap-4">
        {traits.map((trait) => (
          <li key={trait.id} className="h-full">
            <ProfileTraitCard
              trait={trait}
              onOpen={(selected, trigger) => {
                triggerRef.current = trigger;
                setActiveId(selected.id);
              }}
            />
          </li>
        ))}
      </ul>
      <ProfileDetailSheet trait={active} onClose={() => setActiveId(null)} />
    </>
  );
}

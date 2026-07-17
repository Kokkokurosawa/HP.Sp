import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import SectionHeading from "@/components/SectionHeading";
import ProfileTraitGrid from "@/components/profile/ProfileTraitGrid";
import LocaleScaffold from "@/components/i18n/LocaleScaffold";
import { profile } from "@/content/profile";
import { siteConfig } from "@/config/site";
import { isLocale, locales } from "@/lib/i18n/locales";

export const dynamicParams = false;
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (locale === "ja") {
    return {
      title: "プロフィール",
      description: `${siteConfig.characterName}のプロフィール。${profile.intro.join("")}`,
    };
  }
  return { robots: { index: false, follow: false } };
}

// 日本語プロフィール（既存 app/profile/page.tsx の内容をそのまま）。
function JapaneseProfile() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-2xl font-bold text-night-900 sm:text-3xl">
        プロフィール
      </h1>

      <div className="mt-10 flex flex-col gap-10 md:flex-row md:items-start">
        {/* キャラクター画像(未確定の間はプレースホルダー)。差し替え手順は docs/character-image-guidelines.md */}
        {siteConfig.images.profile.src ? (
          <div className="mx-auto shrink-0 text-center md:mx-0">
            <Image
              src={siteConfig.images.profile.src}
              alt={siteConfig.images.profile.alt || siteConfig.characterName}
              width={560}
              height={560}
              sizes="224px"
              className="size-56 object-contain"
            />
            {siteConfig.images.profile.notice && (
              <p className="mt-2 text-xs text-night-800/70">
                {siteConfig.images.profile.notice}
              </p>
            )}
          </div>
        ) : (
          <div
            role="img"
            aria-label="すぴたろうのプロフィール画像(画像準備中)"
            className="mx-auto flex size-56 shrink-0 flex-col items-center justify-center gap-2 rounded-full border-2 border-dashed border-babyblue-400 bg-babyblue-50 text-center md:mx-0"
          >
            <span
              aria-hidden="true"
              className="inline-block size-8 rounded-full bg-babyblue-200"
            />
            <span aria-hidden="true" className="text-xs text-deepblue-600">
              画像準備中
            </span>
          </div>
        )}

        <div className="min-w-0 flex-1 space-y-12">
          <section aria-labelledby="profile-basic-heading">
            <SectionHeading id="profile-basic-heading">
              {profile.name}
            </SectionHeading>
            <div className="mt-4 space-y-1 leading-loose text-night-800/90">
              {profile.intro.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </section>

          <section aria-labelledby="profile-traits-heading">
            <SectionHeading id="profile-traits-heading">
              すぴたろうのこと
            </SectionHeading>
            <p className="mt-4 text-sm leading-relaxed text-night-800/70">
              気になる項目をえらぶと、すぴたろうのことをすこしずつ知れます。
            </p>
            {/* 各カードは進行的強化(ProfileTraitCard): No-JS では詳細全文を含む静的カード、
                JS 有効時に button 化してシートで詳細を開く。noscript 用の CSS 切替は不要。 */}
            <ProfileTraitGrid traits={profile.traits} />
          </section>

          <section aria-labelledby="profile-words-heading">
            <SectionHeading id="profile-words-heading">
              すぴたろうの言葉
            </SectionHeading>
            <p className="mt-4 text-sm leading-relaxed text-night-800/70">
              すぴたろうは、人間が完全には理解できない独自の言葉を話します。
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {profile.words.map((word) => (
                <li
                  key={word}
                  className="rounded-full bg-babyblue-100 px-4 py-2 font-bold text-deepblue-700"
                >
                  {word}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="profile-upcoming-heading">
            <SectionHeading id="profile-upcoming-heading">
              くわしい設定
            </SectionHeading>
            {profile.upcoming.length > 0 ? (
              <ul className="mt-4 space-y-2 leading-relaxed text-night-800/90">
                {profile.upcoming.map((entry) => (
                  <li key={entry}>{entry}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 rounded-2xl border border-dashed border-babyblue-300 bg-babyblue-50/50 p-5 text-sm text-night-800/70">
                準備中です。すこしずつ増えていきます。
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  if (locale === "ja") return <JapaneseProfile />;
  return <LocaleScaffold locale={locale} />;
}

import Button from "@/components/Button";
import SectionHeading from "@/components/SectionHeading";
import type { TopPageContent } from "@/content/topPage";

export default function CharacterIntroduction({
  text,
  profileHref,
}: {
  /** locale 別トップページの紹介セクション本文（content/topPage.ts）。 */
  text: TopPageContent["intro"];
  /** 「もっとくわしく」の遷移先（現在 locale の /profile）。 */
  profileHref: string;
}) {
  return (
    <section
      aria-labelledby="introduction-heading"
      className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16"
    >
      <SectionHeading id="introduction-heading">{text.heading}</SectionHeading>
      <div className="mt-6 space-y-1 leading-loose text-night-800/90">
        {text.lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
      <div className="mt-8">
        <Button href={profileHref} variant="secondary">
          {text.more}
        </Button>
      </div>
    </section>
  );
}

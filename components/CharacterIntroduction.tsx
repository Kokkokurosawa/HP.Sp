import Button from "@/components/Button";
import SectionHeading from "@/components/SectionHeading";
import { profile } from "@/content/profile";
import { siteConfig } from "@/config/site";

export default function CharacterIntroduction() {
  return (
    <section
      aria-labelledby="introduction-heading"
      className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16"
    >
      <SectionHeading id="introduction-heading">
        {siteConfig.characterName}って？
      </SectionHeading>
      <div className="mt-6 space-y-1 leading-loose text-night-800/90">
        {profile.intro.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
      <div className="mt-8">
        <Button href="/profile" variant="secondary">
          もっとくわしく
        </Button>
      </div>
    </section>
  );
}

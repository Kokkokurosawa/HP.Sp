import Button from "@/components/Button";
import FloatingSupitaro from "@/components/FloatingSupitaro";
import { siteConfig } from "@/config/site";

export default function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden bg-linear-to-b from-babyblue-100 via-babyblue-50 to-white"
    >
      {/* 夜空を思わせる控えめな装飾(静的なドット模様) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(circle,_#7fc3e8_1.5px,_transparent_2px),radial-gradient(circle,_#a794d6_1px,_transparent_1.5px)] [background-position:0_0,70px_90px] [background-size:140px_140px,200px_200px]"
      />

      <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 md:flex-row md:justify-between md:py-24">
        <div className="text-center md:text-left">
          <p className="text-sm font-bold tracking-[0.3em] text-lilac-600">
            おぱぁ。
          </p>
          <h1
            id="hero-heading"
            className="mt-4 text-3xl leading-snug font-bold text-night-900 sm:text-4xl"
          >
            宇宙から来た、
            <br className="sm:hidden" />
            ふしぎないきもの。
          </h1>
          <p className="mt-4 leading-relaxed text-night-800/70">
            {siteConfig.characterName}のこと、すこしだけ、のぞいてみませんか。
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 md:justify-start">
            {siteConfig.channels.youtube ? (
              <>
                {/* YouTube が第一 CTA(配信視聴がファン化の中心導線) */}
                <Button href={siteConfig.channels.youtube} external>
                  YouTubeで配信を見る
                </Button>
                <Button href="/profile" variant="secondary">
                  プロフィールを見る
                </Button>
              </>
            ) : (
              // URL 未設定時の保守用フォールバック
              <>
                <Button href="/profile">プロフィールを見る</Button>
                <Button href="/news" variant="secondary">
                  お知らせ
                </Button>
              </>
            )}
          </div>
        </div>

        <FloatingSupitaro />
      </div>
    </section>
  );
}

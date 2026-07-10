import SectionHeading from "@/components/SectionHeading";
import { siteConfig } from "@/config/site";

const channels = [
  {
    label: "YouTube",
    description: "こっそりゲーム配信をしているチャンネル",
    href: siteConfig.channels.youtube,
  },
  {
    label: "X",
    description: "公式アカウント",
    href: siteConfig.channels.x,
  },
];

export default function ChannelLinks() {
  return (
    <section
      aria-labelledby="channels-heading"
      className="bg-babyblue-50 py-12 sm:py-16"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <SectionHeading id="channels-heading">チャンネル</SectionHeading>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {channels.map((channel) => (
            <li key={channel.label}>
              {channel.href ? (
                <a
                  href={channel.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-11 flex-col gap-1 rounded-2xl border border-babyblue-200 bg-white p-5 transition-colors hover:border-babyblue-400 hover:bg-babyblue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deepblue-500"
                >
                  <span className="flex items-center gap-2 font-bold text-deepblue-700">
                    {channel.label}
                    <span aria-hidden="true">↗</span>
                    <span className="sr-only">
                      (外部リンク・新しいタブで開きます)
                    </span>
                  </span>
                  <span className="text-sm text-night-800/70">
                    {channel.description}
                  </span>
                </a>
              ) : (
                <div className="flex min-h-11 flex-col gap-1 rounded-2xl border border-dashed border-babyblue-300 bg-white/60 p-5">
                  <span className="flex items-center gap-2 font-bold text-deepblue-700/70">
                    {channel.label}
                    <span className="rounded-full bg-lilac-200 px-2 py-0.5 text-xs font-bold text-deepblue-700">
                      準備中
                    </span>
                  </span>
                  <span className="text-sm text-night-800/70">
                    {channel.description}
                  </span>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

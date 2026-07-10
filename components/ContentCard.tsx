import type { NewsItem } from "@/content/news";
import { formatDate } from "@/lib/format";

export default function ContentCard({
  item,
  headingLevel = "h3",
}: {
  item: NewsItem;
  /** 置かれる文脈の見出し階層に合わせる(トップは h2 配下なので h3、一覧ページは h1 直下なので h2) */
  headingLevel?: "h2" | "h3";
}) {
  const Heading = headingLevel;
  return (
    <article className="rounded-2xl border border-babyblue-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <time dateTime={item.date} className="text-sm text-deepblue-600">
          {formatDate(item.date)}
        </time>
        <span className="rounded-full bg-babyblue-100 px-3 py-0.5 text-xs font-bold text-deepblue-700">
          {item.category}
        </span>
      </div>
      <Heading className="mt-2 font-bold text-night-900">{item.title}</Heading>
      <p className="mt-2 text-sm leading-relaxed text-night-800/80">
        {item.body}
      </p>
      {item.link && (
        <p className="mt-3 text-sm">
          <a
            href={item.link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-1 font-bold text-deepblue-600 underline underline-offset-4 hover:text-deepblue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deepblue-500"
          >
            {item.link.label}
            <span aria-hidden="true">↗</span>
            <span className="sr-only">(外部リンク・新しいタブで開きます)</span>
          </a>
        </p>
      )}
    </article>
  );
}

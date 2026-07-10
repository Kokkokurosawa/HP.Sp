import type { ReactNode } from "react";

type SectionHeadingProps = {
  children: ReactNode;
  id?: string;
};

export default function SectionHeading({ children, id }: SectionHeadingProps) {
  return (
    <h2
      id={id}
      className="flex items-center gap-3 text-xl font-bold text-night-900 sm:text-2xl"
    >
      <span
        aria-hidden="true"
        className="inline-block size-3 shrink-0 rounded-full bg-babyblue-400"
      />
      {children}
    </h2>
  );
}

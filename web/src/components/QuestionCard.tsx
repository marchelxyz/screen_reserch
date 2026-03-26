import React from "react";

export type QuestionCardProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function QuestionCard({
  title,
  description,
  children,
}: QuestionCardProps): React.ReactElement {
  return (
    <section className="rounded-2xl border border-black/5 bg-white/70 backdrop-blur p-4 sm:p-5 shadow-sm">
      <header className="mb-3">
        <h2 className="text-base sm:text-lg font-bold text-foreground">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm text-foreground/70">{description}</p>
        ) : null}
      </header>
      <div>{children}</div>
    </section>
  );
}


import type { ResumeDocumentV1, ResumeSectionKey } from "@/types";

function Title({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 border-b border-[#202620] pb-1 text-lg font-bold">
      {children}
    </h2>
  );
}

export function ResumePreview({
  document,
}: {
  document: ResumeDocumentV1;
}) {
  const { data, displayConfig } = document;
  const visible = new Set(
    displayConfig.sections
      .filter((section) => section.visible)
      .map((section) => section.key),
  );

  const sections: Partial<Record<ResumeSectionKey, React.ReactNode>> = {
    header: (
      <header
        className={
          displayConfig.headerAlignment === "center"
            ? "text-center"
            : "text-left"
        }
      >
        <h1 className="font-serif text-4xl font-bold">{data.header.name}</h1>
        <p className="mt-2 text-lg text-[#687269]">
          {data.header.jobInfo.position}
        </p>
        <div
          className={`mt-4 flex flex-wrap gap-x-7 gap-y-1 text-sm ${
            displayConfig.headerAlignment === "center"
              ? "justify-center"
              : ""
          }`}
        >
          {data.header.contact.phone ? (
            <span>电话 / 微信：{data.header.contact.phone}</span>
          ) : null}
          {data.header.contact.email ? (
            <span>邮箱：{data.header.contact.email}</span>
          ) : null}
          {data.header.contact.github ? (
            <span>GitHub：{data.header.contact.github.text}</span>
          ) : null}
          {data.header.contact.homepage ? (
            <span>主页：{data.header.contact.homepage.text}</span>
          ) : null}
        </div>
      </header>
    ),
    education: data.education ? (
      <section>
        <Title>{data.education.title}</Title>
        <div className="flex flex-wrap justify-between gap-2 font-medium">
          <span>{data.education.school}</span>
          <span className="text-sm text-[#687269]">
            {data.education.base} · {data.education.period}
          </span>
        </div>
        <p className="mt-1 text-sm">{data.education.details}</p>
      </section>
    ) : null,
    skills: data.skills ? (
      <section>
        <Title>{data.skills.title}</Title>
        <ul className="list-inside list-disc space-y-1 text-sm">
          {data.skills.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    ) : null,
    intern: data.intern ? (
      <section>
        <Title>{data.intern.title}</Title>
        <div className="space-y-4">
          {data.intern.items
            .filter((item) => item.show !== false)
            .map((item, index) => (
              <article key={`${item.company}-${index}`}>
                <div className="flex flex-wrap justify-between gap-2">
                  <strong>
                    {item.company} · {item.position}
                  </strong>
                  <span className="text-sm text-[#687269]">
                    {item.base} · {item.period}
                  </span>
                </div>
                <p className="mt-1 text-sm">{item.description}</p>
                <ul className="mt-1 list-inside list-disc text-sm">
                  {item.responsibilities.map((responsibility) => (
                    <li key={responsibility}>{responsibility}</li>
                  ))}
                </ul>
              </article>
            ))}
        </div>
      </section>
    ) : null,
    projects: data.projects ? (
      <section>
        <Title>{data.projects.title}</Title>
        <div className="space-y-4">
          {data.projects.items
            .filter((item) => item.show !== false)
            .map((item, index) => (
              <article key={`${item.name}-${index}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <strong>{item.name}</strong>
                  <span className="text-xs text-[#687269]">
                    {item.techStack}
                  </span>
                </div>
                <p className="mt-1 text-sm">{item.description}</p>
                <ul className="mt-1 list-inside list-disc text-sm">
                  {item.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </article>
            ))}
        </div>
      </section>
    ) : null,
    about: data.about ? (
      <section>
        <Title>{data.about.title}</Title>
        <p className="whitespace-pre-wrap text-sm">{data.about.content}</p>
      </section>
    ) : null,
  };

  return (
    <article
      id="resume-preview"
      className="mx-auto min-h-[1120px] w-full max-w-[794px] space-y-6 bg-white px-10 py-12 text-[#202620] shadow-[0_16px_48px_rgb(38_48_39/0.12)] print:min-h-0 print:max-w-none print:shadow-none"
    >
      {displayConfig.sectionOrder.map((key) =>
        visible.has(key) ? (
          <div key={key}>{sections[key]}</div>
        ) : null,
      )}
    </article>
  );
}

import Image from "next/image";

import { renderSafeInlineMarkdown } from "@/lib/markdown";
import { cn } from "@/lib/utils";
import { getEducationItems } from "@/modules/resumes/education";
import type { ResumeDocumentV1, ResumeSectionKey } from "@/types";

const sectionTitleClass =
  "mb-2 border-b border-black py-1 text-lg font-bold text-black sm:text-xl";
const sectionClass = "mb-3";
const itemClass = "mb-3";
const bodyTextClass = "text-sm sm:text-base";
const mutedTextClass = "text-sm text-gray-600 sm:text-base";
const orderedListClass =
  "ml-0 list-inside list-decimal space-y-1 text-sm sm:text-base";

function Markdown({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  return (
    <span
      className={cn("[&_p]:inline", className)}
      dangerouslySetInnerHTML={{ __html: renderSafeInlineMarkdown(value) }}
    />
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className={sectionTitleClass}>{children}</h2>;
}

function ResumeLink({
  href,
  children,
  className,
  underline = true,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  underline?: boolean;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "text-sm text-black sm:text-base",
        underline ? "underline" : "no-underline",
        className,
      )}
    >
      {children}
    </a>
  );
}

function HeaderSection({
  document,
}: {
  document: ResumeDocumentV1;
}) {
  const { data, displayConfig } = document;
  const { contact, jobInfo, name } = data.header;
  const alignment = displayConfig.headerAlignment ?? "left";
  const alignmentClasses =
    alignment === "center"
      ? "items-center text-center"
      : "items-start text-left";

  return (
    <header className={sectionClass}>
      <div
        className={cn(
          "resume-header-layout flex flex-col-reverse justify-between gap-4 sm:flex-row sm:items-stretch sm:gap-8 print:flex-row print:items-stretch print:gap-8",
          alignment === "center" && "sm:justify-center",
        )}
      >
        <div
          className={cn(
            "flex w-full flex-1 flex-col sm:w-auto",
            alignmentClasses,
          )}
        >
          <div className="mb-3 sm:mb-4">
            <h1 className="m-0 font-serif text-2xl font-bold sm:text-3xl md:text-4xl">
              {name}
            </h1>
            <p className="mt-2 font-[Georgia] text-base text-gray-600 sm:mt-4 sm:text-lg md:text-xl">
              <b>{jobInfo.position}</b>
            </p>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <div
              className={cn(
                "grid grid-cols-1 gap-2 sm:grid-cols-2",
                alignment === "center" && "sm:justify-center",
              )}
            >
              <p className={bodyTextClass}>
                <b>电话 / 微信：</b>
                {contact.phone}
              </p>
              <p className={bodyTextClass}>
                <b>邮箱：</b>
                <ResumeLink
                  href={`mailto:${contact.email}`}
                  underline={false}
                >
                  {contact.email}
                </ResumeLink>
              </p>
              {contact.homepage ? (
                <p className={bodyTextClass}>
                  <b>主页：</b>
                  <ResumeLink href={contact.homepage.url}>
                    {contact.homepage.text}
                  </ResumeLink>
                </p>
              ) : (
                <span aria-hidden="true" />
              )}
              {contact.github ? (
                <p className={bodyTextClass}>
                  <b>GitHub：</b>
                  <ResumeLink href={contact.github.url}>
                    {contact.github.text}
                  </ResumeLink>
                </p>
              ) : (
                <span aria-hidden="true" />
              )}
            </div>
          </div>
        </div>

        {displayConfig.photo.showPhoto ? (
          <div
            data-testid="resume-photo-frame"
            className="resume-photo-frame relative flex h-32 shrink-0 self-center items-center justify-center overflow-hidden rounded-lg border border-gray-200 sm:h-auto sm:self-stretch print:h-auto print:self-stretch"
          >
            {displayConfig.photo.photoData ? (
              <Image
                src={displayConfig.photo.photoData}
                alt="个人照片"
                width={128}
                height={160}
                unoptimized
                className="resume-photo-image h-full w-auto object-contain"
              />
            ) : (
              <div className="grid h-full w-24 place-items-center bg-gray-50 text-xs text-gray-400 sm:w-32 print:w-32">
                个人照片
              </div>
            )}
          </div>
        ) : null}
      </div>
    </header>
  );
}

function EducationSection({
  document,
}: {
  document: ResumeDocumentV1;
}) {
  const education = document.data.education;
  if (!education) return null;
  const items = getEducationItems(education);
  if (items.length === 0) return null;
  return (
    <section className={sectionClass}>
      <SectionTitle>{education.title}</SectionTitle>
      {items.map((item, index) => (
        <div className={itemClass} key={`${item.school}-${index}`}>
          <div className="mb-1.5 flex items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={`${item.school} logo`}
                  width={36}
                  height={36}
                  unoptimized
                  className="shrink-0 object-contain"
                />
              ) : null}
              <h3 className="text-base font-bold leading-none sm:text-lg">
                {item.school}
              </h3>
            </div>
            {item.base ? (
              <span className={mutedTextClass}>{item.base}</span>
            ) : null}
          </div>
          {item.entries.map((entry, entryIndex) => (
            <div
              key={entryIndex}
              className="flex items-start justify-between gap-2"
            >
              <p className={bodyTextClass}>{entry.details}</p>
              <span className={mutedTextClass}>{entry.period}</span>
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}

function InternSection({ document }: { document: ResumeDocumentV1 }) {
  const intern = document.data.intern;
  if (!intern) return null;
  return (
    <section className={sectionClass}>
      <SectionTitle>{intern.title}</SectionTitle>
      {intern.items
        .filter((item) => item.show !== false)
        .map((item, index) => (
          <div className={itemClass} key={`${item.company}-${index}`}>
            <div className="mb-1.5 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center sm:gap-0">
              <div className="flex flex-wrap items-center gap-2">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={`${item.company} logo`}
                    width={36}
                    height={36}
                    unoptimized
                    className="shrink-0 object-contain"
                  />
                ) : null}
                <h3 className="text-base font-bold leading-none sm:text-lg">
                  {item.company}
                </h3>
                <span className={cn(mutedTextClass, "leading-none")}>
                  {item.position}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1">
                <span className={mutedTextClass}>{item.base}</span>
                <span className={mutedTextClass}>｜{item.period}</span>
              </div>
            </div>
            {item.description ? (
              <p className="mb-1.5 text-sm text-gray-700 sm:text-base">
                <Markdown value={item.description} />
              </p>
            ) : null}
            <ol className={orderedListClass}>
              {item.responsibilities.map((responsibility, itemIndex) => (
                <li key={itemIndex}>
                  <Markdown value={responsibility} />
                </li>
              ))}
            </ol>
          </div>
        ))}
    </section>
  );
}

function ProjectsSection({
  document,
}: {
  document: ResumeDocumentV1;
}) {
  const projects = document.data.projects;
  if (!projects) return null;
  return (
    <section className={sectionClass}>
      <SectionTitle>{projects.title}</SectionTitle>
      {projects.items
        .filter((item) => item.show !== false)
        .map((item, index) => (
          <div className={itemClass} key={`${item.name}-${index}`}>
            <div className="mb-1.5 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center sm:gap-0">
              <h3 className="text-base font-bold sm:text-lg">{item.name}</h3>
              {item.github ? (
                <ResumeLink
                  href={item.github}
                  className="break-all sm:break-normal"
                >
                  {item.github}
                </ResumeLink>
              ) : null}
            </div>
            {item.description ? (
              <p className="mb-1.5 text-sm text-gray-700 sm:text-base">
                <Markdown value={item.description} />
              </p>
            ) : null}
            <ol className={orderedListClass}>
              {item.features.map((feature, itemIndex) => (
                <li key={itemIndex}>
                  <Markdown value={feature} />
                </li>
              ))}
            </ol>
          </div>
        ))}
    </section>
  );
}

function SkillsSection({ document }: { document: ResumeDocumentV1 }) {
  const skills = document.data.skills;
  if (!skills) return null;
  return (
    <section className={sectionClass}>
      <SectionTitle>{skills.title}</SectionTitle>
      <ol className={orderedListClass}>
        {skills.items.map((skill, index) => (
          <li key={index}>
            <Markdown value={skill} />
          </li>
        ))}
      </ol>
    </section>
  );
}

function AboutSection({ document }: { document: ResumeDocumentV1 }) {
  const about = document.data.about;
  if (!about?.content) return null;
  const paragraphs = about.content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  return (
    <section className={sectionClass}>
      <SectionTitle>{about.title}</SectionTitle>
      <ol className={orderedListClass}>
        {paragraphs.map((paragraph, index) => (
          <li
            key={index}
            className="leading-relaxed text-gray-700 [&_strong]:font-semibold [&_strong]:text-gray-900"
          >
            <Markdown value={paragraph} />
          </li>
        ))}
      </ol>
    </section>
  );
}

export function ResumePreview({
  document,
}: {
  document: ResumeDocumentV1;
}) {
  const visible = new Set(
    document.displayConfig.sections
      .filter((section) => section.visible)
      .map((section) => section.key),
  );
  const sections: Record<ResumeSectionKey, React.ReactNode> = {
    header: <HeaderSection document={document} />,
    education: <EducationSection document={document} />,
    intern: <InternSection document={document} />,
    projects: <ProjectsSection document={document} />,
    skills: <SkillsSection document={document} />,
    about: <AboutSection document={document} />,
  };

  return (
    <article
      id="resume-preview"
      className="min-w-0 text-black print:bg-white"
    >
      {document.displayConfig.sectionOrder.map((key) =>
        visible.has(key) ? <div key={key}>{sections[key]}</div> : null,
      )}
    </article>
  );
}

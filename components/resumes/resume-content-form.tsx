"use client";

import { type ReactNode, useState } from "react";

import { cn } from "@/lib/utils";
import type {
  InternItem,
  ProjectItem,
  ResumeData,
} from "@/types";

const inputClass =
  "w-full rounded-md border border-input bg-background px-2.5 text-sm text-foreground outline-none transition-shadow placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/15";

function Field({
  label,
  value,
  onChange,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <label className={cn("grid gap-1.5", className)}>
      <span className="text-xs text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(inputClass, "h-9")}
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  rows = 5,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <textarea
        value={value}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        className={cn(inputClass, "resize-y py-2 leading-5")}
      />
    </label>
  );
}

function FormSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <details
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
      className="group border-b border-border last:border-b-0"
    >
      <summary
        aria-label={`${title}编辑区域`}
        className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-foreground marker:hidden"
      >
        <span className="flex items-center justify-between">
          {title}
          <span className="text-xs text-muted-foreground transition-transform group-open:rotate-90">
            ›
          </span>
        </span>
      </summary>
      <div className="grid gap-3 px-4 pb-4">{children}</div>
    </details>
  );
}

function lines(value: string) {
  return value.split("\n");
}

export function ResumeContentForm({
  data,
  onChange,
}: {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
}) {
  const education = data.education ?? {
    title: "教育经历",
    school: "",
    period: "",
    details: "",
  };
  const intern = data.intern ?? { title: "实习经历", items: [] };
  const projects = data.projects ?? { title: "项目经历", items: [] };
  const skills = data.skills ?? { title: "专业技能", items: [] };
  const about = data.about ?? { title: "关于我", content: "" };

  function updateIntern(index: number, patch: Partial<InternItem>) {
    onChange({
      ...data,
      intern: {
        ...intern,
        items: intern.items.map((item, itemIndex) =>
          itemIndex === index ? { ...item, ...patch } : item,
        ),
      },
    });
  }

  function updateProject(index: number, patch: Partial<ProjectItem>) {
    onChange({
      ...data,
      projects: {
        ...projects,
        items: projects.items.map((item, itemIndex) =>
          itemIndex === index ? { ...item, ...patch } : item,
        ),
      },
    });
  }

  return (
    <div>
      <FormSection title="个人信息" defaultOpen>
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="姓名"
            value={data.header.name}
            onChange={(name) =>
              onChange({
                ...data,
                header: { ...data.header, name },
              })
            }
          />
          <Field
            label="求职方向"
            value={data.header.jobInfo.position ?? ""}
            onChange={(position) =>
              onChange({
                ...data,
                header: {
                  ...data.header,
                  jobInfo: { ...data.header.jobInfo, position },
                },
              })
            }
          />
          <Field
            label="电话 / 微信"
            value={data.header.contact.phone}
            onChange={(phone) =>
              onChange({
                ...data,
                header: {
                  ...data.header,
                  contact: { ...data.header.contact, phone },
                },
              })
            }
          />
          <Field
            label="邮箱"
            value={data.header.contact.email}
            onChange={(email) =>
              onChange({
                ...data,
                header: {
                  ...data.header,
                  contact: { ...data.header.contact, email },
                },
              })
            }
          />
          <Field
            label="意向时长"
            value={data.header.jobInfo.duration ?? ""}
            onChange={(duration) =>
              onChange({
                ...data,
                header: {
                  ...data.header,
                  jobInfo: { ...data.header.jobInfo, duration },
                },
              })
            }
          />
          <Field
            label="到岗时间"
            value={data.header.jobInfo.availability ?? ""}
            onChange={(availability) =>
              onChange({
                ...data,
                header: {
                  ...data.header,
                  jobInfo: { ...data.header.jobInfo, availability },
                },
              })
            }
          />
        </div>
        <Field
          label="GitHub 链接"
          value={data.header.contact.github?.url ?? ""}
          onChange={(url) =>
            onChange({
              ...data,
              header: {
                ...data.header,
                contact: {
                  ...data.header.contact,
                  github: {
                    text:
                      !data.header.contact.github ||
                      data.header.contact.github.text ===
                        data.header.contact.github.url
                        ? url
                        : data.header.contact.github.text,
                    url,
                  },
                },
              },
            })
          }
        />
        <Field
          label="个人主页"
          value={data.header.contact.homepage?.url ?? ""}
          onChange={(url) =>
            onChange({
              ...data,
              header: {
                ...data.header,
                contact: {
                  ...data.header.contact,
                  homepage: {
                    text:
                      !data.header.contact.homepage ||
                      data.header.contact.homepage.text ===
                        data.header.contact.homepage.url
                        ? url
                        : data.header.contact.homepage.text,
                    url,
                  },
                },
              },
            })
          }
        />
      </FormSection>

      <FormSection title="教育经历" defaultOpen>
        <Field
          label="模块标题"
          value={education.title}
          onChange={(title) =>
            onChange({ ...data, education: { ...education, title } })
          }
        />
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="学校"
            value={education.school}
            onChange={(school) =>
              onChange({ ...data, education: { ...education, school } })
            }
          />
          <Field
            label="地点"
            value={education.base ?? ""}
            onChange={(base) =>
              onChange({ ...data, education: { ...education, base } })
            }
          />
        </div>
        <Field
          label="时间"
          value={education.period}
          onChange={(period) =>
            onChange({ ...data, education: { ...education, period } })
          }
        />
        <TextAreaField
          label="专业与学历"
          rows={3}
          value={education.details}
          onChange={(details) =>
            onChange({ ...data, education: { ...education, details } })
          }
        />
      </FormSection>

      <FormSection title="实习经历">
        <Field
          label="模块标题"
          value={intern.title}
          onChange={(title) =>
            onChange({ ...data, intern: { ...intern, title } })
          }
        />
        {intern.items.map((item, index) => (
          <div
            key={`intern-${index}`}
            className="grid gap-3 rounded-lg border border-border bg-muted/20 p-3"
          >
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="公司"
                value={item.company}
                onChange={(company) => updateIntern(index, { company })}
              />
              <Field
                label="地点"
                value={item.base}
                onChange={(base) => updateIntern(index, { base })}
              />
            </div>
            <Field
              label="职位"
              value={item.position}
              onChange={(position) => updateIntern(index, { position })}
            />
            <Field
              label="时间"
              value={item.period}
              onChange={(period) => updateIntern(index, { period })}
            />
            <TextAreaField
              label="经历概述"
              value={item.description}
              onChange={(description) =>
                updateIntern(index, { description })
              }
              rows={6}
            />
            <TextAreaField
              label="工作内容（每行一项）"
              value={item.responsibilities.join("\n")}
              onChange={(value) =>
                updateIntern(index, { responsibilities: lines(value) })
              }
              rows={10}
            />
          </div>
        ))}
      </FormSection>

      <FormSection title="项目经历">
        <Field
          label="模块标题"
          value={projects.title}
          onChange={(title) =>
            onChange({ ...data, projects: { ...projects, title } })
          }
        />
        {projects.items.map((item, index) => (
          <div
            key={`project-${index}`}
            className="grid gap-3 rounded-lg border border-border bg-muted/20 p-3"
          >
            <Field
              label="项目名称"
              value={item.name}
              onChange={(name) => updateProject(index, { name })}
            />
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="GitHub"
                value={item.github}
                onChange={(github) => updateProject(index, { github })}
              />
              <Field
                label="技术栈"
                value={item.techStack ?? ""}
                onChange={(techStack) =>
                  updateProject(index, { techStack })
                }
              />
            </div>
            <TextAreaField
              label="项目概述"
              value={item.description}
              onChange={(description) =>
                updateProject(index, { description })
              }
              rows={6}
            />
            <TextAreaField
              label="项目亮点（每行一项）"
              value={item.features.join("\n")}
              onChange={(value) =>
                updateProject(index, { features: lines(value) })
              }
              rows={8}
            />
          </div>
        ))}
      </FormSection>

      <FormSection title="专业技能">
        <Field
          label="模块标题"
          value={skills.title}
          onChange={(title) =>
            onChange({ ...data, skills: { ...skills, title } })
          }
        />
        <TextAreaField
          label="每行一项"
          value={skills.items.join("\n")}
          onChange={(value) =>
            onChange({
              ...data,
              skills: { ...skills, items: lines(value) },
            })
          }
          rows={8}
        />
      </FormSection>

      <FormSection title="关于我">
        <Field
          label="模块标题"
          value={about.title}
          onChange={(title) =>
            onChange({ ...data, about: { ...about, title } })
          }
        />
        <TextAreaField
          label="自我介绍"
          value={about.content}
          onChange={(content) =>
            onChange({ ...data, about: { ...about, content } })
          }
          rows={12}
        />
      </FormSection>
    </div>
  );
}

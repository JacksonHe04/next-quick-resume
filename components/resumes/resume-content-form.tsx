"use client";

import { Plus, Trash2 } from "lucide-react";
import { type ReactNode, useState } from "react";

import { cn } from "@/lib/utils";
import {
  getEducationItems,
  withEducationItems,
} from "@/modules/resumes/education";
import type {
  EducationEntry,
  EducationItem,
  InternItem,
  ProjectItem,
  ResumeData,
} from "@/types";

const inputClass =
  "w-full min-w-0 rounded-md border border-input bg-background px-2.5 text-sm text-foreground outline-none transition-shadow placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/15";

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

function CollectionItem({
  label,
  onDelete,
  children,
}: {
  label: string;
  onDelete: () => void;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-3 rounded-lg border border-border bg-muted/20 p-3">
      <div className="flex items-center justify-between gap-3">
        <span className="truncate text-xs font-medium text-muted-foreground">
          {label}
        </span>
        <button
          type="button"
          aria-label={`删除${label}`}
          title={`删除${label}`}
          onClick={onDelete}
          className="grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="size-3.5" aria-hidden="true" />
        </button>
      </div>
      {children}
    </div>
  );
}

function AddItemButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border text-sm font-medium text-muted-foreground transition-colors hover:border-foreground/25 hover:bg-muted/45 hover:text-foreground"
    >
      <Plus className="size-4" aria-hidden="true" />
      {label}
    </button>
  );
}

export function ResumeContentForm({
  data,
  onChange,
}: {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
}) {
  const educationTitle = data.education?.title ?? "教育经历";
  const educationItems = getEducationItems(data.education);
  const intern = data.intern ?? { title: "实习经历", items: [] };
  const projects = data.projects ?? { title: "项目经历", items: [] };
  const skills = data.skills ?? { title: "专业技能", items: [] };
  const about = data.about ?? { title: "关于我", content: "" };

  function updateEducation(index: number, patch: Partial<EducationItem>) {
    const items = educationItems.map((item, itemIndex) =>
      itemIndex === index ? { ...item, ...patch } : item,
    );
    onChange({
      ...data,
      education: withEducationItems(educationTitle, items),
    });
  }

  function updateEducationEntry(
    eduIndex: number,
    entryIndex: number,
    patch: Partial<EducationEntry>,
  ) {
    const items = educationItems.map((item, itemIndex) => {
      if (itemIndex !== eduIndex) return item;
      return {
        ...item,
        entries: item.entries.map((entry, eIdx) =>
          eIdx === entryIndex ? { ...entry, ...patch } : entry,
        ),
      };
    });
    onChange({
      ...data,
      education: withEducationItems(educationTitle, items),
    });
  }

  function addEducationEntry(eduIndex: number) {
    const items = educationItems.map((item, itemIndex) => {
      if (itemIndex !== eduIndex) return item;
      return {
        ...item,
        entries: [...item.entries, { period: "", details: "" }],
      };
    });
    onChange({
      ...data,
      education: withEducationItems(educationTitle, items),
    });
  }

  function removeEducationEntry(eduIndex: number, entryIndex: number) {
    const items = educationItems.map((item, itemIndex) => {
      if (itemIndex !== eduIndex) return item;
      return {
        ...item,
        entries: item.entries.filter((_, eIdx) => eIdx !== entryIndex),
      };
    });
    onChange({
      ...data,
      education: withEducationItems(educationTitle, items),
    });
  }

  function addEducation() {
    const items = [
      ...educationItems,
      { school: "", base: "", entries: [{ period: "", details: "" }] },
    ];
    onChange({
      ...data,
      education: withEducationItems(educationTitle, items),
    });
  }

  function removeEducation(index: number) {
    const items = educationItems.filter(
      (_, itemIndex) => itemIndex !== index,
    );
    onChange({
      ...data,
      education: withEducationItems(educationTitle, items),
    });
  }

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

  function addIntern() {
    onChange({
      ...data,
      intern: {
        ...intern,
        items: [
          ...intern.items,
          {
            company: "",
            position: "",
            period: "",
            base: "",
            description: "",
            responsibilities: [""],
          },
        ],
      },
    });
  }

  function removeIntern(index: number) {
    const items = intern.items.filter(
      (_, itemIndex) => itemIndex !== index,
    );
    onChange({
      ...data,
      intern: items.length ? { ...intern, items } : undefined,
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

  function addProject() {
    onChange({
      ...data,
      projects: {
        ...projects,
        items: [
          ...projects.items,
          {
            name: "",
            github: "",
            description: "",
            features: [""],
          },
        ],
      },
    });
  }

  function removeProject(index: number) {
    const items = projects.items.filter(
      (_, itemIndex) => itemIndex !== index,
    );
    onChange({
      ...data,
      projects: items.length ? { ...projects, items } : undefined,
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
          value={educationTitle}
          onChange={(title) =>
            onChange({
              ...data,
              education: withEducationItems(title, educationItems),
            })
          }
        />
        {educationItems.map((item, index) => (
          <CollectionItem
            key={`education-${index}`}
            label={item.school || `教育经历 ${index + 1}`}
            onDelete={() => removeEducation(index)}
          >
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="学校"
                value={item.school}
                onChange={(school) => updateEducation(index, { school })}
              />
              <Field
                label="地点"
                value={item.base ?? ""}
                onChange={(base) => updateEducation(index, { base })}
              />
            </div>
            {item.entries.map((entry, entryIndex) => (
              <div
                key={entryIndex}
                className="grid gap-3 rounded-md border border-border/60 bg-background/50 p-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    学历段 {entryIndex + 1}
                  </span>
                  {item.entries.length > 1 ? (
                    <button
                      type="button"
                      aria-label={`删除学历段 ${entryIndex + 1}`}
                      onClick={() =>
                        removeEducationEntry(index, entryIndex)
                      }
                      className="grid size-6 place-items-center rounded text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-3" aria-hidden="true" />
                    </button>
                  ) : null}
                </div>
                <Field
                  label="时间"
                  value={entry.period}
                  onChange={(period) =>
                    updateEducationEntry(index, entryIndex, { period })
                  }
                />
                <TextAreaField
                  label="专业与学历"
                  rows={3}
                  value={entry.details}
                  onChange={(details) =>
                    updateEducationEntry(index, entryIndex, { details })
                  }
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => addEducationEntry(index)}
              className="flex h-8 items-center justify-center gap-1.5 rounded-md border border-dashed border-border text-xs text-muted-foreground transition-colors hover:border-foreground/25 hover:bg-muted/30 hover:text-foreground"
            >
              <Plus className="size-3" aria-hidden="true" />
              添加学历段
            </button>
          </CollectionItem>
        ))}
        <AddItemButton label="新增教育经历" onClick={addEducation} />
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
          <CollectionItem
            key={`intern-${index}`}
            label={item.company || `实习经历 ${index + 1}`}
            onDelete={() => removeIntern(index)}
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
          </CollectionItem>
        ))}
        <AddItemButton label="新增实习经历" onClick={addIntern} />
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
          <CollectionItem
            key={`project-${index}`}
            label={item.name || `项目经历 ${index + 1}`}
            onDelete={() => removeProject(index)}
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
          </CollectionItem>
        ))}
        <AddItemButton label="新增项目经历" onClick={addProject} />
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

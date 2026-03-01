import { ResumeData, ResumeSectionKey, ResumeSettings } from '@/types'

export const DEFAULT_SECTION_ORDER: ResumeSectionKey[] = [
  'header',
  'education',
  'intern',
  'projects',
  'skills',
  'about'
]

export const SECTION_LABELS: Record<ResumeSectionKey, string> = {
  header: '个人信息',
  education: '教育经历',
  intern: '实习经历',
  projects: '项目经历',
  skills: '技能与优势',
  about: '关于我'
}

export const DEFAULT_SECTION_VISIBILITY: Record<ResumeSectionKey, boolean> = {
  header: true,
  education: true,
  intern: true,
  projects: true,
  skills: true,
  about: true
}

export const DEFAULT_TYPOGRAPHY = {
  fontFamily: '"Noto Serif SC", "Source Han Serif SC", "Songti SC", "STSong", serif',
  lineHeight: 1.5
}

export const DEFAULT_LAYOUT = {
  scale: 1
}

export const DEFAULT_RESUME_SETTINGS: ResumeSettings = {
  sectionOrder: DEFAULT_SECTION_ORDER,
  sectionVisibility: DEFAULT_SECTION_VISIBILITY,
  typography: DEFAULT_TYPOGRAPHY,
  layout: DEFAULT_LAYOUT
}

export const normalizeResumeSettings = (settings?: Partial<ResumeSettings>): ResumeSettings => {
  const safeOrder = Array.isArray(settings?.sectionOrder)
    ? settings!.sectionOrder.filter((key): key is ResumeSectionKey => DEFAULT_SECTION_ORDER.includes(key))
    : DEFAULT_SECTION_ORDER

  const mergedVisibility = {
    ...DEFAULT_SECTION_VISIBILITY,
    ...(settings?.sectionVisibility || {})
  }

  return {
    sectionOrder: safeOrder.length === DEFAULT_SECTION_ORDER.length
      ? safeOrder
      : Array.from(new Set([...safeOrder, ...DEFAULT_SECTION_ORDER])),
    sectionVisibility: mergedVisibility,
    typography: {
      ...DEFAULT_TYPOGRAPHY,
      ...(settings?.typography || {})
    },
    layout: {
      ...DEFAULT_LAYOUT,
      ...(settings?.layout || {})
    }
  }
}

export const mergeResumeSettings = (
  current: ResumeSettings,
  patch: Partial<ResumeSettings>
): ResumeSettings => {
  return normalizeResumeSettings({
    ...current,
    ...patch,
    sectionOrder: patch.sectionOrder ?? current.sectionOrder,
    sectionVisibility: {
      ...current.sectionVisibility,
      ...(patch.sectionVisibility || {})
    },
    typography: {
      ...current.typography,
      ...(patch.typography || {})
    },
    layout: {
      ...current.layout,
      ...(patch.layout || {})
    }
  })
}

export const normalizeResumeData = (data: ResumeData): ResumeData => {
  return {
    ...data,
    settings: normalizeResumeSettings(data.settings)
  }
}

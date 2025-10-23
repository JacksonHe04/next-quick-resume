import { getCurrentResumeData } from "@/config/data";
import { ProjectItem as ProjectItemType } from "@/types";
import { SectionContainer, SectionTitle, Link } from "@/components/common";
import {
  TITLE_STYLES,
  TEXT_STYLES,
  CONTAINER_STYLES,
  COMBINED_STYLES,
  LIST_STYLES,
} from "@/constants/styles";
import { markdownToHtml } from "@/utils/markdown";

/**
 * 单个项目组件 - 可复用的项目展示组件
 * @param project - 项目数据对象
 */
function ProjectItem({ project }: { project: ProjectItemType }) {
  return (
    <div className={CONTAINER_STYLES.project}>
      <div className={COMBINED_STYLES.projectTitleRow}>
        <h3 className={TITLE_STYLES.project}>{project.name}</h3>
        <Link href={project.github} className={TEXT_STYLES.base}>
          {project.github}
        </Link>
      </div>
      {/* <div className={COMBINED_STYLES.projectInfoRow}> */}
        {/* <p className={TEXT_STYLES.techStack}>技术栈：{project.techStack}</p> */}
        {/* <Link href={project.demo}>{project.demo}</Link> */}
      {/* </div> */}
      {project.description && (
        <p className={TEXT_STYLES.description}>{project.description}</p>
      )}
      <ol className={LIST_STYLES.ordered}>
        {project.features.map((feature, index) => (
          <li key={index} dangerouslySetInnerHTML={{ __html: markdownToHtml(feature) }} />
        ))}
      </ol>
    </div>
  );
}

/**
 * 项目经历组件 - 展示项目列表和详细信息
 * 从统一的简历数据源中读取项目列表并循环渲染
 */
export default function Projects() {
  const projects = getCurrentResumeData().projects;

  return (
    <SectionContainer>
      <SectionTitle>{projects.title}</SectionTitle>
      {projects.items
        .filter((item) => item.show)
        .map((project, index) => (
          <ProjectItem key={index} project={project} />
        ))}
    </SectionContainer>
  );
}

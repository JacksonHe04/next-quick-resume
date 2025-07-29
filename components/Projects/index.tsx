import projectsData from './data.json'

/**
 * 项目信息接口定义
 */
interface ProjectData {
  name: string
  github: string
  demo: string
  techStack: string
  description: string
  features: string[]
}

/**
 * 单个项目组件 - 可复用的项目展示组件
 * @param project - 项目数据对象
 */
function ProjectItem({ project }: { project: ProjectData }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1.5">
        <h3 className="font-bold text-base">{project.name}</h3>
        <a
          href={project.github}
          target="_blank"
          className="text-black underline text-sm"
        >
          {project.github}
        </a>
      </div>
      <div className="flex justify-between mb-1.5 text-sm">
        <p className="text-black text-sm">
          技术栈：{project.techStack}
        </p>
        <a
          href={project.demo}
          target="_blank"
          className="text-black underline"
        >
          {project.demo}
        </a>
      </div>
      {project.description && (
        <p className="text-gray-700 text-sm mb-1.5">
          {project.description}
        </p>
      )}
      <ul className="list-disc list-inside pl-2.5 ml-0 text-sm space-y-1">
        {project.features.map((feature, index) => (
          <li key={index}>{feature}</li>
        ))}
      </ul>
    </div>
  )
}

/**
 * 项目经历组件 - 展示项目列表和详细信息
 * 从本地JSON数据文件中读取项目列表并循环渲染
 */
export default function Projects() {
  const projects = projectsData

  return (
    <div className="mb-2">
      <h2 className="text-lg font-bold text-black py-1 mb-2 border-b border-black">
        {projects.title}
      </h2>
      {projects.items.filter(item => item.show).map((project, index) => (
        <ProjectItem key={index} project={project} />
      ))}
    </div>
  )
}
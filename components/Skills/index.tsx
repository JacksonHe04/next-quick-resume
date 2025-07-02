import skillsData from './data.json'

/**
 * 专业技能组件 - 展示技术技能列表
 * 从本地JSON数据文件中读取技能列表并循环渲染
 */
export default function Skills() {
  const skills = skillsData

  return (
    <div className="mb-2">
      <h2 className="text-lg font-bold text-black py-1 mb-2 border-b border-black">
        {skills.title}
      </h2>
      <ul className="list-disc list-inside pl-2.5 ml-0 text-sm space-y-1">
        {skills.items.map((skill, index) => (
          <li key={index} dangerouslySetInnerHTML={{ __html: skill }} />
        ))}
      </ul>
    </div>
  )
}
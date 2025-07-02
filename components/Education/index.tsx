import educationData from './data.json'

/**
 * 教育经历组件 - 展示学历信息
 * 从本地JSON数据文件中读取教育经历信息进行渲染
 */
export default function Education() {
  const education = educationData

  return (
    <div className="mb-2">
      <h2 className="text-lg font-bold text-black py-1 mb-2 border-b border-black">
        {education.title}
      </h2>
      <div className="mb-3">
        <div className="flex justify-between items-center">
          <h3>
            <b>{education.school}</b>
          </h3>
          <p className="text-gray-600 text-sm">{education.period}</p>
        </div>
        <p>{education.details}</p>
      </div>
    </div>
  )
}
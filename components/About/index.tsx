import aboutData from './data.json'

/**
 * 关于我组件 - 展示个人简介和自我描述
 * 从本地JSON数据文件中读取关于我的信息进行渲染
 */
export default function About() {
  const { title, content } = aboutData

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold mb-4 border-b-2 border-gray-300 pb-2">
        {title}
      </h2>
      <div className="text-gray-700 leading-relaxed">
        <p>{content}</p>
      </div>
    </div>
  )
}
import headerData from './data.json'

/**
 * 简历头部组件 - 包含个人基本信息和联系方式
 * 从本地JSON数据文件中读取个人信息进行渲染
 */
export default function Header() {
  const { name, contact, jobInfo } = headerData

  return (
    <div className="mb-2">
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold m-0">{name}</h1>
        <p className="text-lg text-gray-600 mt-2">{jobInfo.position}</p>
      </div>
      <div className="grid grid-cols-2 gap-8">
        <div className="text-right">
          <p>
            电话/微信：{contact.phone}
          </p>
          <p>
            GitHub:&nbsp;
            <a
              href={contact.github.url}
              className="text-black underline"
              target="_blank"
            >
              {contact.github.text}
            </a>
          </p>
        </div>
        <div className="text-left">
          <p>
            邮箱：
            <a
              href={`mailto:${contact.email}`}
              className="text-black no-underline"
              target="_blank"
            >
              {contact.email}
            </a>
          </p>
          <p>年龄：{contact.age}</p>
          <p>
            主页:&nbsp;
            <a
              href={contact.homepage.url}
              className="text-black underline"
              target="_blank"
            >
              {contact.homepage.text}
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
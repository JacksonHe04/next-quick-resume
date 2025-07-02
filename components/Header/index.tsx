import headerData from './data.json'

/**
 * 简历头部组件 - 包含个人基本信息和联系方式
 * 从本地JSON数据文件中读取个人信息进行渲染
 */
export default function Header() {
  const { name, contact, jobInfo } = headerData

  return (
    <div className="mb-2">
      <div className="text-left mb-4">
        <h1 className="text-3xl font-bold m-0">{name}</h1>
      </div>
      <div className="grid grid-cols-5 gap-5">
        <div className="text-left col-span-3">
          <p>
            电话：{contact.phone} | 邮箱：
            <a
              href={`mailto:${contact.email}`}
              className="text-black no-underline"
            >
              {contact.email}
            </a>
          </p>
          <p>微信：{contact.wechat} | 年龄：{contact.age}</p>
          <p>
            GitHub：
            <a
              href={contact.github.url}
              className="text-black no-underline"
            >
              {contact.github.text}
            </a>
            &nbsp;| 主页：
            <a
              href={contact.homepage.url}
              className="text-black no-underline"
            >
              {contact.homepage.text}
            </a>
          </p>
        </div>
        <div className="text-right col-span-2">
          <p>
            <strong>目标岗位：</strong>{jobInfo.position}
          </p>
          <p>
            <strong>可实习时间：</strong>{jobInfo.duration}
          </p>
          <p>
            <strong>到岗时间：</strong>{jobInfo.availability}
          </p>
        </div>
      </div>
    </div>
  )
}
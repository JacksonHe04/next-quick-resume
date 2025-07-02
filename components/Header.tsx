/**
 * 简历头部组件 - 包含个人基本信息和联系方式
 */
export default function Header() {
  return (
    <div className="mb-2">
      <div className="text-left mb-4">
        <h1 className="text-3xl font-bold m-0">何锦诚</h1>
      </div>
      <div className="grid grid-cols-5 gap-5">
        <div className="text-left col-span-3">
          <p>
            电话：17712862516 | 邮箱：
            <a
              href="mailto:jacksonhe04@qq.com"
              className="text-black no-underline"
            >
              jacksonhe04@qq.com
            </a>
          </p>
          <p>微信：FRONTENDYUANFANG | 年龄：20</p>
          <p>
            GitHub：
            <a
              href="https://github.com/JacksonHe04"
              className="text-black no-underline"
            >
              JacksonHe04
            </a>
            | 主页：
            <a
              href="https://jacksonhe.notion.site"
              className="text-black no-underline"
            >
              https://jacksonhe.notion.site
            </a>
          </p>
        </div>
        <div className="text-right col-span-2">
          <p>
            <strong>目标岗位：</strong>前端开发工程师（实习）
          </p>
          <p>
            <strong>可实习时间：</strong>6个月及以上
          </p>
          <p>
            <strong>到岗时间：</strong>大陆境内立即到岗
          </p>
        </div>
      </div>
    </div>
  )
}
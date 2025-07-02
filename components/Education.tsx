/**
 * 教育经历组件 - 展示学历信息
 */
export default function Education() {
  return (
    <div className="mb-2">
      <h2 className="text-lg font-bold text-black py-1 mb-2 border-b border-black">
        教育经历
      </h2>
      <div className="mb-3">
        <div className="flex justify-between items-center">
          <h3>
            <b>东南大学（985）</b>
          </h3>
          <p className="text-gray-600 text-sm">2022-09 ~ 2026-06</p>
        </div>
        <p>计算机科学与工程学院 ｜ 人工智能 ｜ 本科</p>
      </div>
    </div>
  )
}
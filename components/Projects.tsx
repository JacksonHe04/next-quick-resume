/**
 * 项目经历组件 - 展示项目列表和详细信息
 */
export default function Projects() {
  return (
    <div className="mb-2">
      <h2 className="text-lg font-bold text-black py-1 mb-2 border-b border-black">
        项目经历
      </h2>

      {/* Flow Flat 项目 */}
      <div className="mb-3">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-base">Flow Flat 集成开发平台</h3>
        </div>
        <div className="flex justify-between mb-1.5 text-sm">
          <a
            href="https://github.com/JacksonHe04/flow-flat"
            target="_blank"
            className="text-black no-underline"
          >
            https://github.com/JacksonHe04/flow-flat
          </a>
          <a
            href="https://flow-flat.vercel.app"
            target="_blank"
            className="text-black no-underline"
          >
            https://flow-flat.vercel.app
          </a>
        </div>
        <div className="my-1.5 text-gray-600 text-sm">
          <p className="text-black mt-1 text-sm">
            技术栈：React + Vite + TypeScript + Zustand
          </p>
        </div>
        <ul className="list-disc list-inside pl-2.5 ml-0 text-sm space-y-1">
          <li>
            整合了节点流程图、富文本编辑器、代码编辑器三大核心功能模块的集成开发平台。
          </li>
          <li>
            使用 Zustand 进行轻量级状态管理，实现跨组件的数据共享和响应式更新。
          </li>
          <li>
            集成 React Flow
            实现可视化节点流程图编辑器，支持拖拽、连线、节点配置等交互功能。
          </li>
          <li>
            内置富文本编辑器，支持 Markdown 语法、实时预览、格式化等功能。
          </li>
          <li>
            集成 Monaco Editor
            代码编辑器，提供语法高亮、代码补全、错误提示等开发体验。
          </li>
        </ul>
      </div>

      {/* Find Yourself 项目 */}
      <div className="mb-3">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-base">Find Yourself 基于 Vue 3 的宇宙 3D 游戏</h3>
        </div>
        <div className="flex justify-between mb-1.5 text-sm">
          <a
            href="https://github.com/JacksonHe04/find-yourself"
            target="_blank"
            className="text-black no-underline"
          >
            https://github.com/JacksonHe04/find-yourself
          </a>
          <a
            href="https://find-yourself.vercel.app"
            target="_blank"
            className="text-black no-underline"
          >
            https://find-yourself.vercel.app
          </a>
        </div>
        <div className="my-1.5 text-gray-600 text-sm">
          <p className="text-black mt-1 text-sm">
            技术栈：Vue 3 + Three.js + TypeScript + Vite
          </p>
        </div>
        <ul className="list-disc list-inside pl-2.5 ml-0 text-sm space-y-1">
          <li>
            使用 Three.js
            创建逼真的宇宙环境，包括星空背景、行星系统、光照效果和粒子系统。
          </li>
          <li>
            实现第一人称视角控制系统，支持鼠标和键盘操作，提供流畅的 3D 空间导航体验。
          </li>
          <li>
            集成物理引擎，实现碰撞检测、重力模拟和物体交互，增强游戏的真实感。
          </li>
          <li>
            优化渲染性能，实现 LOD 技术和视锥体剔除，确保流畅的游戏体验。
          </li>
        </ul>
      </div>

      {/* Mini React 项目 */}
      <div className="mb-3">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-base">Mini React By TypeScript</h3>
        </div>
        <div className="flex justify-between mb-1.5 text-sm">
          <a
            href="https://github.com/JacksonHe04/mini-react-by-ts"
            target="_blank"
            className="text-black no-underline"
          >
            https://github.com/JacksonHe04/mini-react-by-ts
          </a>
          <a
            href="https://mini-react-by-ts.vercel.app"
            target="_blank"
            className="text-black no-underline"
          >
            https://mini-react-by-ts.vercel.app
          </a>
        </div>
        <div className="my-1.5 text-gray-600 text-sm">
          <p className="text-black mt-1 text-sm">
            技术栈：TypeScript + Webpack + Jest
          </p>
        </div>
        <ul className="list-disc list-inside pl-2.5 ml-0 text-sm space-y-1">
          <li>
            使用 TypeScript 从零实现 React
            的核心功能，包括虚拟 DOM、组件系统、状态管理和生命周期。
          </li>
          <li>
            实现 Fiber 架构的简化版本，构建完整的 Diff
            算法，实现高效的虚拟 DOM 比较和更新。
          </li>
          <li>
            实现 Hooks 系统，包括 useState、useEffect、useContext 等常用 Hooks
            的核心逻辑。
          </li>
          <li>设计组件生命周期管理系统，支持组件的挂载、更新和卸载过程。</li>
          <li>
            使用 Jest 编写完整的单元测试，确保各个模块功能的正确性和稳定性。
          </li>
          <li>通过 Webpack 配置构建系统，支持 TypeScript 编译和模块打包。</li>
        </ul>
      </div>
    </div>
  )
}
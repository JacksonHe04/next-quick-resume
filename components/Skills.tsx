/**
 * 专业技能组件 - 展示技术技能列表
 */
export default function Skills() {
  return (
    <div className="mb-2">
      <h2 className="text-lg font-bold text-black py-1 mb-2 border-b border-black">
        专业技能
      </h2>
      <ul className="list-disc list-inside pl-2.5 ml-0 text-sm space-y-1">
        <li>
          熟悉常见的 <b>HTML</b> 及 <b>HTML5</b> 元素，<b>CSS</b> /
          <b>CSS3</b> 的基本语法与布局。
        </li>
        <li>
          熟悉掌握 <b>JavaScript</b> 及 <b>ES6</b> 语法特性，了解
          <b>TypeScript</b>，理解 this
          指向、作用域、闭包原型与对象、原型链、箭头函数、Promise
          等使用，了解常用设计模式。
        </li>
        <li>
          熟悉 <b>React</b> 框架，能够熟练使用
          <b>React</b> 配合主流组件库进行开发。
        </li>
        <li>掌握 <b>Vite</b>、<b>Webpack</b> 等前端工程化工具的使用。</li>
        <li>
          了解 <b>HTTP</b> 协议、<b>TCP</b> / <b>IP</b> 协议、HTTP
          状态等计算机网络知识，理解浏览器原理。
        </li>
      </ul>
    </div>
  )
}
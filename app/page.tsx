import Header from '@/components/Header'
import Education from '@/components/Education'
import Skills from '@/components/Skills'
import Projects from '@/components/Projects'
import About from '@/components/About'

/**
 * 简历主页面组件 - 整合所有简历模块
 */
export default function Home() {
  return (
    <main>
      <Header />
      <Education />
      <Skills />
      <Projects />
      <About />
    </main>
  )
}
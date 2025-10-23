/**
 * 实习经历组件 - 展示实习经历和详细信息
 * 从统一的简历数据源中读取实习经历列表并循环渲染
 */

import { getCurrentResumeData } from "@/config/data";
import { InternItem as InternItemType } from "@/types";
import { SectionContainer, SectionTitle } from "@/components/common";
import {
  TITLE_STYLES,
  TEXT_STYLES,
  CONTAINER_STYLES,
  COMBINED_STYLES,
  LIST_STYLES,
} from "@/constants/styles";
import { markdownToHtml } from "@/utils/markdown";

/**
 * 单个实习经历组件 - 可复用的实习经历展示组件
 * @param intern - 实习经历数据对象
 */
function InternItem({ intern }: { intern: InternItemType }) {
  return (
    <div className={CONTAINER_STYLES.project}>
      <div className={COMBINED_STYLES.projectTitleRow}>
          <div className="flex items-center space-x-1">
            <h3 className={TITLE_STYLES.project}>{intern.company}</h3>
            <span className={TEXT_STYLES.period}>｜{intern.position}</span>
          </div>
          <div className="flex items-center">
            <span className={TEXT_STYLES.period}>{intern.base}</span>
            <span className={TEXT_STYLES.period}>｜{intern.period}</span>
          </div>
        </div>
      {intern.description && (
        <p className={TEXT_STYLES.description}>{intern.description}</p>
      )}
      <ol className={LIST_STYLES.ordered}>
        {intern.responsibilities.map((responsibility, index) => (
          <li key={index} dangerouslySetInnerHTML={{ __html: markdownToHtml(responsibility) }} />
        ))}
      </ol>
    </div>
  );
}

/**
 * 实习经历主组件
 */
export default function Intern() {
  const intern = getCurrentResumeData().intern;

  return (
    <SectionContainer>
      <SectionTitle>{intern.title}</SectionTitle>
      {intern.items
        .filter((item) => item.show)
        .map((internItem, index) => (
          <InternItem key={index} intern={internItem} />
        ))}
    </SectionContainer>
  );
}
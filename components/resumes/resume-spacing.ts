/**
 * SAYLESS 简历渲染间距配置
 *
 * 所有简历排版间距集中在这里，想微调数值直接改下面的数字即可，
 * 单位为 Tailwind 的 spacing scale（1 = 0.25rem = 4px）。
 *
 * 层级关系（自上而下）：
 *
 *   article
 *   └─ section            ← SECTION_GAP：section 与 section 之间
 *      ├─ SectionTitle    ← TITLE_BOTTOM：标题下边框到正文
 *      └─ item            ← ITEM_GAP：同一 section 内条目之间
 *         ├─ itemHeader   ← HEADER_BOTTOM：条目头部（公司/时间行）到正文
 *         ├─ description  ← DESCRIPTION_BOTTOM：描述段到列表
 *         └─ ol/li        ← LIST_GAP：列表项之间
 *
 * 注意：item 末项通过 last:mb-0 归零，section 间距只由 SECTION_GAP 决定，
 * 不要给各 section 末尾单独加 margin，否则间距会因末元素类型不同而不一致。
 */

// 每个 section 底部留白（教育 / 实习 / 项目 / 技能 / 关于 之间）
export const SECTION_GAP_CLASS = "mb-2";

// 同一 section 内，相邻条目之间的距离
export const ITEM_GAP_CLASS = "mb-2";

// Section 标题（h2 + 下边框）与下方内容之间的距离
export const TITLE_BOTTOM_CLASS = "mb-2";

// 条目头部（学校/公司名 + 时间那一行）与下方描述/列表之间
export const ITEM_HEADER_BOTTOM_CLASS = "mb-1";

// 条目内描述段与下方职责/特性列表之间
export const DESCRIPTION_BOTTOM_CLASS = "mb-1";

// 有序列表（职责、特性、技能、关于）相邻项之间
export const LIST_GAP_CLASS = "space-y-0.5";

// —— 顶部个人信息区 ——

// 姓名/职位块 与 联系方式网格之间
export const HEADER_IDENTITY_BOTTOM_CLASS = "mb-2";

// 姓名 与 职位之间
export const HEADER_NAME_TO_POSITION_CLASS = "mt-2";

// 联系方式两列网格：行间距 / 列间距
export const HEADER_CONTACTS_ROW_GAP_CLASS = "gap-y-1";
export const HEADER_CONTACTS_COLUMN_GAP_CLASS = "gap-x-0";

// 左文 与 右照片 两栏之间
export const HEADER_PHOTO_GAP_CLASS = "gap-0";

// 同一学校下多条学历/荣誉行之间
export const EDUCATION_ENTRY_GAP_CLASS = "space-y-1";

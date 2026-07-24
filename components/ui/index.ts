/**
 * UI 组件库统一导出文件
 * 提供一致的导入接口，便于使用和维护
 */

// Button 组件
export { default as Button } from './Button'
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button'

// 未来可以添加更多组件
export { default as Modal } from './Modal'
export { Card } from "./card";
export { DataTable } from "./data-table";
export type { DataTableColumn } from "./data-table";
export { FormDrawer } from "./form-drawer";
export { Input } from "./input";
export type { InputProps } from "./input";
export {
  STATUS_PRESENTATIONS,
  StatusBadge,
} from "./status-badge";
export type {
  KnownStatus,
  StatusTone,
} from "./status-badge";

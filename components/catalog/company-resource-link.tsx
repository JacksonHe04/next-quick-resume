import { ExternalLink } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function CompanyResourceLink({
  companyName,
  href,
  resource,
  children,
  className,
}: {
  companyName: string;
  href: string;
  resource: "careers" | "process";
  children?: ReactNode;
  className?: string;
}) {
  const isCareers = resource === "careers";
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={
        isCareers
          ? `打开 ${companyName} 招聘网站`
          : `查看 ${companyName} 投递进度`
      }
      className={cn(
        "inline-flex items-center gap-1 text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      {children ?? (isCareers ? "招聘网站" : "投递进度")}
      <ExternalLink size={13} />
    </a>
  );
}

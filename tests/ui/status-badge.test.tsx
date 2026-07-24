import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  STATUS_PRESENTATIONS,
  StatusBadge,
} from "@/components/ui/status-badge";

describe("StatusBadge", () => {
  it("renders a semantic Chinese label without exposing the enum code", () => {
    render(<StatusBadge value="pending_result" />);

    expect(screen.getByText("待结果")).toBeVisible();
    expect(screen.queryByText("pending_result")).not.toBeInTheDocument();
  });

  it("keeps shared status labels in one reusable mapping", () => {
    expect(STATUS_PRESENTATIONS).toMatchObject({
      upcoming: { label: "待进行", tone: "neutral" },
      passed: { label: "已通过", tone: "positive" },
      failed: { label: "未通过", tone: "negative" },
    });
  });
});

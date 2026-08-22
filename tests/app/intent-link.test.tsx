import {
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import type { ComponentProps } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({
    prefetch,
    ...props
  }: ComponentProps<"a"> & { prefetch?: boolean | null }) => (
    <a
      {...props}
      data-prefetch={prefetch === null ? "auto" : String(prefetch)}
    />
  ),
}));

import { IntentLink } from "@/components/app/intent-link";

afterEach(cleanup);

describe("IntentLink", () => {
  it("defers route prefetching until the user shows navigation intent", () => {
    render(<IntentLink href="/questions/one">打开详情</IntentLink>);

    const link = screen.getByRole("link", { name: "打开详情" });
    expect(link).toHaveAttribute("data-prefetch", "false");

    fireEvent.mouseEnter(link);

    expect(link).toHaveAttribute("data-prefetch", "auto");
  });

  it("also enables prefetching for keyboard users", () => {
    render(<IntentLink href="/questions/one">打开详情</IntentLink>);

    const link = screen.getByRole("link", { name: "打开详情" });
    fireEvent.focus(link);

    expect(link).toHaveAttribute("data-prefetch", "auto");
  });
});

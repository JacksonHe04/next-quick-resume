import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  DataTable,
  type DataTableColumn,
} from "@/components/ui/data-table";

type Row = {
  id: string;
  name: string;
  status: string;
};

const rows: Row[] = [
  { id: "row-a", name: "第一条记录", status: "进行中" },
];

describe("unified data workspace", () => {
  it("opens every module in table view and persists a grid choice", async () => {
    const user = userEvent.setup();
    const columns: DataTableColumn<Row>[] = [
      {
        key: "name",
        header: "名称",
        render: (row) => row.name,
      },
    ];

    const { unmount } = render(
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        viewStorageKey="test-records"
        gridCard={(row) => <article>{row.name}</article>}
      />,
    );

    expect(screen.getByRole("table")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "卡片视图" }));
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.getByRole("article")).toHaveTextContent("第一条记录");
    expect(localStorage.getItem("sayless:view:test-records")).toBe("grid");

    unmount();
    render(
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        viewStorageKey="test-records"
        gridCard={(row) => <article>{row.name}</article>}
      />,
    );
    expect(screen.getByRole("article")).toBeVisible();
  });

  it("edits a writable cell in place and saves with Enter", async () => {
    const user = userEvent.setup();
    const save = vi.fn().mockResolvedValue(undefined);
    const columns: DataTableColumn<Row>[] = [
      {
        key: "name",
        header: "名称",
        render: (row) => row.name,
        editable: {
          label: "名称",
          value: (row) => row.name,
          onSave: (row, value) => save(row.id, value),
        },
      },
      {
        key: "status",
        header: "状态",
        render: (row) => row.status,
      },
    ];

    render(
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "编辑名称：第一条记录" }),
    );
    const input = screen.getByRole("textbox", { name: "名称" });
    await user.clear(input);
    await user.type(input, "修改后的记录{Enter}");

    expect(save).toHaveBeenCalledWith("row-a", "修改后的记录");
    expect(await screen.findByText("已保存")).toBeVisible();
  });
});

import { expect, test } from "@playwright/test";

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/app",
  "/app/resumes",
  "/app/submissions",
  "/app/interviews",
  "/app/questions",
  "/app/companies",
  "/app/batches",
  "/app/settings",
];

test("keeps text readable on every visible dark button", async ({
  page,
}) => {
  const failures: Array<{
    route: string;
    text: string;
    contrast: number;
  }> = [];

  for (const route of PUBLIC_ROUTES) {
    await page.goto(route);
    const routeFailures = await page
      .locator('[data-slot="button"]:visible')
      .evaluateAll((buttons) => {
        const canvas = document.createElement("canvas");
        canvas.width = 1;
        canvas.height = 1;
        const context = canvas.getContext("2d", {
          willReadFrequently: true,
        })!;

        function toRgba(color: string) {
          context.clearRect(0, 0, 1, 1);
          context.fillStyle = color;
          context.fillRect(0, 0, 1, 1);
          return Array.from(
            context.getImageData(0, 0, 1, 1).data,
          ) as [number, number, number, number];
        }

        function channel(value: number) {
          const normalized = value / 255;
          return normalized <= 0.04045
            ? normalized / 12.92
            : ((normalized + 0.055) / 1.055) ** 2.4;
        }

        function luminance([red, green, blue]: number[]) {
          return (
            0.2126 * channel(red) +
            0.7152 * channel(green) +
            0.0722 * channel(blue)
          );
        }

        return buttons.flatMap((button) => {
          const style = getComputedStyle(button);
          const background = toRgba(style.backgroundColor);
          if (background[3] < 250) return [];
          const backgroundLuminance = luminance(background);
          if (backgroundLuminance > 0.2) return [];
          const foregroundLuminance = luminance(toRgba(style.color));
          const contrast =
            (Math.max(backgroundLuminance, foregroundLuminance) + 0.05) /
            (Math.min(backgroundLuminance, foregroundLuminance) + 0.05);

          return contrast < 4.5
            ? [
                {
                  text: (button.textContent ?? "")
                    .trim()
                    .replace(/\s+/gu, " "),
                  contrast: Number(contrast.toFixed(2)),
                },
              ]
            : [];
        });
      });

    failures.push(
      ...routeFailures.map((failure) => ({ route, ...failure })),
    );
  }

  expect(failures).toEqual([]);
});

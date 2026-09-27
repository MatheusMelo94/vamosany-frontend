import type { Page } from "@playwright/test";

export type PixelDiff = {
  /** Pixels whose RGBA differs by more than `threshold` on any channel. */
  count: number;
  /** Bounding box of the differing pixels, or null when there are none. */
  box: { x0: number; y0: number; x1: number; y1: number } | null;
  sameSize: boolean;
};

/**
 * Compares two PNG screenshots pixel by pixel in the page's own canvas, so
 * no image library is needed. The same oracle as toHaveScreenshot() with a
 * pixel budget, for two captures taken within one test.
 */
export function diffPixels(
  page: Page,
  a: Buffer,
  b: Buffer,
  threshold = 0,
): Promise<PixelDiff> {
  return page.evaluate(
    async ({ a, b, threshold }) => {
      const decode = async (b64: string) => {
        const img = new Image();
        img.src = `data:image/png;base64,${b64}`;
        await img.decode();
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("no 2d context");
        ctx.drawImage(img, 0, 0);
        return ctx.getImageData(0, 0, canvas.width, canvas.height);
      };
      const [pa, pb] = await Promise.all([decode(a), decode(b)]);
      if (pa.width !== pb.width || pa.height !== pb.height)
        return { count: -1, box: null, sameSize: false };
      let count = 0;
      let box: { x0: number; y0: number; x1: number; y1: number } | null = null;
      for (let i = 0; i < pa.data.length; i += 4) {
        let differs = false;
        for (let c = 0; c < 4; c++)
          if (Math.abs(pa.data[i + c] - pb.data[i + c]) > threshold)
            differs = true;
        if (!differs) continue;
        count += 1;
        const x = (i / 4) % pa.width;
        const y = Math.floor(i / 4 / pa.width);
        box = box
          ? {
              x0: Math.min(box.x0, x),
              y0: Math.min(box.y0, y),
              x1: Math.max(box.x1, x),
              y1: Math.max(box.y1, y),
            }
          : { x0: x, y0: y, x1: x, y1: y };
      }
      return { count, box, sameSize: true };
    },
    { a: a.toString("base64"), b: b.toString("base64"), threshold },
  );
}

import { useCallback } from 'react';
import p5 from 'p5';
import { P5Wrapper } from './P5Wrapper';

interface ComparisonData {
  title: string;
  values: Record<string, number>;
}

interface Props {
  poem1: ComparisonData;
  poem2: ComparisonData;
  labels: Record<string, string>;
  accentColor1?: string;
  accentColor2?: string;
}

/**
 * Artistic dual-poem comparison visualization.
 * Two mirrored landscapes — one per poem — sharing a horizon line.
 * Variables create terrain peaks. Where poems differ → mountains diverge.
 * Where they agree → terrain aligns. Goethe-inspired colors.
 */
export const ComparisonDual = ({ poem1, poem2, labels, accentColor1 = '#9e2a2b', accentColor2 = '#1e3a5f' }: Props) => {
  const sketch = useCallback((p: p5, container: HTMLDivElement) => {
    const W = container.clientWidth;
    const H = 400;
    const midY = H / 2;

    // Merge all keys
    const allKeys = [...new Set([...Object.keys(poem1.values), ...Object.keys(poem2.values)])];
    const maxVal = Math.max(
      ...Object.values(poem1.values),
      ...Object.values(poem2.values),
      1
    );

    let mouseX: number | null = null;

    p.setup = () => {
      const c = p.createCanvas(W, H);
      p.frameRate(24);
      c.elt.addEventListener('mousemove', (e: MouseEvent) => { mouseX = e.offsetX; });
      c.elt.addEventListener('mouseleave', () => { mouseX = null; });
      c.elt.addEventListener('touchmove', (e: TouchEvent) => {
        e.preventDefault();
        mouseX = e.touches[0].clientX - c.elt.getBoundingClientRect().left;
      }, { passive: false });
      c.elt.addEventListener('touchend', () => { mouseX = null; });
    };

    p.draw = () => {
      const t = p.frameCount * 0.008;
      p.background(14, 12, 9);

      const segW = W / Math.max(allKeys.length, 1);
      const col1 = p.color(accentColor1);
      const col2 = p.color(accentColor2);

      // Draw poem 1 — terrain going UP from horizon
      drawTerrain(p, allKeys, poem1.values, maxVal, midY, -1, col1, segW, W, t, 0.7);

      // Draw poem 2 — terrain going DOWN from horizon (mirrored)
      drawTerrain(p, allKeys, poem2.values, maxVal, midY, 1, col2, segW, W, t + 2, 0.7);

      // Horizon line
      p.stroke(200, 168, 75, 40);
      p.strokeWeight(0.5);
      p.line(0, midY, W, midY);

      // Variable labels along bottom of terrain
      p.textFont('DM Sans');
      p.textSize(8);
      p.textAlign(p.CENTER);
      p.noStroke();
      allKeys.forEach((key, i) => {
        const x = segW * i + segW / 2;
        const label = labels[key] || key;

        // Tick mark
        p.stroke(200, 168, 75, 30);
        p.strokeWeight(0.5);
        p.line(x, midY - 3, x, midY + 3);
        p.noStroke();

        // Label
        p.fill(122, 110, 88, 150);
        p.push();
        p.translate(x, midY);
        p.rotate(-p.HALF_PI);
        p.text(label, 0, -8);
        p.pop();
      });

      // Poem titles
      p.textAlign(p.LEFT);
      p.textSize(10);
      p.textStyle(p.BOLD);
      p.fill(p.red(col1), p.green(col1), p.blue(col1), 200);
      p.text(`▲ ${poem1.title}`, 10, 18);
      p.fill(p.red(col2), p.green(col2), p.blue(col2), 200);
      p.text(`▼ ${poem2.title}`, 10, H - 10);
      p.textStyle(p.NORMAL);

      // Interactive cursor
      if (mouseX !== null) {
        const keyIdx = Math.floor(mouseX / segW);
        if (keyIdx >= 0 && keyIdx < allKeys.length) {
          const key = allKeys[keyIdx];
          const v1 = poem1.values[key] || 0;
          const v2 = poem2.values[key] || 0;
          const label = labels[key] || key;

          // Cursor line
          p.stroke(200, 168, 75, 40);
          p.strokeWeight(1);
          (p.drawingContext as CanvasRenderingContext2D).setLineDash([3, 3]);
          p.line(mouseX, 0, mouseX, H);
          (p.drawingContext as CanvasRenderingContext2D).setLineDash([]);

          // Info box
          const boxX = mouseX > W / 2 ? mouseX - 100 : mouseX + 10;
          p.noStroke();
          p.fill(22, 20, 16, 220);
          p.rect(boxX, midY - 35, 90, 70, 3);

          p.fill(200, 168, 75);
          p.textSize(9);
          p.textStyle(p.BOLD);
          p.text(label, boxX + 8, midY - 18);
          p.textStyle(p.NORMAL);

          p.fill(p.red(col1), p.green(col1), p.blue(col1));
          p.text(`▲ ${v1}`, boxX + 8, midY);

          p.fill(p.red(col2), p.green(col2), p.blue(col2));
          p.text(`▼ ${v2}`, boxX + 8, midY + 16);

          const diff = v1 - v2;
          p.fill(diff > 0 ? p.color(accentColor1) : diff < 0 ? p.color(accentColor2) : p.color(122, 110, 88));
          p.textSize(8);
          p.text(`Δ ${diff > 0 ? '+' : ''}${diff}`, boxX + 8, midY + 30);
        }
      }

      // Attribution
      p.textAlign(p.RIGHT);
      p.fill(122, 110, 88, 80);
      p.textSize(7);
      p.textStyle(p.ITALIC);
      p.text('porównanie krajobrazów poetyckich', W - 10, H - 10);
      p.textStyle(p.NORMAL);
      p.textAlign(p.LEFT);
    };
  }, [poem1, poem2, labels, accentColor1, accentColor2]);

  return <P5Wrapper sketch={sketch} className="w-full rounded-lg overflow-hidden" />;
};

function drawTerrain(
  p: p5,
  keys: string[],
  values: Record<string, number>,
  maxVal: number,
  midY: number,
  direction: number, // -1 = up, 1 = down
  col: p5.Color,
  segW: number,
  W: number,
  t: number,
  alpha: number
) {
  const r = p.red(col), g = p.green(col), b = p.blue(col);
  const maxH = midY * 0.8;

  // Generate smooth terrain points
  const points: number[] = [];
  for (let x = 0; x <= W; x++) {
    const keyIdx = Math.min(Math.floor(x / segW), keys.length - 1);
    const nextIdx = Math.min(keyIdx + 1, keys.length - 1);
    const localT = (x % segW) / segW; // 0-1 within segment

    const v1 = (values[keys[keyIdx]] || 0) / maxVal;
    const v2 = (values[keys[nextIdx]] || 0) / maxVal;
    const interpolated = v1 + (v2 - v1) * localT;

    const noise = (p.noise(x * 0.01, t) - 0.5) * 15;
    const height = interpolated * maxH + noise;
    points.push(midY + direction * height);
  }

  // Filled area with gradient
  for (let layer = 0; layer < 5; layer++) {
    const layerAlpha = alpha * (25 - layer * 4);
    p.fill(r, g, b, layerAlpha);
    p.noStroke();
    p.beginShape();
    p.vertex(0, midY);
    for (let x = 0; x <= W; x++) {
      const offset = layer * direction * 3;
      p.vertex(x, points[x] + offset);
    }
    p.vertex(W, midY);
    p.endShape(p.CLOSE);
  }

  // Edge line
  p.noFill();
  p.stroke(r, g, b, 180);
  p.strokeWeight(1);
  p.beginShape();
  for (let x = 0; x <= W; x++) {
    p.vertex(x, points[x]);
  }
  p.endShape();
}

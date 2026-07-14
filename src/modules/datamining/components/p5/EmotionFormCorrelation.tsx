import { useCallback } from 'react';
import p5 from 'p5';
import { P5Wrapper } from './P5Wrapper';

interface Props {
  poems: {
    title: string;
    wordCount: number;
    emotion?: { primary: string; intensity: number };
  }[];
}

const GOETHE: Record<string, string> = {
  gniew:       '#cc3333',
  smutek:      '#2255aa',
  rezygnacja:  '#228877',
  ironia:      '#aa3377',
  czułość:     '#ddaa33',
  rozpacz:     '#6644aa',
  melancholia: '#3366aa',
  tęsknota:    '#4477bb',
  obrzydzenie: '#886633',
  bunt:        '#dd7722',
  strach:      '#443366',
  euforia:     '#ddaa33',
  radość:      '#ddaa33',
  lęk:         '#443366',
  pożądanie:   '#cc3366',
};
const DEFAULT_COLOR = '#7a6e58';

export const EmotionFormCorrelation = ({ poems }: Props) => {
  const sketch = useCallback((p: p5, container: HTMLDivElement) => {
    const W = Math.min(container.clientWidth, 600);
    const H = 350;
    const MARGIN = { top: 20, right: 20, bottom: 35, left: 40 };
    const plotW = W - MARGIN.left - MARGIN.right;
    const plotH = H - MARGIN.top - MARGIN.bottom;

    // Filter poems with emotion and wordCount > 0
    const valid = poems.filter(pm => pm.emotion && pm.wordCount > 0);
    const maxWC = Math.max(...valid.map(pm => pm.wordCount), 1);

    let mouseX: number | null = null;
    let mouseY: number | null = null;

    p.setup = () => {
      const c = p.createCanvas(W, H);
      p.textFont('DM Sans');
      p.noLoop();
      c.elt.addEventListener('mousemove', (e: MouseEvent) => {
        mouseX = e.offsetX;
        mouseY = e.offsetY;
        p.redraw();
      });
      c.elt.addEventListener('mouseleave', () => {
        mouseX = null;
        mouseY = null;
        p.redraw();
      });
    };

    p.draw = () => {
      p.background(255);

      // Axes
      p.stroke(220);
      p.strokeWeight(0.5);
      // X axis
      p.line(MARGIN.left, H - MARGIN.bottom, W - MARGIN.right, H - MARGIN.bottom);
      // Y axis
      p.line(MARGIN.left, MARGIN.top, MARGIN.left, H - MARGIN.bottom);

      // Grid lines
      for (let i = 0; i <= 4; i++) {
        const y = MARGIN.top + (plotH / 4) * i;
        p.stroke(245);
        p.strokeWeight(0.5);
        p.line(MARGIN.left, y, W - MARGIN.right, y);
      }

      // Axis labels
      p.noStroke();
      p.fill(160);
      p.textSize(7);
      p.textAlign(p.CENTER, p.TOP);
      // X axis ticks
      const xTicks = [0, Math.round(maxWC / 4), Math.round(maxWC / 2), Math.round(maxWC * 3 / 4), maxWC];
      xTicks.forEach(v => {
        const x = MARGIN.left + (v / maxWC) * plotW;
        p.text(String(v), x, H - MARGIN.bottom + 4);
      });

      // Y axis ticks
      p.textAlign(p.RIGHT, p.CENTER);
      [0, 0.25, 0.5, 0.75, 1].forEach(v => {
        const y = H - MARGIN.bottom - v * plotH;
        p.text((v * 100).toFixed(0) + '%', MARGIN.left - 4, y);
      });

      // Axis titles
      p.textSize(8);
      p.fill(140);
      p.textAlign(p.CENTER, p.TOP);
      p.text('słów', W / 2, H - 10);
      p.push();
      p.translate(10, H / 2);
      p.rotate(-Math.PI / 2);
      p.textAlign(p.CENTER, p.BOTTOM);
      p.text('intensywność', 0, 0);
      p.pop();

      // Draw dots
      let hoveredIdx = -1;
      let minDist = 15; // hover threshold in px

      const dotPositions: { x: number; y: number }[] = [];

      valid.forEach((pm, i) => {
        const x = MARGIN.left + (pm.wordCount / maxWC) * plotW;
        const y = H - MARGIN.bottom - (pm.emotion!.intensity) * plotH;
        dotPositions.push({ x, y });

        const col = p.color(GOETHE[pm.emotion!.primary] || DEFAULT_COLOR);
        const r = p.red(col), g = p.green(col), b = p.blue(col);

        p.noStroke();
        p.fill(r, g, b, 160);
        const size = p.map(pm.emotion!.intensity, 0, 1, 4, 8);
        p.ellipse(x, y, size, size);

        // Distance check for hover
        if (mouseX !== null && mouseY !== null) {
          const d = Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2);
          if (d < minDist) {
            minDist = d;
            hoveredIdx = i;
          }
        }
      });

      // Hover tooltip
      if (hoveredIdx >= 0) {
        const pm = valid[hoveredIdx];
        const pos = dotPositions[hoveredIdx];

        // Highlight dot
        const col = p.color(GOETHE[pm.emotion!.primary] || DEFAULT_COLOR);
        p.noFill();
        p.stroke(p.red(col), p.green(col), p.blue(col), 200);
        p.strokeWeight(1.5);
        p.ellipse(pos.x, pos.y, 14, 14);

        // Tooltip text
        p.noStroke();
        p.fill(120);
        p.textSize(8);
        p.textAlign(p.LEFT, p.BOTTOM);

        const tx = pos.x + 10 > W - 130 ? pos.x - 130 : pos.x + 10;
        const ty = pos.y - 8 < 20 ? pos.y + 20 : pos.y - 4;

        p.text(pm.title, tx, ty);
        p.textSize(7);
        p.fill(150);
        p.text(`${pm.wordCount} słów · ${pm.emotion!.primary} (${Math.round(pm.emotion!.intensity * 100)}%)`, tx, ty + 11);
      }
    };
  }, [poems]);

  return <P5Wrapper sketch={sketch} className="w-full rounded-lg overflow-hidden" />;
};

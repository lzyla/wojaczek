import { useCallback } from 'react';
import p5 from 'p5';
import { P5Wrapper } from './P5Wrapper';

interface Props {
  poems: {
    primary: string;
    secondary?: string;
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

export const EmotionCorrelation = ({ poems }: Props) => {
  const sketch = useCallback((p: p5, container: HTMLDivElement) => {
    const SIZE = 350;
    const W = Math.min(container.clientWidth, SIZE);
    const H = W; // square

    // Collect all emotions that appear
    const emotionSet = new Set<string>();
    poems.forEach(pm => {
      if (pm.primary) emotionSet.add(pm.primary);
      if (pm.secondary) emotionSet.add(pm.secondary);
    });
    const emotions = Array.from(emotionSet).sort();
    const N = emotions.length;

    // Build co-occurrence matrix
    const matrix: number[][] = Array.from({ length: N }, () => Array(N).fill(0));
    let maxVal = 0;

    poems.forEach(pm => {
      const pi = emotions.indexOf(pm.primary);
      if (pi >= 0) {
        matrix[pi][pi]++; // diagonal: primary count
      }
      if (pm.secondary) {
        const si = emotions.indexOf(pm.secondary);
        if (pi >= 0 && si >= 0) {
          matrix[pi][si]++;
          matrix[si][pi]++; // symmetric
        }
      }
    });

    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        if (matrix[i][j] > maxVal) maxVal = matrix[i][j];
      }
    }

    // Layout
    const MARGIN_LEFT = 75;
    const MARGIN_TOP = 75;
    const gridW = W - MARGIN_LEFT - 10;
    const gridH = H - MARGIN_TOP - 10;
    const cellW = gridW / N;
    const cellH = gridH / N;

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

      // Hovered cell
      let hovRow = -1, hovCol = -1;
      if (mouseX !== null && mouseY !== null) {
        hovCol = Math.floor((mouseX - MARGIN_LEFT) / cellW);
        hovRow = Math.floor((mouseY - MARGIN_TOP) / cellH);
        if (hovCol < 0 || hovCol >= N) hovCol = -1;
        if (hovRow < 0 || hovRow >= N) hovRow = -1;
      }

      // Draw cells
      for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
          const x = MARGIN_LEFT + c * cellW;
          const y = MARGIN_TOP + r * cellH;
          const val = matrix[r][c];

          if (val > 0) {
            const rowColor = p.color(GOETHE[emotions[r]] || DEFAULT_COLOR);
            const alpha = (val / Math.max(maxVal, 1)) * 220 + 20;
            p.noStroke();
            p.fill(p.red(rowColor), p.green(rowColor), p.blue(rowColor), alpha);
            p.rect(x + 0.5, y + 0.5, cellW - 1, cellH - 1);
          } else {
            p.noStroke();
            p.fill(250);
            p.rect(x + 0.5, y + 0.5, cellW - 1, cellH - 1);
          }

          // Grid lines
          p.stroke(240);
          p.strokeWeight(0.5);
          p.noFill();
          p.rect(x, y, cellW, cellH);
        }
      }

      // Row labels (left)
      p.noStroke();
      p.fill(120);
      p.textSize(8);
      p.textAlign(p.RIGHT, p.CENTER);
      for (let r = 0; r < N; r++) {
        const y = MARGIN_TOP + r * cellH + cellH / 2;
        p.text(emotions[r], MARGIN_LEFT - 4, y);
      }

      // Column labels (top, rotated)
      p.textAlign(p.LEFT, p.CENTER);
      for (let c = 0; c < N; c++) {
        const x = MARGIN_LEFT + c * cellW + cellW / 2;
        p.push();
        p.translate(x, MARGIN_TOP - 4);
        p.rotate(-Math.PI / 3);
        p.fill(120);
        p.textSize(8);
        p.text(emotions[c], 0, 0);
        p.pop();
      }

      // Hover tooltip
      if (hovRow >= 0 && hovCol >= 0) {
        const val = matrix[hovRow][hovCol];
        const x = MARGIN_LEFT + hovCol * cellW;
        const y = MARGIN_TOP + hovRow * cellH;

        // Highlight cell
        p.noFill();
        p.stroke(60);
        p.strokeWeight(1.5);
        p.rect(x, y, cellW, cellH);

        // Count label
        p.noStroke();
        p.fill(120);
        p.textSize(8);
        p.textAlign(p.LEFT, p.TOP);
        const label = `${emotions[hovRow]} + ${emotions[hovCol]}: ${val}`;
        const tx = mouseX! + 10 > W - 100 ? mouseX! - 100 : mouseX! + 10;
        const ty = mouseY! + 10 > H - 20 ? mouseY! - 20 : mouseY! + 10;
        p.text(label, tx, ty);
      }
    };
  }, [poems]);

  return <P5Wrapper sketch={sketch} className="w-full rounded-lg overflow-hidden" />;
};

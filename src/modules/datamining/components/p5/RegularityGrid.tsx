import { useCallback } from 'react';
import p5 from 'p5';
import { P5Wrapper } from './P5Wrapper';

interface Props {
  data: { type: string; regularityScore: number };
}

export const RegularityGrid = ({ data }: Props) => {
  const sketch = useCallback((p: p5, container: HTMLDivElement) => {
    const W = container.clientWidth;
    const H = 320;
    const score = Math.max(0, Math.min(1, data.regularityScore));
    const chaos = 1 - score; // 0 = perfect grid, 1 = max chaos

    const GRID = 8;

    interface Cell {
      homeX: number;
      homeY: number;
      offsetX: number;
      offsetY: number;
      sizeVar: number;
      phase: number;
    }

    const cells: Cell[] = [];

    p.setup = () => {
      p.createCanvas(W, H);
      p.frameRate(20);

      const cellW = (W - 60) / GRID;
      const cellH = (H - 60) / GRID;
      const marginX = 30;
      const marginY = 30;

      for (let row = 0; row < GRID; row++) {
        for (let col = 0; col < GRID; col++) {
          cells.push({
            homeX: marginX + col * cellW + cellW / 2,
            homeY: marginY + row * cellH + cellH / 2,
            offsetX: p.random(-1, 1) * chaos * cellW * 0.4,
            offsetY: p.random(-1, 1) * chaos * cellH * 0.4,
            sizeVar: 1 + (p.random(-0.4, 0.4) * chaos),
            phase: p.random(p.TWO_PI),
          });
        }
      }
    };

    p.draw = () => {
      p.background(255);
      const t = p.frameCount * 0.015;

      const cellW = (W - 60) / GRID;
      const cellH = (H - 60) / GRID;
      const baseSize = Math.min(cellW, cellH) * 0.7;

      for (const c of cells) {
        const breathe = p.sin(t + c.phase) * chaos * 2;
        const x = c.homeX + c.offsetX + breathe;
        const y = c.homeY + c.offsetY + p.cos(t * 0.7 + c.phase) * chaos * 1.5;
        const sz = baseSize * c.sizeVar;

        const isDisplaced = Math.abs(c.offsetX) + Math.abs(c.offsetY) > cellW * 0.15;

        p.rectMode(p.CENTER);
        if (isDisplaced) {
          p.stroke(194, 48, 48, 60);
          p.fill(194, 48, 48, 8);
        } else {
          p.stroke(160, 50);
          p.fill(160, 5);
        }
        p.strokeWeight(0.6);
        p.rect(x, y, sz, sz);
      }
    };
  }, [data]);

  return <P5Wrapper sketch={sketch} className="w-full" />;
};

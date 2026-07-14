import { useCallback } from 'react';
import p5 from 'p5';
import { P5Wrapper } from './P5Wrapper';

interface Props {
  data: { type: string; openClosedRatio: number };
}

export const SpaceEnclosure = ({ data }: Props) => {
  const sketch = useCallback((p: p5, container: HTMLDivElement) => {
    const W = container.clientWidth;
    const H = 350;
    const cx = W / 2;
    const cy = H / 2;
    // 0 = fully closed, 1 = fully open
    const ratio = Math.max(0, Math.min(1, data.openClosedRatio));

    p.setup = () => {
      p.createCanvas(W, H);
      p.frameRate(20);
    };

    p.draw = () => {
      p.background(255);
      const t = p.frameCount * 0.015;

      // Wall inset from edges — closed = walls close in, open = walls far
      const maxInset = Math.min(W, H) * 0.38;
      const inset = maxInset * (1 - ratio); // closed = big inset, open = no inset

      // Breathing contraction for closed spaces
      const breathe = ratio < 0.5
        ? p.sin(t * 1.5) * (8 * (1 - ratio))
        : 0;

      const wallL = inset + breathe;
      const wallR = W - inset - breathe;
      const wallT = inset + breathe;
      const wallB = H - inset - breathe;

      if (ratio < 0.7) {
        // Draw enclosing walls
        p.stroke(51, 100 - ratio * 100);
        p.strokeWeight(1 + (1 - ratio) * 2);
        p.noFill();

        // Walls with slight noise texture
        // Top wall
        p.beginShape();
        for (let x = wallL; x <= wallR; x += 3) {
          p.vertex(x, wallT + p.noise(x * 0.02, t) * 3);
        }
        p.endShape();

        // Bottom wall
        p.beginShape();
        for (let x = wallL; x <= wallR; x += 3) {
          p.vertex(x, wallB + p.noise(x * 0.02, t + 50) * 3);
        }
        p.endShape();

        // Left wall
        p.beginShape();
        for (let y = wallT; y <= wallB; y += 3) {
          p.vertex(wallL + p.noise(y * 0.02, t + 100) * 3, y);
        }
        p.endShape();

        // Right wall
        p.beginShape();
        for (let y = wallT; y <= wallB; y += 3) {
          p.vertex(wallR + p.noise(y * 0.02, t + 150) * 3, y);
        }
        p.endShape();

        // Shadow lines inside walls for depth
        p.stroke(180, 30);
        p.strokeWeight(0.5);
        for (let i = 1; i <= 3; i++) {
          const off = i * 4;
          p.line(wallL + off, wallT + off, wallR - off, wallT + off); // top shadow
          p.line(wallL + off, wallB - off, wallR - off, wallB - off); // bottom shadow
          p.line(wallL + off, wallT + off, wallL + off, wallB - off); // left shadow
          p.line(wallR - off, wallT + off, wallR - off, wallB - off); // right shadow
        }
      }

      // Central mark — always present
      p.noStroke();
      if (ratio > 0.5) {
        // Open space: tiny mark in vast whiteness
        const markSize = p.map(ratio, 0.5, 1, 4, 2);
        p.fill(194, 48, 48, 80);
        p.ellipse(cx, cy, markSize);

        // Faint radiating lines showing openness
        p.stroke(220);
        p.strokeWeight(0.3);
        for (let a = 0; a < p.TWO_PI; a += p.PI / 6) {
          const len = 30 + ratio * 80;
          p.line(
            cx + p.cos(a) * 8,
            cy + p.sin(a) * 8,
            cx + p.cos(a) * len,
            cy + p.sin(a) * len,
          );
        }
      } else {
        // Closed space: larger trapped mark
        const markSize = p.map(ratio, 0, 0.5, 8, 4);
        p.fill(194, 48, 48, 100 + (1 - ratio) * 60);
        p.ellipse(cx, cy, markSize + p.sin(t * 2) * 1.5);
      }
    };
  }, [data.type, data.openClosedRatio]);

  return <P5Wrapper sketch={sketch} className="w-full" />;
};

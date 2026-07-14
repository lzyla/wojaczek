import { useCallback } from 'react';
import p5 from 'p5';
import { P5Wrapper } from './P5Wrapper';

interface Props {
  data: { count: number; percent: number; positions: number[] };
}

export const EnjambementFlow = ({ data }: Props) => {
  const sketch = useCallback((p: p5, container: HTMLDivElement) => {
    const W = container.clientWidth;
    const H = 350;
    const positions = data.positions;
    const maxPos = positions.length > 0 ? Math.max(...positions) + 2 : 10;
    const lineSpacing = (W - 60) / maxPos;

    p.setup = () => {
      p.createCanvas(W, H);
      p.frameRate(20);
    };

    p.draw = () => {
      p.background(255);
      const t = p.frameCount * 0.012;

      // Draw verse boundary lines
      for (let i = 0; i <= maxPos; i++) {
        const x = 30 + i * lineSpacing;
        p.stroke(220);
        p.strokeWeight(0.5);
        p.line(x, 30, x, H - 30);
      }

      // Draw flowing curves breaking through boundaries at enjambement positions
      p.noFill();
      for (let ei = 0; ei < positions.length; ei++) {
        const pos = positions[ei];
        const x1 = 30 + pos * lineSpacing;
        const x2 = 30 + (pos + 1) * lineSpacing;
        const midX = (x1 + x2) / 2;

        // Vertical position varies per enjambement
        const baseY = 60 + ((ei * 37) % (H - 120));
        const flowY = baseY + p.sin(t + ei * 1.5) * 8;

        // The overflow curve — like water crossing a dam
        p.stroke(194, 48, 48, 60 + ei * 5);
        p.strokeWeight(1.2);
        p.beginShape();
        const steps = 30;
        for (let s = 0; s <= steps; s++) {
          const frac = s / steps;
          const sx = p.lerp(x1 - lineSpacing * 0.4, x2 + lineSpacing * 0.4, frac);
          // Curve rises before boundary, spills over
          const curve = p.sin(frac * p.PI) * 25;
          const noise = p.noise(frac * 3 + ei, t) * 8;
          const sy = flowY - curve + noise;
          (p as any).curveVertex(sx, sy);
        }
        p.endShape();

        // Small splash dots on the other side
        for (let d = 0; d < 3; d++) {
          const dx = x2 + p.random(5, lineSpacing * 0.3);
          const dy = flowY + p.random(-10, 10);
          p.noStroke();
          p.fill(194, 48, 48, 30);
          p.ellipse(dx, dy, 2);
        }
      }

      // If no positions, show calm water
      if (positions.length === 0) {
        p.noFill();
        p.stroke(200);
        p.strokeWeight(0.5);
        for (let y = 80; y < H - 60; y += 40) {
          p.beginShape();
          for (let x = 30; x < W - 30; x += 5) {
            p.vertex(x, y + p.sin(x * 0.02 + t) * 2);
          }
          p.endShape();
        }
      }
    };
  }, [data.count, data.percent, data.positions]);

  return <P5Wrapper sketch={sketch} className="w-full" />;
};

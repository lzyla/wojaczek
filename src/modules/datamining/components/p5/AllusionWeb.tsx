import { useCallback } from 'react';
import p5 from 'p5';
import { P5Wrapper } from './P5Wrapper';

interface Props {
  data: { source: string; reference: string; evidence: string }[];
}

export const AllusionWeb = ({ data }: Props) => {
  const sketch = useCallback((p: p5, container: HTMLDivElement) => {
    const W = container.clientWidth;
    const H = 320;
    const cx = W / 2;
    const cy = H / 2;
    const R = Math.min(W, H) * 0.35;

    // Group by source
    const sourceMap = new Map<string, number>();
    for (const a of data) {
      sourceMap.set(a.source, (sourceMap.get(a.source) || 0) + 1);
    }
    const sources = Array.from(sourceMap.entries());
    const maxCount = Math.max(...sources.map(([, c]) => c), 1);

    interface Spoke {
      label: string;
      angle: number;
      strength: number;
    }

    const spokes: Spoke[] = sources.map(([label, count], i) => ({
      label,
      angle: (p.TWO_PI / sources.length) * i - Math.PI / 2,
      strength: count / maxCount,
    }));

    p.setup = () => {
      p.createCanvas(W, H);
      p.frameRate(20);
    };

    p.draw = () => {
      p.background(255);
      const t = p.frameCount * 0.015;

      // Center node
      p.noStroke();
      p.fill(194, 48, 48, 40);
      p.ellipse(cx, cy, 20, 20);
      p.fill(194, 48, 48, 120);
      p.ellipse(cx, cy, 8, 8);

      // Spokes
      for (const s of spokes) {
        const breathe = p.sin(t + s.angle) * 3;
        const endX = cx + p.cos(s.angle) * (R + breathe);
        const endY = cy + p.sin(s.angle) * (R + breathe);
        const thickness = 0.5 + s.strength * 3;

        p.stroke(100, 60 + s.strength * 80);
        p.strokeWeight(thickness);
        p.line(cx, cy, endX, endY);

        // End node
        p.noStroke();
        p.fill(80, 80 + s.strength * 60);
        const nodeR = 4 + s.strength * 6;
        p.ellipse(endX, endY, nodeR, nodeR);

        // Label
        p.textFont('DM Sans');
        p.fill(120);
        p.textSize(8);
        p.textAlign(p.cos(s.angle) > 0 ? p.LEFT : p.RIGHT, p.CENTER);
        const labelX = endX + p.cos(s.angle) * 10;
        const labelY = endY + p.sin(s.angle) * 10;
        p.text(s.label, labelX, labelY);
      }

      // Subtle web rings
      p.noFill();
      p.stroke(230, 60);
      p.strokeWeight(0.3);
      for (let ring = 1; ring <= 3; ring++) {
        const rr = R * (ring / 3);
        p.ellipse(cx, cy, rr * 2, rr * 2);
      }
    };
  }, [data]);

  return <P5Wrapper sketch={sketch} className="w-full" />;
};

import { useCallback } from 'react';
import p5 from 'p5';
import { P5Wrapper } from './P5Wrapper';

interface Props {
  data: Record<string, number>;
}

const ZONE_MAP: Record<string, number> = {
  past: 0,
  present: 1,
  future: 2,
  imperative: 1,
  conditional: 2,
  infinitive: -1, // floating above
};

export const VerbTimeline = ({ data }: Props) => {
  const sketch = useCallback((p: p5, container: HTMLDivElement) => {
    const W = container.clientWidth;
    const H = 350;
    const zoneW = W / 3;
    const timelineY = H * 0.65;

    const entries = Object.entries(data).filter(([, v]) => v > 0);
    const maxCount = Math.max(...entries.map(([, v]) => v), 1);

    interface Mark {
      x: number;
      y: number;
      zone: number;
      isInfinitive: boolean;
      phase: number;
    }

    const marks: Mark[] = [];

    p.setup = () => {
      p.createCanvas(W, H);
      p.frameRate(20);

      for (const [tense, count] of entries) {
        const zone = ZONE_MAP[tense];
        if (zone === undefined) continue;

        const isInf = zone === -1;
        for (let i = 0; i < count; i++) {
          const zoneIdx = isInf ? Math.floor(p.random(3)) : zone;
          marks.push({
            x: zoneIdx * zoneW + p.random(15, zoneW - 15),
            y: isInf ? p.random(25, timelineY - 40) : timelineY + p.random(-60, 60),
            zone: zoneIdx,
            isInfinitive: isInf,
            phase: p.random(p.TWO_PI),
          });
        }
      }
    };

    p.draw = () => {
      p.background(255);
      const t = p.frameCount * 0.02;

      // Zone separators
      p.stroke(230);
      p.strokeWeight(0.5);
      p.line(zoneW, 20, zoneW, H - 20);
      p.line(zoneW * 2, 20, zoneW * 2, H - 20);

      // Timeline axis
      p.stroke(200);
      p.strokeWeight(1);
      p.line(15, timelineY, W - 15, timelineY);

      // Draw marks
      for (const m of marks) {
        if (m.isInfinitive) {
          // Floating dots above timeline
          const floatY = m.y + p.sin(t + m.phase) * 5;
          p.noStroke();
          p.fill(194, 48, 48, 50);
          p.ellipse(m.x, floatY, 4);
        } else {
          // Vertical ticks at timeline
          const gray = m.zone === 0 ? 180 : m.zone === 1 ? 80 : 140;
          p.stroke(gray, 100);
          p.strokeWeight(0.8);
          const tickH = 8 + p.noise(m.x * 0.01, t) * 15;
          p.line(m.x, timelineY - tickH, m.x, timelineY + tickH);
        }
      }

      // Zone gradient overlays
      p.noStroke();
      // Past: cool
      for (let x = 0; x < zoneW; x += 3) {
        p.fill(100, 130, 180, 3);
        p.rect(x, 0, 3, H);
      }
      // Present: warm center
      for (let x = zoneW; x < zoneW * 2; x += 3) {
        p.fill(60, 60, 60, 2);
        p.rect(x, 0, 3, H);
      }
      // Future: uncertain
      for (let x = zoneW * 2; x < W; x += 3) {
        const a = 2 + p.noise(x * 0.01, t * 0.5) * 3;
        p.fill(160, 160, 180, a);
        p.rect(x, 0, 3, H);
      }
    };
  }, [data]);

  return <P5Wrapper sketch={sketch} className="w-full" />;
};

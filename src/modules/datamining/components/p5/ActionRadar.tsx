import { useCallback } from 'react';
import p5 from 'p5';
import { P5Wrapper } from './P5Wrapper';

interface Props {
  data: Record<string, number>;
}

const ACTION_KEYS = ['ruch', 'percepcja', 'stan', 'destrukcja', 'tworzenie', 'komunikacja', 'cialo'];

export const ActionRadar = ({ data }: Props) => {
  const sketch = useCallback((p: p5, container: HTMLDivElement) => {
    const W = container.clientWidth;
    const H = 350;
    const cx = W / 2;
    const cy = H / 2;

    const entries = ACTION_KEYS.map(k => ({
      key: k,
      value: data[k] || 0,
    }));
    const maxVal = Math.max(...entries.map(e => e.value), 1);
    const dominantIdx = entries.reduce((best, e, i) =>
      e.value > entries[best].value ? i : best, 0);

    // Position 7 ripple sources in a loose circle
    const sourceRadius = Math.min(W, H) * 0.28;
    const sources = entries.map((entry, i) => {
      const angle = (i / entries.length) * p.TWO_PI - p.HALF_PI;
      return {
        x: cx + Math.cos(angle) * sourceRadius,
        y: cy + Math.sin(angle) * sourceRadius,
        value: entry.value,
        normalised: entry.value / maxVal,
        isDominant: i === dominantIdx,
      };
    });

    // Ripple state
    interface Ripple {
      srcIdx: number;
      radius: number;
      maxRadius: number;
      alpha: number;
      strokeW: number;
    }

    let ripples: Ripple[] = [];
    let nextSpawn: number[] = [];

    p.setup = () => {
      p.createCanvas(W, H);
      p.frameRate(30);
      // Initial spawn timers — higher value = sooner first ripple
      nextSpawn = sources.map((s) =>
        Math.floor(p.random(5, 40 - s.normalised * 30))
      );
    };

    p.draw = () => {
      p.background(255);

      // Spawn new ripples
      for (let i = 0; i < sources.length; i++) {
        nextSpawn[i]--;
        if (nextSpawn[i] <= 0) {
          const s = sources[i];
          const baseMaxR = 30 + s.normalised * 100;
          ripples.push({
            srcIdx: i,
            radius: 2 + s.normalised * 6,
            maxRadius: baseMaxR,
            alpha: 60 + s.normalised * 60,
            strokeW: 0.6 + s.normalised * 1.4,
          });
          // Higher count = more frequent ripples
          const interval = Math.floor(p.map(s.normalised, 0, 1, 80, 20));
          nextSpawn[i] = interval + Math.floor(p.random(-5, 5));
        }
      }

      // Draw and update ripples
      p.noFill();
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        const s = sources[r.srcIdx];

        // Expand
        r.radius += 0.4 + s.normalised * 0.6;
        // Fade based on how far toward max radius
        const progress = r.radius / r.maxRadius;
        const currentAlpha = r.alpha * (1 - progress);

        if (currentAlpha < 1 || r.radius > r.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        // Color: gray for normal, red accent for dominant
        if (s.isDominant) {
          p.stroke(194, 48, 48, currentAlpha);
        } else {
          p.stroke(80, 80, 80, currentAlpha);
        }
        p.strokeWeight(r.strokeW * (1 - progress * 0.5));
        p.ellipse(s.x, s.y, r.radius * 2, r.radius * 2);
      }

      // Draw source stones (small circles at center of each ripple source)
      for (let i = 0; i < sources.length; i++) {
        const s = sources[i];
        const stoneSize = 3 + s.normalised * 6;
        p.noStroke();
        if (s.isDominant) {
          p.fill(194, 48, 48, 160);
        } else {
          p.fill(80, 80, 80, 120);
        }
        p.ellipse(s.x, s.y, stoneSize);
      }

      // Cap ripples to avoid performance issues
      if (ripples.length > 120) ripples.splice(0, ripples.length - 120);
    };
  }, [data]);

  return <P5Wrapper sketch={sketch} className="w-full" />;
};

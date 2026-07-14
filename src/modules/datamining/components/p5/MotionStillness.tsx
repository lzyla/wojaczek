import { useCallback } from 'react';
import p5 from 'p5';
import { P5Wrapper } from './P5Wrapper';

interface Props {
  data: { dynamism: number };
}

export const MotionStillness = ({ data }: Props) => {
  const sketch = useCallback((p: p5, container: HTMLDivElement) => {
    const W = container.clientWidth;
    const H = 320;
    const dyn = Math.max(0, Math.min(1, data.dynamism));
    const dividerX = W * dyn;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      isMoving: boolean;
      phase: number;
    }

    const particles: Particle[] = [];

    p.setup = () => {
      p.createCanvas(W, H);
      p.frameRate(20);

      const total = 80;
      const movingCount = Math.round(total * dyn);
      const stillCount = total - movingCount;

      for (let i = 0; i < movingCount; i++) {
        particles.push({
          x: p.random(10, dividerX - 10),
          y: p.random(20, H - 20),
          vx: p.random(-1.5, 1.5),
          vy: p.random(-1, 1),
          isMoving: true,
          phase: p.random(p.TWO_PI),
        });
      }

      for (let i = 0; i < stillCount; i++) {
        particles.push({
          x: p.random(dividerX + 10, W - 10),
          y: p.random(20, H - 20),
          vx: 0,
          vy: 0,
          isMoving: false,
          phase: p.random(p.TWO_PI),
        });
      }
    };

    p.draw = () => {
      p.background(255);
      const t = p.frameCount * 0.02;

      // Divider line
      p.stroke(230);
      p.strokeWeight(0.5);
      p.line(dividerX, 10, dividerX, H - 10);

      p.noStroke();
      for (const pt of particles) {
        if (pt.isMoving) {
          // Animate
          pt.x += pt.vx;
          pt.y += pt.vy;

          // Bounce within left zone
          if (pt.x < 5 || pt.x > dividerX - 5) pt.vx *= -1;
          if (pt.y < 5 || pt.y > H - 5) pt.vy *= -1;
          pt.x = p.constrain(pt.x, 5, dividerX - 5);
          pt.y = p.constrain(pt.y, 5, H - 5);

          // Trail
          p.fill(194, 48, 48, 30);
          p.ellipse(pt.x - pt.vx * 2, pt.y - pt.vy * 2, 3, 3);

          p.fill(194, 48, 48, 120);
          p.ellipse(pt.x, pt.y, 4, 4);
        } else {
          // Still dots
          p.fill(160, 70);
          p.ellipse(pt.x, pt.y, 4, 4);
        }
      }
    };
  }, [data]);

  return <P5Wrapper sketch={sketch} className="w-full" />;
};

import { useCallback } from 'react';
import p5 from 'p5';
import { P5Wrapper } from './P5Wrapper';

interface Props {
  data: { concrete: number; abstract: number; ratio: number };
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  side: 'concrete' | 'abstract';
}

export const ConcreteAbstractBalance = ({ data }: Props) => {
  const sketch = useCallback((p: p5, container: HTMLDivElement) => {
    const W = container.clientWidth;
    const H = 350;
    const midX = W / 2;

    const total = data.concrete + data.abstract;
    const concreteCount = Math.min(Math.round((data.concrete / Math.max(total, 1)) * 80), 80);
    const abstractCount = Math.min(Math.round((data.abstract / Math.max(total, 1)) * 80), 80);

    const particles: Particle[] = [];

    p.setup = () => {
      p.createCanvas(W, H);
      p.frameRate(25);

      // Concrete particles — left, heavy, fall down
      for (let i = 0; i < concreteCount; i++) {
        particles.push({
          x: p.random(20, midX - 20),
          y: p.random(20, H - 20),
          vx: p.random(-0.15, 0.15),
          vy: p.random(0.1, 0.4), // falling
          size: p.random(3, 7),
          side: 'concrete',
        });
      }

      // Abstract particles — right, light, float up
      for (let i = 0; i < abstractCount; i++) {
        particles.push({
          x: p.random(midX + 20, W - 20),
          y: p.random(20, H - 20),
          vx: p.random(-0.2, 0.2),
          vy: p.random(-0.4, -0.05), // rising
          size: p.random(1.5, 4),
          side: 'abstract',
        });
      }
    };

    p.draw = () => {
      p.background(255);

      // Divider line
      p.stroke(220);
      p.strokeWeight(0.5);
      p.line(midX, 20, midX, H - 20);

      // Update and draw particles
      p.noStroke();
      for (const pt of particles) {
        pt.x += pt.vx;
        pt.y += pt.vy;

        if (pt.side === 'concrete') {
          // Heavy: gravity pull down, bounce at bottom
          pt.vy += 0.005;
          if (pt.y > H - 10) { pt.y = H - 10; pt.vy = -Math.abs(pt.vy) * 0.3; }
          if (pt.y < 10) pt.vy = Math.abs(pt.vy);
          if (pt.x < 10 || pt.x > midX - 5) pt.vx *= -1;

          // Dense, dark squares
          p.fill(51, 51, 51, 140);
          p.rect(pt.x - pt.size / 2, pt.y - pt.size / 2, pt.size, pt.size);
        } else {
          // Light: float up, drift
          pt.vy -= 0.003;
          if (pt.y < 10) { pt.y = 10; pt.vy = Math.abs(pt.vy) * 0.2; }
          if (pt.y > H - 10) pt.vy = -Math.abs(pt.vy);
          if (pt.x < midX + 5 || pt.x > W - 10) pt.vx *= -1;

          // Light, semi-transparent circles
          const alpha = 40 + p.sin(p.frameCount * 0.03 + pt.x) * 20;
          p.fill(153, 153, 153, alpha);
          p.ellipse(pt.x, pt.y, pt.size);
        }

        // Gentle noise drift
        pt.vx += (p.noise(pt.x * 0.01, pt.y * 0.01, p.frameCount * 0.005) - 0.5) * 0.02;
      }

      // Accent: red dot at the balance point on the divider
      const balanceY = H - (data.ratio * (H - 40)) - 20;
      p.fill(194, 48, 48);
      p.noStroke();
      p.ellipse(midX, balanceY, 6);
    };
  }, [data.concrete, data.abstract, data.ratio]);

  return <P5Wrapper sketch={sketch} className="w-full" />;
};

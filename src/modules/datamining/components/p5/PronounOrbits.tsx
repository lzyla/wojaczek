import { useCallback } from 'react';
import p5 from 'p5';
import { P5Wrapper } from './P5Wrapper';

interface Props {
  data: Record<string, number>;
}

export const PronounOrbits = ({ data }: Props) => {
  const sketch = useCallback((p: p5, container: HTMLDivElement) => {
    const W = container.clientWidth;
    const H = 350;

    const jaCount = data['ja'] || 0;
    const tyCount = data['ty'] || 0;
    const totalAll = Object.values(data).reduce((s, v) => s + v, 0) || 1;

    // Attractor positions
    const jaStrength = jaCount / totalAll;
    const tyStrength = tyCount / totalAll;

    const jaPos = { x: W * 0.33, y: H * 0.5 };
    const tyPos = { x: W * 0.67, y: H * 0.5 };

    const PARTICLE_COUNT = 150;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      trail: { x: number; y: number }[];
      size: number;
      alpha: number;
    }

    let particles: Particle[] = [];

    p.setup = () => {
      p.createCanvas(W, H);
      p.frameRate(24);

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: p.random(W),
          y: p.random(H),
          vx: p.random(-0.3, 0.3),
          vy: p.random(-0.3, 0.3),
          trail: [],
          size: p.random(1, 2.5),
          alpha: p.random(80, 180),
        });
      }
    };

    p.draw = () => {
      p.background(255);

      const t = p.frameCount * 0.005;

      for (const pt of particles) {
        // Gravitational pull toward "ja" attractor
        const dxJa = jaPos.x - pt.x;
        const dyJa = jaPos.y - pt.y;
        const distJa = Math.max(Math.sqrt(dxJa * dxJa + dyJa * dyJa), 20);
        const forceJa = jaStrength * 0.8 / (distJa * 0.05);

        // Gravitational pull toward "ty" attractor
        const dxTy = tyPos.x - pt.x;
        const dyTy = tyPos.y - pt.y;
        const distTy = Math.max(Math.sqrt(dxTy * dxTy + dyTy * dyTy), 20);
        const forceTy = tyStrength * 0.8 / (distTy * 0.05);

        // Apply forces
        pt.vx += (dxJa / distJa) * forceJa + (dxTy / distTy) * forceTy;
        pt.vy += (dyJa / distJa) * forceJa + (dyTy / distTy) * forceTy;

        // Add slight noise for organic feel
        pt.vx += (p.noise(pt.x * 0.005, t) - 0.5) * 0.15;
        pt.vy += (p.noise(pt.y * 0.005, t + 100) - 0.5) * 0.15;

        // Damping
        pt.vx *= 0.97;
        pt.vy *= 0.97;

        // Speed limit
        const speed = Math.sqrt(pt.vx * pt.vx + pt.vy * pt.vy);
        if (speed > 2) {
          pt.vx = (pt.vx / speed) * 2;
          pt.vy = (pt.vy / speed) * 2;
        }

        // Move
        pt.x += pt.vx;
        pt.y += pt.vy;

        // Soft boundary
        if (pt.x < 10) pt.vx += 0.3;
        if (pt.x > W - 10) pt.vx -= 0.3;
        if (pt.y < 10) pt.vy += 0.3;
        if (pt.y > H - 10) pt.vy -= 0.3;

        // Trail
        pt.trail.push({ x: pt.x, y: pt.y });
        if (pt.trail.length > 15) pt.trail.shift();

        // Draw trail
        p.noFill();
        for (let ti = 0; ti < pt.trail.length - 1; ti++) {
          const trailAlpha = p.map(ti, 0, pt.trail.length, 2, pt.alpha * 0.15);
          p.stroke(100, 95, 90, trailAlpha);
          p.strokeWeight(0.5);
          p.line(pt.trail[ti].x, pt.trail[ti].y, pt.trail[ti + 1].x, pt.trail[ti + 1].y);
        }

        // Draw particle
        p.noStroke();
        p.fill(80, 75, 70, pt.alpha);
        p.ellipse(pt.x, pt.y, pt.size);
      }

      // Subtle attractor hints — very faint glow
      if (jaStrength > 0.05) {
        p.noStroke();
        p.fill(80, 75, 70, 5);
        p.ellipse(jaPos.x, jaPos.y, 40 + jaStrength * 60);
      }
      if (tyStrength > 0.05) {
        p.noStroke();
        p.fill(80, 75, 70, 5);
        p.ellipse(tyPos.x, tyPos.y, 40 + tyStrength * 60);
      }

    };
  }, [data]);

  return <P5Wrapper sketch={sketch} className="w-full" />;
};

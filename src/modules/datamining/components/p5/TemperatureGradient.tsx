import { useCallback } from 'react';
import p5 from 'p5';
import { P5Wrapper } from './P5Wrapper';

interface Props {
  data: { value: number; label: string };
}

export const TemperatureGradient = ({ data }: Props) => {
  const sketch = useCallback((p: p5, container: HTMLDivElement) => {
    const W = container.clientWidth;
    const H = 300;
    const temp = data.value; // 0 = cold, 1 = hot

    p.setup = () => {
      p.createCanvas(W, H);
      p.frameRate(20);
    };

    p.draw = () => {
      p.background(255);

      const t = p.frameCount * 0.015;
      const markerY = H - 30 - (H - 60) * temp; // bottom = cold, top = hot

      // Draw vertical gradient strip (left side, 60px wide)
      const stripX = 30;
      const stripW = 50;
      const stripTop = 30;
      const stripBottom = H - 30;

      for (let y = stripTop; y < stripBottom; y++) {
        const ratio = 1 - (y - stripTop) / (stripBottom - stripTop); // 0=bottom(cold), 1=top(hot)

        let r: number, g: number, b: number;
        if (ratio < 0.25) {
          const s = ratio / 0.25;
          r = p.lerp(40, 80, s); g = p.lerp(60, 120, s); b = p.lerp(140, 180, s);
        } else if (ratio < 0.5) {
          const s = (ratio - 0.25) / 0.25;
          r = p.lerp(80, 200, s); g = p.lerp(120, 200, s); b = p.lerp(180, 200, s);
        } else if (ratio < 0.75) {
          const s = (ratio - 0.5) / 0.25;
          r = p.lerp(200, 220, s); g = p.lerp(200, 140, s); b = p.lerp(200, 50, s);
        } else {
          const s = (ratio - 0.75) / 0.25;
          r = p.lerp(220, 180, s); g = p.lerp(140, 30, s); b = p.lerp(50, 30, s);
        }

        p.stroke(r, g, b, 180);
        p.strokeWeight(1);
        p.line(stripX, y, stripX + stripW, y);
      }

      // Strip border
      p.noFill();
      p.stroke(0, 20);
      p.strokeWeight(0.5);
      p.rect(stripX, stripTop, stripW, stripBottom - stripTop);

      // Marker — triangle pointing right
      const my = stripTop + (1 - temp) * (stripBottom - stripTop);
      const pulse = p.sin(t * 2) * 3;

      p.fill(194, 48, 48);
      p.noStroke();
      p.triangle(
        stripX + stripW + 5 + pulse, my,
        stripX + stripW + 18 + pulse, my - 6,
        stripX + stripW + 18 + pulse, my + 6
      );

      // Radiating heat/cold waves on right side
      const waveArea = W - (stripX + stripW + 30);
      const waveStartX = stripX + stripW + 30;

      for (let i = 0; i < 20; i++) {
        const waveY = stripTop + i * ((stripBottom - stripTop) / 20);
        const localRatio = 1 - (waveY - stripTop) / (stripBottom - stripTop);

        // Wave amplitude based on how close to the marker
        const distFromMarker = Math.abs(waveY - my) / (stripBottom - stripTop);
        const proximity = Math.max(0, 1 - distFromMarker * 3);

        let r: number, g: number, b: number;
        if (localRatio < 0.5) {
          r = 60; g = 100; b = 160; // cold blue
        } else {
          r = 200; g = 80; b = 40; // hot red
        }

        const amp = (5 + proximity * 25) * (0.5 + localRatio * temp);
        const freq = 0.02 + proximity * 0.01;

        p.noFill();
        p.stroke(r, g, b, 20 + proximity * 60);
        p.strokeWeight(0.5 + proximity);

        p.beginShape();
        for (let x = 0; x < waveArea; x += 2) {
          const wx = waveStartX + x;
          const wy = waveY + p.sin(x * freq + t + i * 0.5) * amp * p.sin(x / waveArea * p.PI);
          p.vertex(wx, wy);
        }
        p.endShape();
      }

      // Tick marks on left of strip
      p.stroke(0, 30);
      p.strokeWeight(0.5);
      for (let i = 0; i <= 4; i++) {
        const tickY = stripTop + i * (stripBottom - stripTop) / 4;
        p.line(stripX - 5, tickY, stripX, tickY);
      }
    };
  }, [data.value, data.label]);

  return <P5Wrapper sketch={sketch} className="w-full" />;
};

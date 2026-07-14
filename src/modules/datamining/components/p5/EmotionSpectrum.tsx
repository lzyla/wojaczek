import { useCallback } from 'react';
import p5 from 'p5';
import { P5Wrapper } from './P5Wrapper';

interface Props {
  emotions: Record<string, number>;
}

// Emotion → Goethe color + wavelength mapping (visible spectrum order)
const SPECTRUM: {
  name: string;
  wavelength: number;
  color: string;
}[] = [
  { name: 'strach',      wavelength: 380, color: '#443366' },
  { name: 'rozpacz',     wavelength: 430, color: '#6644aa' },
  { name: 'smutek',      wavelength: 470, color: '#2255aa' },
  { name: 'melancholia',  wavelength: 490, color: '#3366aa' },
  { name: 'tęsknota',    wavelength: 500, color: '#4477bb' },
  { name: 'rezygnacja',  wavelength: 520, color: '#228877' },
  { name: 'czułość',     wavelength: 570, color: '#ddaa33' },
  { name: 'euforia',     wavelength: 580, color: '#ddaa33' },
  { name: 'radość',      wavelength: 585, color: '#ddaa33' },
  { name: 'ironia',      wavelength: 560, color: '#aa3377' }, // magenta — special
  { name: 'bunt',        wavelength: 600, color: '#dd7722' },
  { name: 'obrzydzenie', wavelength: 620, color: '#886633' },
  { name: 'gniew',       wavelength: 650, color: '#cc3333' },
];

export const EmotionSpectrum = ({ emotions }: Props) => {
  const sketch = useCallback((p: p5, container: HTMLDivElement) => {
    const W = container.clientWidth;
    const H = 400;

    // Filter to only emotions present in data, sorted by wavelength
    const present = SPECTRUM
      .filter(s => (emotions[s.name] || 0) > 0)
      .sort((a, b) => a.wavelength - b.wavelength);

    if (present.length === 0) return;

    const maxCount = Math.max(...present.map(s => emotions[s.name] || 0));
    const dominant = present.reduce((best, s) =>
      (emotions[s.name] || 0) > (emotions[best.name] || 0) ? s : best, present[0]);

    // Prism geometry
    const prismCx = W * 0.32;
    const prismCy = H * 0.5;
    const prismSize = Math.min(H * 0.32, W * 0.12);

    // Band area: right of prism
    const bandStartX = prismCx + prismSize * 1.2;
    const bandEndX = W - 20;
    const bandAreaW = bandEndX - bandStartX;

    // Vertical layout for bands
    const bandAreaTop = H * 0.08;
    const bandAreaBot = H * 0.88;
    const bandAreaH = bandAreaBot - bandAreaTop;
    const gap = 3;
    const totalGaps = (present.length - 1) * gap;
    const availH = bandAreaH - totalGaps;

    // Noise seeds for shimmer
    const seeds = present.map(() => p.random(1000));

    p.setup = () => {
      p.createCanvas(W, H);
      p.frameRate(20);
    };

    p.draw = () => {
      p.background(255);
      const t = p.frameCount * 0.02;

      // ── White light beam: left → prism ──
      const beamStartX = 20;
      const beamY = prismCy;
      const beamW = 14;

      // Glow layers for white light
      for (let i = 4; i >= 0; i--) {
        const spread = beamW + i * 6;
        p.noStroke();
        p.fill(240, 240, 240, 40 - i * 6);
        p.rect(beamStartX, beamY - spread / 2, prismCx - prismSize * 0.7 - beamStartX, spread, 2);
      }
      // Core white beam
      p.noStroke();
      p.fill(230);
      p.rect(beamStartX, beamY - beamW / 2, prismCx - prismSize * 0.7 - beamStartX, beamW, 2);

      // ── Prism triangle ──
      const ax = prismCx;
      const ay = prismCy - prismSize;
      const bx = prismCx - prismSize * 0.7;
      const by = prismCy + prismSize * 0.6;
      const cx = prismCx + prismSize * 0.7;
      const cy = prismCy + prismSize * 0.6;

      p.noFill();
      p.stroke(200);
      p.strokeWeight(1.5);
      p.triangle(ax, ay, bx, by, cx, cy);

      // Subtle refraction fill
      p.noStroke();
      p.fill(245, 245, 250, 80);
      p.triangle(ax, ay, bx, by, cx, cy);

      // ── Spectral bands ──
      let yOffset = bandAreaTop;

      for (let i = 0; i < present.length; i++) {
        const s = present[i];
        const count = emotions[s.name] || 0;
        const ratio = count / maxCount;
        const isDominant = s === dominant;

        // Band height proportional to count
        const bandH = Math.max(8, (availH * ratio) / present.reduce((sum, sp) =>
          sum + (emotions[sp.name] || 0) / maxCount, 0));

        const col = p.color(s.color);
        const r = p.red(col), g = p.green(col), b = p.blue(col);

        // Shimmer: subtle noise displacement
        const shimmerY = p.noise(seeds[i], t * 0.5) * 4 - 2;
        const shimmerX = p.noise(seeds[i] + 100, t * 0.3) * 3 - 1.5;

        const bandY = yOffset + shimmerY;

        // Glow for dominant
        if (isDominant) {
          for (let gl = 3; gl >= 0; gl--) {
            p.noStroke();
            p.fill(r, g, b, 12 - gl * 2);
            p.rect(
              bandStartX + shimmerX - gl * 3,
              bandY - gl * 2,
              bandAreaW + gl * 6,
              bandH + gl * 4,
              3
            );
          }
        }

        // Main band
        p.noStroke();
        p.fill(r, g, b, isDominant ? 200 : 140);
        p.rect(bandStartX + shimmerX, bandY, bandAreaW, bandH, 2);

        // Lighter inner highlight
        p.fill(r, g, b, isDominant ? 60 : 30);
        p.rect(bandStartX + shimmerX + 2, bandY + 1, bandAreaW - 4, bandH - 2, 1);

        // Diverging ray from prism to band
        p.stroke(r, g, b, 50);
        p.strokeWeight(isDominant ? 1.5 : 0.7);
        const rayTargetY = bandY + bandH / 2;
        p.line(cx, cy - (cy - ay) * 0.3, bandStartX + shimmerX, rayTargetY);

        // Label
        p.noStroke();
        p.fill(120);
        p.textFont('DM Sans');
        p.textSize(8);
        p.textAlign(p.RIGHT, p.CENTER);
        p.text(s.name, bandStartX - 6 + shimmerX, bandY + bandH / 2);

        yOffset += bandH + gap;
      }
    };
  }, [emotions]);

  return <P5Wrapper sketch={sketch} className="w-full rounded-lg overflow-hidden" />;
};

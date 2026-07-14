import { useCallback } from 'react';
import p5 from 'p5';
import { P5Wrapper } from './P5Wrapper';

interface Props {
  data: {
    primary: string;
    secondary?: string;
    intensity: number;
  };
  /** Optional: full emotion counts for corpus mode — amplitudes proportional to actual counts */
  counts?: Record<string, number>;
}

// Goethe color theory
const GOETHE: Record<string, { color: string }> = {
  gniew:       { color: '#cc3333' },
  smutek:      { color: '#2255aa' },
  rezygnacja:  { color: '#228877' },
  ironia:      { color: '#aa3377' },
  czułość:     { color: '#ddaa33' },
  rozpacz:     { color: '#6644aa' },
  melancholia: { color: '#3366aa' },
  tęsknota:    { color: '#4477bb' },
  obrzydzenie: { color: '#886633' },
  bunt:        { color: '#dd7722' },
  strach:      { color: '#443366' },
  euforia:     { color: '#ddaa33' },
  radość:      { color: '#ddaa33' },
};
const DEFAULT_G = { color: '#7a6e58' };

export const EmotionFlowField = ({ data, counts }: Props) => {
  const sketch = useCallback((p: p5, container: HTMLDivElement) => {
    const W = container.clientWidth;
    const H = 400;

    // Build waves — amplitudes are FIXED (data-driven, constant)
    type Wave = { name: string; amp: number; freq: number; phase: number; g: typeof DEFAULT_G };
    let waves: Wave[];

    if (counts && Object.keys(counts).length > 0) {
      // Corpus mode — all emotions with real amplitudes
      const sorted = Object.entries(counts).sort(([, a], [, b]) => b - a);
      const maxCount = sorted[0]?.[1] || 1;
      waves = sorted.slice(0, 6).map(([name, count], i) => ({
        name,
        amp: count / maxCount, // normalized 0-1, highest = 1.0
        freq: 0.4 + i * 0.15,
        phase: i * 1.2,
        g: GOETHE[name] || DEFAULT_G,
      }));
    } else {
      // Poem mode — primary/secondary
      waves = [
        { name: data.primary, amp: data.intensity, freq: 0.8, phase: 0, g: GOETHE[data.primary] || DEFAULT_G },
        ...(data.secondary ? [{
          name: data.secondary, amp: data.intensity * 0.6, freq: 0.5, phase: 1.2, g: GOETHE[data.secondary] || DEFAULT_G
        }] : []),
        ...['rezygnacja', 'ironia', 'czułość']
          .filter(e => e !== data.primary && e !== data.secondary)
          .slice(0, 2)
          .map((name, i) => ({
            name, amp: 0.12 + i * 0.05, freq: 0.6 + i * 0.3, phase: 2 + i * 1.1, g: GOETHE[name] || DEFAULT_G
          })),
      ];
    }

    // Pre-compute FIXED max amplitudes (pixel values) — these never change
    const fixedAmplitudes = waves.map(w => H * 0.38 * w.amp);

    let mouseX: number | null = null;

    p.setup = () => {
      const c = p.createCanvas(W, H);
      p.frameRate(20);
      c.elt.addEventListener('mousemove', (e: MouseEvent) => { mouseX = e.offsetX; });
      c.elt.addEventListener('mouseleave', () => { mouseX = null; });
      c.elt.addEventListener('touchmove', (e: TouchEvent) => {
        e.preventDefault();
        mouseX = e.touches[0].clientX - c.elt.getBoundingClientRect().left;
      }, { passive: false });
      c.elt.addEventListener('touchend', () => { mouseX = null; });
    };

    p.draw = () => {
      // Only the PHASE animates — amplitudes are fixed
      const t = p.frameCount * 0.018;
      const midY = H / 2;
      p.background(255);

      // Draw waves back to front — lowest amplitude first, highest (dominant) on top
      const sortedByAmp = waves
        .map((w, i) => ({ w, fixedA: fixedAmplitudes[i], idx: i }))
        .sort((a, b) => a.fixedA - b.fixedA);

      for (const { w, fixedA } of sortedByAmp) {
        const col = p.color(w.g.color);
        const r = p.red(col), g = p.green(col), b = p.blue(col);
        const isTop = w === waves[0]; // highest amplitude wave

        // Filled area
        p.noStroke();
        p.fill(r, g, b, isTop ? 55 : 25);
        p.beginShape();
        p.vertex(0, midY);
        for (let x = 0; x <= W; x++) {
          const ratio = x / W;
          // fixedA is constant; only (t * 0.6) shifts the phase
          const y = midY - Math.sin(ratio * Math.PI * 2 * w.freq + t * 0.6 + w.phase) * fixedA * Math.sin(ratio * Math.PI);
          p.vertex(x, y);
        }
        p.vertex(W, midY);
        p.endShape(p.CLOSE);

        // Stroke line
        p.noFill();
        p.stroke(r, g, b, isTop ? 230 : 120);
        p.strokeWeight(isTop ? 2.5 : 1);
        p.beginShape();
        for (let x = 0; x <= W; x++) {
          const ratio = x / W;
          const y = midY - Math.sin(ratio * Math.PI * 2 * w.freq + t * 0.6 + w.phase) * fixedA * Math.sin(ratio * Math.PI);
          p.vertex(x, y);
        }
        p.endShape();
      }

      // Center line
      p.stroke(200);
      p.strokeWeight(0.5);
      p.line(0, midY, W, midY);

      // Interactive cursor
      if (mouseX !== null) {
        p.stroke(150, 40);
        p.strokeWeight(1);
        (p.drawingContext as CanvasRenderingContext2D).setLineDash([4, 4]);
        p.line(mouseX, 0, mouseX, H);
        (p.drawingContext as CanvasRenderingContext2D).setLineDash([]);

        p.noStroke();
        waves.slice(0, 4).forEach((w, i) => {
          const ratio = mouseX! / W;
          const y = midY - Math.sin(ratio * Math.PI * 2 * w.freq + t * 0.6 + w.phase) * fixedAmplitudes[i] * Math.sin(ratio * Math.PI);
          const col = p.color(w.g.color);
          p.fill(p.red(col), p.green(col), p.blue(col), 220);
          p.ellipse(mouseX!, y, 6, 6);

          // Label at dot
          p.fill(120);
          p.textFont('DM Sans');
          p.textSize(8);
          p.textAlign(p.LEFT, p.BOTTOM);
          p.text(w.name, mouseX! + 8, y - 4);
        });
      }
    };
  }, [data, counts]);

  return <P5Wrapper sketch={sketch} className="w-full rounded-lg overflow-hidden" />;
};

import { useCallback } from 'react';
import p5 from 'p5';
import { P5Wrapper } from './P5Wrapper';

interface Props {
  poems: {
    id: string;
    title: string;
    emotion?: { primary: string; secondary?: string; intensity: number };
  }[];
}

const GOETHE: Record<string, string> = {
  gniew:       '#cc3333',
  smutek:      '#2255aa',
  rezygnacja:  '#228877',
  ironia:      '#aa3377',
  czułość:     '#ddaa33',
  rozpacz:     '#6644aa',
  melancholia: '#3366aa',
  tęsknota:    '#4477bb',
  obrzydzenie: '#886633',
  bunt:        '#dd7722',
  strach:      '#443366',
  euforia:     '#ddaa33',
  radość:      '#ddaa33',
  lęk:         '#443366',
  pożądanie:   '#cc3366',
};
const DEFAULT_COLOR = '#7a6e58';

export const EmotionalBarcode = ({ poems }: Props) => {
  const sketch = useCallback((p: p5, container: HTMLDivElement) => {
    const W = container.clientWidth;
    const H = 400;
    const CURVE_H = 40;
    const BAR_TOP = CURVE_H + 8;
    const BAR_H = H - BAR_TOP;
    const N = poems.length;
    const stripeW = W / N;

    let mouseX: number | null = null;
    let mouseY: number | null = null;
    let animProgress = 0;

    // Pre-compute intensities for density curve
    const intensities = poems.map(pm => pm.emotion?.intensity ?? 0);

    p.setup = () => {
      const c = p.createCanvas(W, H);
      p.textFont('DM Sans');
      p.frameRate(30);
      c.elt.addEventListener('mousemove', (e: MouseEvent) => {
        mouseX = e.offsetX;
        mouseY = e.offsetY;
      });
      c.elt.addEventListener('mouseleave', () => {
        mouseX = null;
        mouseY = null;
      });
      c.elt.addEventListener('touchmove', (e: TouchEvent) => {
        e.preventDefault();
        const rect = c.elt.getBoundingClientRect();
        mouseX = e.touches[0].clientX - rect.left;
        mouseY = e.touches[0].clientY - rect.top;
      }, { passive: false });
      c.elt.addEventListener('touchend', () => { mouseX = null; mouseY = null; });
    };

    p.draw = () => {
      p.background(255);

      // Animation: progressive reveal over ~3 seconds (90 frames at 30fps)
      if (animProgress < 1) {
        animProgress = Math.min(1, animProgress + 1 / 90);
      }
      const visibleCount = Math.floor(N * animProgress);

      // Hovered index
      const hovIdx = mouseX !== null ? Math.floor(mouseX / stripeW) : -1;

      // ── Draw barcode stripes ──
      p.noStroke();
      for (let i = 0; i < visibleCount; i++) {
        const pm = poems[i];
        const x = i * stripeW;
        const em = pm.emotion;

        if (!em) {
          p.fill(230);
          p.rect(x, BAR_TOP, Math.max(stripeW - 0.5, 0.5), BAR_H);
          continue;
        }

        const primaryCol = p.color(GOETHE[em.primary] || DEFAULT_COLOR);
        const alpha = em.intensity * 255;

        if (em.secondary) {
          // Top half: primary
          const pr = p.red(primaryCol), pg = p.green(primaryCol), pb = p.blue(primaryCol);
          p.fill(pr, pg, pb, alpha);

          // Organic edge: slight noise displacement
          const nOff1 = p.noise(i * 0.3, 0) * 6 - 3;
          const halfH = BAR_H / 2;
          p.rect(x, BAR_TOP, Math.max(stripeW - 0.5, 0.5), halfH + nOff1);

          // Bottom half: secondary
          const secCol = p.color(GOETHE[em.secondary] || DEFAULT_COLOR);
          const sr = p.red(secCol), sg = p.green(secCol), sb = p.blue(secCol);
          p.fill(sr, sg, sb, alpha * 0.8);
          p.rect(x, BAR_TOP + halfH + nOff1, Math.max(stripeW - 0.5, 0.5), halfH - nOff1);
        } else {
          const pr = p.red(primaryCol), pg = p.green(primaryCol), pb = p.blue(primaryCol);
          p.fill(pr, pg, pb, alpha);
          p.rect(x, BAR_TOP, Math.max(stripeW - 0.5, 0.5), BAR_H);
        }
      }

      // ── Emotional density curve ──
      p.noFill();
      p.stroke(80);
      p.strokeWeight(1.5);
      p.beginShape();
      for (let i = 0; i < visibleCount; i++) {
        const cx = i * stripeW + stripeW / 2;
        // Smooth with neighbors
        const windowSize = 3;
        let sum = 0, count = 0;
        for (let j = Math.max(0, i - windowSize); j <= Math.min(N - 1, i + windowSize); j++) {
          sum += intensities[j];
          count++;
        }
        const avg = sum / count;
        const cy = CURVE_H - avg * (CURVE_H - 4) + 2;
        (p as any).curveVertex(cx, cy);
        if (i === 0) (p as any).curveVertex(cx, cy); // duplicate first
      }
      if (visibleCount > 0) {
        const lastX = (visibleCount - 1) * stripeW + stripeW / 2;
        const lastAvg = intensities[visibleCount - 1];
        (p as any).curveVertex(lastX, CURVE_H - lastAvg * (CURVE_H - 4) + 2); // duplicate last
      }
      p.endShape();

      // ── Cursor and hover ──
      if (mouseX !== null && hovIdx >= 0 && hovIdx < N) {
        // Vertical cursor line
        p.stroke(100, 80);
        p.strokeWeight(1);
        (p.drawingContext as CanvasRenderingContext2D).setLineDash([3, 3]);
        p.line(mouseX, 0, mouseX, H);
        (p.drawingContext as CanvasRenderingContext2D).setLineDash([]);

        // Highlight stripe
        const hx = hovIdx * stripeW;
        p.noStroke();
        p.fill(255, 255, 255, 60);
        p.rect(hx, BAR_TOP, stripeW, BAR_H);

        // Tooltip
        const pm = poems[hovIdx];
        if (pm) {
          const label = pm.title;
          const emotionLabel = pm.emotion
            ? `${pm.emotion.primary}${pm.emotion.secondary ? ' · ' + pm.emotion.secondary : ''} (${Math.round(pm.emotion.intensity * 100)}%)`
            : 'brak danych';

          p.noStroke();
          p.fill(120);
          p.textFont('DM Sans');
          p.textSize(8);

          // Position tooltip to avoid going off-canvas
          const tooltipX = mouseX + 10 > W - 120 ? mouseX - 120 : mouseX + 10;
          const tooltipY = mouseY !== null ? Math.max(20, Math.min(mouseY - 10, H - 30)) : H / 2;

          p.textAlign(p.LEFT, p.BOTTOM);
          p.text(label, tooltipX, tooltipY);
          p.textSize(7);
          p.fill(150);
          p.text(emotionLabel, tooltipX, tooltipY + 11);
        }
      }
    };
  }, [poems]);

  return <P5Wrapper sketch={sketch} className="w-full rounded-lg overflow-hidden" />;
};

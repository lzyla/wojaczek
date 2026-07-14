import { useCallback } from 'react';
import p5 from 'p5';
import { P5Wrapper } from './P5Wrapper';

interface Metaphor {
  source: string;
  target: string;
  example?: string;
}

interface Props {
  data: Metaphor[];
}

export const MetaphorConstellations = ({ data }: Props) => {
  const sketch = useCallback((p: p5, container: HTMLDivElement) => {
    const W = container.clientWidth;
    const H = 350;

    const MARGIN_L = 40;
    const MARGIN_R = 40;
    const MARGIN_T = 30;
    const MARGIN_B = 30;

    // Build unique source and target lists
    const sourceSet = new Map<string, number>();
    const targetSet = new Map<string, number>();

    for (const m of data) {
      sourceSet.set(m.source, (sourceSet.get(m.source) || 0) + 1);
      targetSet.set(m.target, (targetSet.get(m.target) || 0) + 1);
    }

    const sources = Array.from(sourceSet.entries());
    const targets = Array.from(targetSet.entries());
    const maxCount = Math.max(
      ...sources.map(([, c]) => c),
      ...targets.map(([, c]) => c),
      1
    );

    // Fixed Y positions for source nodes (left)
    const sourceNodes = sources.map(([name, count], i) => ({
      name,
      count,
      x: MARGIN_L,
      y: MARGIN_T + ((H - MARGIN_T - MARGIN_B) / (sources.length + 1)) * (i + 1),
    }));

    // Fixed Y positions for target nodes (right)
    const targetNodes = targets.map(([name, count], i) => ({
      name,
      count,
      x: W - MARGIN_R,
      y: MARGIN_T + ((H - MARGIN_T - MARGIN_B) / (targets.length + 1)) * (i + 1),
    }));

    // Build connections
    const connections = data.map(m => {
      const src = sourceNodes.find(n => n.name === m.source)!;
      const tgt = targetNodes.find(n => n.name === m.target)!;
      return { src, tgt, metaphor: m };
    });

    // Count connections per pair for thickness
    const pairCounts = new Map<string, number>();
    for (const m of data) {
      const key = `${m.source}→${m.target}`;
      pairCounts.set(key, (pairCounts.get(key) || 0) + 1);
    }

    // Animation timing
    const DRAW_DURATION = 60; // frames to fully draw lines (2s at 30fps)
    let hoveredNode: string | null = null;

    p.setup = () => {
      p.createCanvas(W, H);
      p.frameRate(30);
    };

    p.draw = () => {
      p.background(255);

      const progress = Math.min(p.frameCount / DRAW_DURATION, 1);
      // Ease in-out
      const eased = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      // Detect hover
      hoveredNode = null;
      const allNodes = [...sourceNodes, ...targetNodes];
      for (const node of allNodes) {
        const d = p.dist(p.mouseX, p.mouseY, node.x, node.y);
        const nodeSize = p.map(node.count, 1, maxCount, 5, 14);
        if (d < nodeSize + 6) {
          hoveredNode = node.name;
          break;
        }
      }

      // Draw bezier connections
      const uniqueDrawn = new Set<string>();
      for (const conn of connections) {
        const key = `${conn.src.name}→${conn.tgt.name}`;
        if (uniqueDrawn.has(key)) continue;
        uniqueDrawn.add(key);

        const strength = pairCounts.get(key) || 1;
        const thickness = p.map(strength, 1, Math.max(...pairCounts.values()), 0.8, 3);

        const isHighlighted = hoveredNode && (conn.src.name === hoveredNode || conn.tgt.name === hoveredNode);
        const isDimmed = hoveredNode && !isHighlighted;

        if (isDimmed) {
          p.stroke(200, 200, 200, 40);
        } else if (isHighlighted) {
          p.stroke(194, 48, 48, 180);
        } else {
          p.stroke(160, 160, 160, 80);
        }
        p.strokeWeight(isHighlighted ? thickness + 0.5 : thickness);
        p.noFill();

        // Animated draw: partial bezier
        const sx = conn.src.x;
        const sy = conn.src.y;
        const ex = conn.tgt.x;
        const ey = conn.tgt.y;
        const cpx1 = sx + (ex - sx) * 0.35;
        const cpx2 = sx + (ex - sx) * 0.65;

        // Draw bezier up to progress point
        p.beginShape();
        const steps = 30;
        const maxStep = Math.floor(steps * eased);
        for (let s = 0; s <= maxStep; s++) {
          const t = s / steps;
          const px = p.bezierPoint(sx, cpx1, cpx2, ex, t);
          const py = p.bezierPoint(sy, sy, ey, ey, t);
          p.vertex(px, py);
        }
        p.endShape();
      }

      // Draw source nodes (left, dark gray)
      for (const node of sourceNodes) {
        const nodeSize = p.map(node.count, 1, maxCount, 5, 14);
        const isHovered = hoveredNode === node.name;

        p.noStroke();
        if (isHovered) {
          p.fill(194, 48, 48, 200);
        } else if (hoveredNode) {
          // Check if connected to hovered
          const connected = connections.some(c =>
            (c.src.name === node.name && c.tgt.name === hoveredNode) ||
            (c.tgt.name === node.name && c.src.name === hoveredNode)
          );
          p.fill(connected ? 100 : 200, connected ? 100 : 200, connected ? 100 : 200, connected ? 180 : 60);
        } else {
          p.fill(85, 85, 85, 180);
        }
        p.ellipse(node.x, node.y, nodeSize);
        // Source label (left-aligned, to the left of node)
        p.textFont('DM Sans');
        p.textSize(isHovered ? 9 : 8);
        p.textStyle(p.NORMAL);
        p.fill(120);
        p.textAlign(p.RIGHT);
        p.text(node.name, node.x - nodeSize / 2 - 4, node.y + 3);
      }

      // Draw target nodes (right, medium gray)
      for (const node of targetNodes) {
        const nodeSize = p.map(node.count, 1, maxCount, 5, 14);
        const isHovered = hoveredNode === node.name;

        p.noStroke();
        if (isHovered) {
          p.fill(194, 48, 48, 200);
        } else if (hoveredNode) {
          const connected = connections.some(c =>
            (c.src.name === node.name && c.tgt.name === hoveredNode) ||
            (c.tgt.name === node.name && c.src.name === hoveredNode)
          );
          p.fill(connected ? 100 : 200, connected ? 100 : 200, connected ? 100 : 200, connected ? 180 : 60);
        } else {
          p.fill(153, 153, 153, 180);
        }
        p.ellipse(node.x, node.y, nodeSize);
        // Target label (right-aligned, to the right of node)
        p.textFont('DM Sans');
        p.textSize(isHovered ? 9 : 8);
        p.textStyle(p.NORMAL);
        p.fill(120);
        p.textAlign(p.LEFT);
        p.text(node.name, node.x + nodeSize / 2 + 4, node.y + 3);
      }
    };
  }, [data]);

  return <P5Wrapper sketch={sketch} className="w-full" />;
};

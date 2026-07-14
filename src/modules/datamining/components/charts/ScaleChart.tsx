import { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { ChartWrapper } from './ChartWrapper';

interface ScaleChartProps {
  value: number;
  min: number;
  max: number;
  leftLabel?: string;
  rightLabel?: string;
  valueLabel?: string;
  title?: string;
  accentColor?: string;
  corpusAverage?: number;
}

export const ScaleChart = ({
  value,
  min,
  max,
  leftLabel,
  rightLabel,
  valueLabel,
  title,
  accentColor = '#c23030',
  corpusAverage,
}: ScaleChartProps) => {
  return (
    <ChartWrapper title={title}>
      {(width) => (
        <ScaleChartInner
          value={value}
          min={min}
          max={max}
          leftLabel={leftLabel}
          rightLabel={rightLabel}
          valueLabel={valueLabel}
          width={width}
          accentColor={accentColor}
          corpusAverage={corpusAverage}
        />
      )}
    </ChartWrapper>
  );
};

const ScaleChartInner = ({
  value,
  min,
  max,
  leftLabel,
  rightLabel,
  valueLabel,
  width,
  accentColor,
  corpusAverage,
}: {
  value: number;
  min: number;
  max: number;
  leftLabel?: string;
  rightLabel?: string;
  valueLabel?: string;
  width: number;
  accentColor: string;
  corpusAverage?: number;
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const padding = 24;
  const lineY = 44;
  const svgHeight = 90;

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    if (!tooltipRef.current) {
      tooltipRef.current = document.createElement('div');
      tooltipRef.current.style.cssText =
        'position:fixed;pointer-events:none;z-index:9999;background:#fff;border:1px solid #e0e0e0;' +
        'box-shadow:0 4px 12px rgba(0,0,0,0.15);border-radius:6px;padding:6px 12px;font-size:12px;' +
        'font-family:"DM Sans",sans-serif;opacity:0;transition:opacity 0.15s;color:#1a1a1a;';
      document.body.appendChild(tooltipRef.current);
    }

    const lineW = width - padding * 2;
    const clamped = Math.max(min, Math.min(max, value));
    const pct = max === min ? 0.5 : (clamped - min) / (max - min);
    const markerX = padding + pct * lineW;

    // Defs for gradient
    const defs = svg.append('defs');

    // Color gradient along the scale line
    const lineGrad = defs.append('linearGradient')
      .attr('id', 'scale-line-grad')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '100%').attr('y2', '0%');
    lineGrad.append('stop').attr('offset', '0%').attr('stop-color', '#dddddd');
    lineGrad.append('stop').attr('offset', '50%').attr('stop-color', '#999999');
    lineGrad.append('stop').attr('offset', '100%').attr('stop-color', '#c23030');

    // Pulsing animation filter
    const filter = defs.append('filter').attr('id', 'pulse-glow');
    filter.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'glow');
    const merge = filter.append('feMerge');
    merge.append('feMergeNode').attr('in', 'glow');
    merge.append('feMergeNode').attr('in', 'SourceGraphic');

    const g = svg.append('g');

    // Background line
    g.append('line')
      .attr('x1', padding).attr('y1', lineY)
      .attr('x2', width - padding).attr('y2', lineY)
      .attr('stroke', '#e0e0e0')
      .attr('stroke-width', 4)
      .attr('stroke-linecap', 'round');

    // Gradient fill line
    g.append('line')
      .attr('x1', padding).attr('y1', lineY)
      .attr('x2', width - padding).attr('y2', lineY)
      .attr('stroke', 'url(#scale-line-grad)')
      .attr('stroke-width', 4)
      .attr('stroke-linecap', 'round')
      .attr('opacity', 0.3);

    // Tick marks
    const tickCount = 5;
    for (let i = 0; i <= tickCount; i++) {
      const tx = padding + (i / tickCount) * lineW;
      g.append('line')
        .attr('x1', tx).attr('y1', lineY - 5)
        .attr('x2', tx).attr('y2', lineY + 5)
        .attr('stroke', '#1a1a1a')
        .attr('stroke-width', 1)
        .attr('opacity', 0.2);

      // Tick value
      const tickVal = min + (i / tickCount) * (max - min);
      g.append('text')
        .attr('x', tx).attr('y', lineY + 18)
        .attr('text-anchor', 'middle')
        .attr('font-family', '"DM Sans", sans-serif')
        .attr('font-size', 8)
        .attr('fill', '#1a1a1a')
        .attr('opacity', 0.25)
        .text(tickVal % 1 === 0 ? tickVal : tickVal.toFixed(1));
    }

    // Filled bar up to marker (animated)
    g.append('line')
      .attr('x1', padding).attr('y1', lineY)
      .attr('x2', padding).attr('y2', lineY)
      .attr('stroke', accentColor)
      .attr('stroke-width', 4)
      .attr('stroke-linecap', 'round')
      .transition()
      .duration(600)
      .ease(d3.easeBackOut.overshoot(0.3))
      .attr('x2', markerX);

    // Corpus average marker (dashed, gray)
    if (corpusAverage !== undefined) {
      const cavgClamped = Math.max(min, Math.min(max, corpusAverage));
      const cavgPct = max === min ? 0.5 : (cavgClamped - min) / (max - min);
      const cavgX = padding + cavgPct * lineW;

      g.append('line')
        .attr('x1', cavgX).attr('y1', lineY - 10)
        .attr('x2', cavgX).attr('y2', lineY + 10)
        .attr('stroke', '#888')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '3,2')
        .attr('opacity', 0);

      g.selectAll('.cavg-line')
        .transition()
        .duration(300)
        .delay(700)
        .attr('opacity', 0.6);

      // Delayed appearance
      setTimeout(() => {
        g.append('line')
          .attr('x1', cavgX).attr('y1', lineY - 10)
          .attr('x2', cavgX).attr('y2', lineY + 10)
          .attr('stroke', '#888')
          .attr('stroke-width', 1.5)
          .attr('stroke-dasharray', '3,2')
          .attr('opacity', 0)
          .transition()
          .duration(300)
          .attr('opacity', 0.6);

        g.append('text')
          .attr('x', cavgX).attr('y', lineY + 28)
          .attr('text-anchor', 'middle')
          .attr('font-family', '"DM Sans", sans-serif')
          .attr('font-size', 8)
          .attr('fill', '#888')
          .attr('opacity', 0)
          .text('sr. korpusu')
          .transition()
          .duration(300)
          .attr('opacity', 0.5);
      }, 700);
    }

    // Marker dot (animated slide + pulsing)
    const marker = g.append('circle')
      .attr('cx', padding).attr('cy', lineY)
      .attr('r', 7)
      .attr('fill', accentColor)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('filter', 'url(#pulse-glow)')
      .attr('cursor', 'pointer');

    marker.transition()
      .duration(600)
      .ease(d3.easeBackOut.overshoot(0.3))
      .attr('cx', markerX);

    // Pulsing animation
    function pulse() {
      marker
        .transition()
        .duration(1000)
        .attr('r', 9)
        .transition()
        .duration(1000)
        .attr('r', 7)
        .on('end', pulse);
    }
    setTimeout(pulse, 700);

    // Value label above marker
    if (valueLabel) {
      g.append('text')
        .attr('x', padding).attr('y', lineY - 18)
        .attr('text-anchor', 'middle')
        .attr('font-family', '"DM Sans", sans-serif')
        .attr('font-size', 12)
        .attr('font-weight', '700')
        .attr('fill', '#1a1a1a')
        .attr('opacity', 0)
        .text(valueLabel)
        .transition()
        .duration(600)
        .ease(d3.easeBackOut)
        .attr('x', markerX)
        .attr('opacity', 1);
    }

    // Min/max labels
    if (leftLabel) {
      g.append('text')
        .attr('x', padding).attr('y', lineY + 28)
        .attr('text-anchor', 'start')
        .attr('font-family', '"DM Sans", sans-serif')
        .attr('font-size', 9)
        .attr('fill', '#1a1a1a')
        .attr('opacity', 0.4)
        .text(leftLabel);
    }
    if (rightLabel) {
      g.append('text')
        .attr('x', width - padding).attr('y', lineY + 28)
        .attr('text-anchor', 'end')
        .attr('font-family', '"DM Sans", sans-serif')
        .attr('font-size', 9)
        .attr('fill', '#1a1a1a')
        .attr('opacity', 0.4)
        .text(rightLabel);
    }

    return () => {
      if (tooltipRef.current) tooltipRef.current.style.opacity = '0';
    };
  }, [value, min, max, width, padding, lineY, accentColor, leftLabel, rightLabel, valueLabel, corpusAverage]);

  useEffect(() => {
    return () => {
      if (tooltipRef.current && tooltipRef.current.parentNode) {
        tooltipRef.current.parentNode.removeChild(tooltipRef.current);
        tooltipRef.current = null;
      }
    };
  }, []);

  return (
    <svg ref={svgRef} width={width} height={svgHeight} className="overflow-visible" />
  );
};

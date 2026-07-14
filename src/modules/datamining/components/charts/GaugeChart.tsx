import { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { ChartWrapper } from './ChartWrapper';

interface GaugeProps {
  value: number; // 0-1
  label: string;
  minLabel?: string;
  maxLabel?: string;
  color?: string;
  disclaimer?: string;
  title?: string;
}

export const GaugeChart = ({
  value,
  label,
  minLabel = '0%',
  maxLabel = '100%',
  color,
  disclaimer,
  title,
}: GaugeProps) => {
  return (
    <ChartWrapper title={title}>
      {(width) => (
        <GaugeInner
          value={value}
          label={label}
          minLabel={minLabel}
          maxLabel={maxLabel}
          color={color}
          disclaimer={disclaimer}
          width={width}
        />
      )}
    </ChartWrapper>
  );
};

const GaugeInner = ({
  value,
  label,
  minLabel,
  maxLabel,
  color: colorProp,
  disclaimer,
  width,
}: {
  value: number;
  label: string;
  minLabel: string;
  maxLabel: string;
  color?: string;
  disclaimer?: string;
  width: number;
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const clamped = Math.max(0, Math.min(1, value));
  const size = Math.min(width, 280);
  const radius = size / 2 - 20;
  const arcWidth = 18;
  const cx = width / 2;
  const cy = size / 2 + 10;
  const svgHeight = size / 2 + 50 + (disclaimer ? 24 : 0);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Defs for gradient arc
    const defs = svg.append('defs');
    const arcGrad = defs.append('linearGradient')
      .attr('id', 'gauge-arc-grad')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '100%').attr('y2', '0%');
    arcGrad.append('stop').attr('offset', '0%').attr('stop-color', '#dddddd');
    arcGrad.append('stop').attr('offset', '50%').attr('stop-color', '#999999');
    arcGrad.append('stop').attr('offset', '100%').attr('stop-color', '#c23030');

    // Glow filter for needle
    const filter = defs.append('filter').attr('id', 'gauge-glow');
    filter.append('feGaussianBlur').attr('stdDeviation', '2').attr('result', 'glow');
    const merge = filter.append('feMerge');
    merge.append('feMergeNode').attr('in', 'glow');
    merge.append('feMergeNode').attr('in', 'SourceGraphic');

    const g = svg.append('g').attr('transform', `translate(${cx},${cy})`);

    // Background arc (full semi-circle)
    const bgArc = d3.arc<any>()
      .innerRadius(radius - arcWidth)
      .outerRadius(radius)
      .startAngle(-Math.PI / 2)
      .endAngle(Math.PI / 2)
      .cornerRadius(4);

    g.append('path')
      .attr('d', bgArc({}) || '')
      .attr('fill', '#f0f0f0');

    // Colored arc segments (build from small arcs for gradient effect)
    const numSegments = 60;
    for (let i = 0; i < numSegments; i++) {
      const t = i / numSegments;
      const startAngle = -Math.PI / 2 + t * Math.PI;
      const endAngle = -Math.PI / 2 + ((i + 1) / numSegments) * Math.PI;
      const segColor = d3.interpolateRgb('#dddddd', '#c23030')(t);

      const segArc = d3.arc<any>()
        .innerRadius(radius - arcWidth)
        .outerRadius(radius)
        .startAngle(startAngle)
        .endAngle(endAngle);

      g.append('path')
        .attr('d', segArc({}) || '')
        .attr('fill', segColor)
        .attr('opacity', 0.75);
    }

    // Tick marks
    const tickCount = 10;
    for (let i = 0; i <= tickCount; i++) {
      const angle = -Math.PI / 2 + (i / tickCount) * Math.PI;
      const x1 = Math.cos(angle) * (radius + 4);
      const y1 = Math.sin(angle) * (radius + 4);
      const x2 = Math.cos(angle) * (radius + 10);
      const y2 = Math.sin(angle) * (radius + 10);

      g.append('line')
        .attr('x1', x1).attr('y1', y1)
        .attr('x2', x2).attr('y2', y2)
        .attr('stroke', '#1a1a1a')
        .attr('stroke-width', i % 5 === 0 ? 1.5 : 0.5)
        .attr('opacity', 0.2);
    }

    // Needle
    const needleAngle = -Math.PI / 2 + clamped * Math.PI;
    const needleLen = radius - arcWidth - 8;
    const needleColor = colorProp || '#1a1a1a';

    // Needle line (animated swing)
    const needle = g.append('line')
      .attr('x1', 0).attr('y1', 0)
      .attr('x2', 0).attr('y2', -needleLen)
      .attr('stroke', needleColor)
      .attr('stroke-width', 2.5)
      .attr('stroke-linecap', 'round')
      .attr('filter', 'url(#gauge-glow)')
      .attr('transform', `rotate(${-90})`); // start at left

    needle.transition()
      .duration(800)
      .ease(d3.easeBackOut.overshoot(0.4))
      .attr('transform', `rotate(${(needleAngle * 180) / Math.PI})`);

    // Center dot
    g.append('circle')
      .attr('cx', 0).attr('cy', 0)
      .attr('r', 5)
      .attr('fill', needleColor)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // Value text (center, large)
    const displayVal = Math.round(clamped * 100);
    g.append('text')
      .attr('x', 0).attr('y', -20)
      .attr('text-anchor', 'middle')
      .attr('font-family', '"DM Sans", sans-serif')
      .attr('font-size', 28)
      .attr('font-weight', '700')
      .attr('fill', '#1a1a1a')
      .attr('opacity', 0)
      .text(`${displayVal}%`)
      .transition()
      .duration(400)
      .delay(300)
      .attr('opacity', 1);

    // Label below value
    g.append('text')
      .attr('x', 0).attr('y', 6)
      .attr('text-anchor', 'middle')
      .attr('font-family', '"DM Sans", sans-serif')
      .attr('font-size', 11)
      .attr('fill', '#1a1a1a')
      .attr('opacity', 0.5)
      .text(label);

    // Min/max labels
    g.append('text')
      .attr('x', -(radius + 5)).attr('y', 18)
      .attr('text-anchor', 'middle')
      .attr('font-family', '"DM Sans", sans-serif')
      .attr('font-size', 9)
      .attr('fill', '#1a1a1a')
      .attr('opacity', 0.35)
      .text(minLabel);

    g.append('text')
      .attr('x', radius + 5).attr('y', 18)
      .attr('text-anchor', 'middle')
      .attr('font-family', '"DM Sans", sans-serif')
      .attr('font-size', 9)
      .attr('fill', '#1a1a1a')
      .attr('opacity', 0.35)
      .text(maxLabel);

    // Disclaimer
    if (disclaimer) {
      g.append('text')
        .attr('x', 0).attr('y', 38)
        .attr('text-anchor', 'middle')
        .attr('font-family', '"DM Sans", sans-serif')
        .attr('font-size', 9)
        .attr('fill', '#c23030')
        .attr('opacity', 0.6)
        .attr('font-style', 'italic')
        .text(disclaimer);
    }
  }, [value, clamped, label, minLabel, maxLabel, colorProp, disclaimer, width, size, radius, arcWidth, cx, cy]);

  return <svg ref={svgRef} width={width} height={svgHeight} className="overflow-visible" />;
};

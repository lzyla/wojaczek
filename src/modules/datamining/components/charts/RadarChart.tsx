import { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { ChartWrapper } from './ChartWrapper';

interface RadarChartProps {
  axes: string[];
  values: number[];
  comparisonValues?: number[];
  maxValue?: number;
  title?: string;
  accentColor?: string;
  comparisonColor?: string;
  comparisonLabel?: string;
}

export const RadarChart = ({
  axes,
  values,
  comparisonValues,
  maxValue,
  title,
  accentColor = '#c23030',
  comparisonColor = '#999999',
  comparisonLabel = 'srednia korpusu',
}: RadarChartProps) => {
  return (
    <ChartWrapper title={title}>
      {(width) => (
        <RadarChartInner
          axes={axes}
          values={values}
          comparisonValues={comparisonValues}
          maxValue={maxValue}
          width={width}
          accentColor={accentColor}
          comparisonColor={comparisonColor}
          comparisonLabel={comparisonLabel}
        />
      )}
    </ChartWrapper>
  );
};

const RadarChartInner = ({
  axes,
  values,
  comparisonValues,
  maxValue: maxValueProp,
  width,
  accentColor,
  comparisonColor,
  comparisonLabel,
}: {
  axes: string[];
  values: number[];
  comparisonValues?: number[];
  maxValue?: number;
  width: number;
  accentColor: string;
  comparisonColor: string;
  comparisonLabel: string;
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const size = Math.min(width, 320);
  const cx = width / 2;
  const cy = size / 2;
  const radius = size / 2 - 45;
  const levels = 4;
  const maxValue = maxValueProp ?? Math.max(...values, ...(comparisonValues || []), 1);

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
    const tooltip = tooltipRef.current;

    // Defs for gradient fill
    const defs = svg.append('defs');
    const radGrad = defs.append('radialGradient').attr('id', 'radar-fill-grad');
    radGrad.append('stop').attr('offset', '0%').attr('stop-color', accentColor).attr('stop-opacity', 0.3);
    radGrad.append('stop').attr('offset', '100%').attr('stop-color', accentColor).attr('stop-opacity', 0.08);

    const g = svg.append('g').attr('transform', `translate(${cx},${cy})`);
    const angleSlice = (2 * Math.PI) / axes.length;

    // Grid circles with labels
    for (let lvl = 1; lvl <= levels; lvl++) {
      const r = (radius / levels) * lvl;
      g.append('circle')
        .attr('r', r)
        .attr('fill', 'none')
        .attr('stroke', '#1a1a1a')
        .attr('stroke-width', 0.5)
        .attr('opacity', 0.12);

      // Grid label (percentage)
      const pct = Math.round((lvl / levels) * 100);
      g.append('text')
        .attr('x', 4)
        .attr('y', -r + 3)
        .attr('font-family', '"DM Sans", sans-serif')
        .attr('font-size', 8)
        .attr('fill', '#1a1a1a')
        .attr('opacity', 0.3)
        .text(`${pct}%`);
    }

    // Axes + labels
    axes.forEach((label, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      g.append('line')
        .attr('x1', 0).attr('y1', 0)
        .attr('x2', x).attr('y2', y)
        .attr('stroke', '#1a1a1a')
        .attr('stroke-width', 0.5)
        .attr('opacity', 0.15);

      const labelR = radius + 20;
      const lx = Math.cos(angle) * labelR;
      const ly = Math.sin(angle) * labelR;

      g.append('text')
        .attr('x', lx)
        .attr('y', ly)
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('font-family', '"DM Sans", sans-serif')
        .attr('font-size', 9)
        .attr('fill', '#1a1a1a')
        .attr('opacity', 0.6)
        .text(label);
    });

    const lineGen = d3.line<[number, number]>()
      .x(d => d[0])
      .y(d => d[1])
      .curve(d3.curveLinearClosed);

    const getPoints = (vals: number[]) =>
      vals.map((v, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const r = (Math.min(v, maxValue) / maxValue) * radius;
        return [Math.cos(angle) * r, Math.sin(angle) * r] as [number, number];
      });

    const zeroPoints = values.map((_v, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      return [Math.cos(angle) * 0, Math.sin(angle) * 0] as [number, number];
    });

    // Comparison polygon (gray, behind)
    if (comparisonValues && comparisonValues.length === axes.length) {
      const compPoints = getPoints(comparisonValues);
      g.append('path')
        .datum(zeroPoints)
        .attr('d', lineGen)
        .attr('fill', comparisonColor)
        .attr('fill-opacity', 0.06)
        .attr('stroke', comparisonColor)
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '4,3')
        .attr('opacity', 0.5)
        .transition()
        .duration(600)
        .attrTween('d', function () {
          const interp = d3.interpolate(zeroPoints, compPoints);
          return (t) => lineGen(interp(t)) || '';
        });
    }

    // Main data polygon
    const points = getPoints(values);
    g.append('path')
      .datum(zeroPoints)
      .attr('d', lineGen)
      .attr('fill', 'url(#radar-fill-grad)')
      .attr('stroke', accentColor)
      .attr('stroke-width', 2)
      .transition()
      .duration(600)
      .ease(d3.easeBackOut.overshoot(0.2))
      .attrTween('d', function () {
        const interp = d3.interpolate(zeroPoints, points);
        return (t) => lineGen(interp(t)) || '';
      });

    // Data points with hover
    points.forEach(([x, y], i) => {
      g.append('circle')
        .attr('cx', 0).attr('cy', 0)
        .attr('r', 4)
        .attr('fill', '#fff')
        .attr('stroke', accentColor)
        .attr('stroke-width', 2)
        .attr('cursor', 'pointer')
        .on('mouseenter', function (event: MouseEvent) {
          d3.select(this).attr('r', 6).attr('fill', accentColor);
          let html = `<strong>${axes[i]}</strong><br/>Wartosc: ${typeof values[i] === 'number' && values[i] % 1 !== 0 ? values[i].toFixed(2) : values[i]}`;
          if (comparisonValues && comparisonValues[i] !== undefined) {
            html += `<br/><span style="color:${comparisonColor}">${comparisonLabel}: ${typeof comparisonValues[i] === 'number' && comparisonValues[i] % 1 !== 0 ? comparisonValues[i].toFixed(2) : comparisonValues[i]}</span>`;
          }
          tooltip.innerHTML = html;
          tooltip.style.opacity = '1';
          tooltip.style.left = `${event.clientX + 12}px`;
          tooltip.style.top = `${event.clientY - 10}px`;
        })
        .on('mousemove', function (event: MouseEvent) {
          tooltip.style.left = `${event.clientX + 12}px`;
          tooltip.style.top = `${event.clientY - 10}px`;
        })
        .on('mouseleave', function () {
          d3.select(this).attr('r', 4).attr('fill', '#fff');
          tooltip.style.opacity = '0';
        })
        .transition()
        .duration(600)
        .delay(i * 30)
        .attr('cx', x)
        .attr('cy', y);
    });

    return () => {
      if (tooltipRef.current) tooltipRef.current.style.opacity = '0';
    };
  }, [axes, values, comparisonValues, maxValue, width, size, cx, cy, radius, levels, accentColor, comparisonColor, comparisonLabel]);

  useEffect(() => {
    return () => {
      if (tooltipRef.current && tooltipRef.current.parentNode) {
        tooltipRef.current.parentNode.removeChild(tooltipRef.current);
        tooltipRef.current = null;
      }
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={size}
      className="overflow-visible"
    />
  );
};

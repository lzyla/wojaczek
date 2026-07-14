import { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { ChartWrapper } from './ChartWrapper';

interface PieChartProps {
  data: { label: string; value: number }[];
  title?: string;
  centerLabel?: string;
  colorful?: boolean;
}

const PALETTE = ['#c23030', '#333333', '#555555', '#777777', '#999999', '#bbbbbb', '#dddddd'];

export const PieChart = ({ data, title, centerLabel }: PieChartProps) => {
  return (
    <ChartWrapper title={title}>
      {(width) => <PieChartInner data={data} width={width} centerLabel={centerLabel} />}
    </ChartWrapper>
  );
};

const PieChartInner = ({
  data,
  width,
  centerLabel,
}: {
  data: { label: string; value: number }[];
  width: number;
  centerLabel?: string;
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const size = Math.min(width, 340);
  const radius = size / 2;
  const innerRadius = radius * 0.48;
  const labelRadius = radius - 8;
  const total = data.reduce((s, d) => s + d.value, 0);

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

    const g = svg.append('g').attr('transform', `translate(${width / 2},${size / 2})`);

    const colorScale = d3.scaleOrdinal<string>()
      .domain(data.map(d => d.label))
      .range(PALETTE);

    const pieGen = d3.pie<{ label: string; value: number }>()
      .value(d => d.value)
      .sort(null)
      .padAngle(0.02);

    const arcGen = d3.arc<d3.PieArcDatum<{ label: string; value: number }>>()
      .innerRadius(innerRadius)
      .outerRadius(radius - 24);

    const arcHover = d3.arc<d3.PieArcDatum<{ label: string; value: number }>>()
      .innerRadius(innerRadius - 2)
      .outerRadius(radius - 18);

    const labelArcGen = d3.arc<d3.PieArcDatum<{ label: string; value: number }>>()
      .innerRadius(labelRadius)
      .outerRadius(labelRadius);

    const arcs = pieGen(data);

    // Segments with animated entrance
    g.selectAll('path.arc')
      .data(arcs)
      .join('path')
      .attr('class', 'arc')
      .attr('fill', d => colorScale(d.data.label))
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .attr('cursor', 'pointer')
      .on('mouseenter', function (event: MouseEvent, d: any) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', arcHover(d) || '');
        const pct = total > 0 ? ((d.data.value / total) * 100).toFixed(1) : '0';
        tooltip.innerHTML = `<strong>${d.data.label}</strong><br/>Wartosc: ${d.data.value}<br/>${pct}%`;
        tooltip.style.opacity = '1';
        tooltip.style.left = `${event.clientX + 12}px`;
        tooltip.style.top = `${event.clientY - 10}px`;
      })
      .on('mousemove', function (event: MouseEvent) {
        tooltip.style.left = `${event.clientX + 12}px`;
        tooltip.style.top = `${event.clientY - 10}px`;
      })
      .on('mouseleave', function (_event: MouseEvent, d: any) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', arcGen(d) || '');
        tooltip.style.opacity = '0';
      })
      .transition()
      .duration(600)
      .attrTween('d', function (d) {
        const interp = d3.interpolate(
          { startAngle: d.startAngle, endAngle: d.startAngle },
          d
        );
        return (t) => arcGen(interp(t) as any) || '';
      });

    // Leader lines + outside labels (delayed)
    setTimeout(() => {
      arcs.forEach((d) => {
        const midAngle = (d.startAngle + d.endAngle) / 2;
        const innerPt = arcGen.centroid(d);
        const outerPt = labelArcGen.centroid(d);
        const isRight = midAngle < Math.PI;
        const tipX = outerPt[0] + (isRight ? 12 : -12);
        const tipY = outerPt[1];

        g.append('polyline')
          .attr('points', `${innerPt[0]},${innerPt[1]} ${outerPt[0]},${outerPt[1]} ${tipX},${tipY}`)
          .attr('fill', 'none')
          .attr('stroke', '#1a1a1a')
          .attr('stroke-width', 0.7)
          .attr('opacity', 0)
          .transition()
          .duration(300)
          .attr('opacity', 0.25);

        const pct = total > 0 ? ((d.data.value / total) * 100).toFixed(0) : '0';
        g.append('text')
          .attr('x', tipX + (isRight ? 4 : -4))
          .attr('y', tipY)
          .attr('dy', '0.35em')
          .attr('text-anchor', isRight ? 'start' : 'end')
          .attr('font-family', '"DM Sans", sans-serif')
          .attr('font-size', 10)
          .attr('fill', '#1a1a1a')
          .attr('opacity', 0)
          .text(`${d.data.label} (${pct}%)`)
          .transition()
          .duration(300)
          .attr('opacity', 0.6);
      });
    }, 650);

    // Center total
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.2em')
      .attr('font-family', '"DM Sans", sans-serif')
      .attr('font-size', 22)
      .attr('font-weight', '700')
      .attr('fill', '#1a1a1a')
      .text(total);

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.4em')
      .attr('font-family', '"DM Sans", sans-serif')
      .attr('font-size', 9)
      .attr('fill', '#1a1a1a')
      .attr('opacity', 0.4)
      .text(centerLabel || 'razem');

    return () => {
      if (tooltipRef.current) tooltipRef.current.style.opacity = '0';
    };
  }, [data, width, size, radius, innerRadius, labelRadius, total, centerLabel]);

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
      height={size + 10}
      className="overflow-visible"
    />
  );
};

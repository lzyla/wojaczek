import { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { ChartWrapper } from './ChartWrapper';

interface HistogramChartProps {
  data: number[];
  xLabel?: string;
  title?: string;
}

export const HistogramChart = ({ data, xLabel, title }: HistogramChartProps) => {
  return (
    <ChartWrapper title={title}>
      {(width) => <HistogramInner data={data} xLabel={xLabel} width={width} />}
    </ChartWrapper>
  );
};

const HistogramInner = ({
  data,
  xLabel,
  width,
}: {
  data: number[];
  xLabel?: string;
  width: number;
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const margin = { top: 10, right: 20, bottom: 40, left: 40 };
  const height = 200;

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // If data is a distribution array (index = value, content = count), use directly
    // If data is raw values, bin them
    let barData: { x: number; count: number }[];

    if (data.every((v) => Number.isInteger(v) && v >= 0)) {
      // Treat as distribution: index = bucket, value = count
      barData = data.map((count, i) => ({ x: i, count }));
      // Remove trailing zeros
      while (barData.length > 0 && barData[barData.length - 1].count === 0) barData.pop();
      // Remove leading zeros
      while (barData.length > 0 && barData[0].count === 0) barData.shift();
    } else {
      barData = data.map((v, i) => ({ x: i, count: v }));
    }

    if (barData.length === 0) return;

    const xScale = d3.scaleBand()
      .domain(barData.map((d) => String(d.x)))
      .range([0, innerW])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(barData, (d) => d.count) || 1])
      .range([innerH, 0]);

    // Bars
    g.selectAll('rect')
      .data(barData)
      .join('rect')
      .attr('x', (d) => xScale(String(d.x)) || 0)
      .attr('y', innerH)
      .attr('width', xScale.bandwidth())
      .attr('height', 0)
      .attr('fill', (_d: any, i: number) => {
        const maxCount = d3.max(barData, bd => bd.count) || 1;
        return barData[i].count === maxCount ? '#c23030' : '#333333';
      })
      .transition()
      .duration(500)
      .delay((_d: any, i: number) => i * 20)
      .attr('y', (d: any) => yScale(d.count))
      .attr('height', (d: any) => innerH - yScale(d.count));

    // X axis
    const xAxis = d3.axisBottom(xScale).tickSize(0);
    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(xAxis)
      .selectAll('text')
      .attr('font-family', 'monospace')
      .attr('font-size', 9)
      .attr('opacity', 0.5);

    g.select('.domain').attr('stroke', '#1a1a1a').attr('opacity', 0.2);

    // Y axis
    const yAxis = d3.axisLeft(yScale).ticks(4).tickSize(-innerW);
    g.append('g')
      .call(yAxis)
      .selectAll('text')
      .attr('font-family', 'monospace')
      .attr('font-size', 9)
      .attr('opacity', 0.5);

    g.selectAll('.tick line').attr('stroke', '#1a1a1a').attr('opacity', 0.08);
    g.select('.domain').remove();

    // X label
    if (xLabel) {
      g.append('text')
        .attr('x', innerW / 2)
        .attr('y', innerH + 32)
        .attr('text-anchor', 'middle')
        .attr('font-family', 'monospace')
        .attr('font-size', 9)
        .attr('fill', '#1a1a1a')
        .attr('opacity', 0.4)
        .text(xLabel);
    }
  }, [data, width, xLabel]);

  return (
    <svg ref={svgRef} width={width} height={height} className="overflow-visible" />
  );
};

// Comparison Bar Chart Component
// D3.js bar chart for side-by-side algorithm metric comparison

import React, { useRef, useEffect, memo } from 'react';
import * as d3 from 'd3';

const METRIC_LABELS = {
  avgTurnaroundTime: 'Avg Turnaround Time',
  avgWaitingTime: 'Avg Waiting Time',
  avgResponseTime: 'Avg Response Time',
  cpuUtilization: 'CPU Utilization (%)',
  throughput: 'Throughput (proc/unit)',
};

const ALGO_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#06b6d4', '#3b82f6', '#f97316',
];

function ComparisonBarChartInner({ results }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!results || results.length === 0 || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const containerWidth = svgRef.current.parentElement?.clientWidth || 600;
    const margin = { top: 30, right: 20, bottom: 50, left: 60 };
    const width = containerWidth - margin.left - margin.right;
    const metrics = ['avgTurnaroundTime', 'avgWaitingTime', 'avgResponseTime', 'cpuUtilization'];

    const chartHeight = 180;
    const totalHeight = metrics.length * (chartHeight + 60);

    svg.attr('width', containerWidth).attr('height', totalHeight);

    metrics.forEach((metricKey, chartIdx) => {
      const g = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${chartIdx * (chartHeight + 60) + margin.top})`);

      const data = results.map((r, i) => ({
        name: r.algorithm || r.algorithmName,
        value: r.metrics?.[metricKey] ?? 0,
        color: ALGO_COLORS[i % ALGO_COLORS.length],
      }));

      const x = d3.scaleBand()
        .domain(data.map(d => d.name))
        .range([0, width])
        .padding(0.3);

      const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value) * 1.15 || 1])
        .range([chartHeight, 0]);

      // Title
      g.append('text')
        .attr('x', width / 2)
        .attr('y', -10)
        .attr('text-anchor', 'middle')
        .attr('fill', 'var(--text-primary)')
        .style('font-size', '0.85rem')
        .style('font-weight', '600')
        .text(METRIC_LABELS[metricKey] || metricKey);

      // Bars with animation
      g.selectAll('.bar')
        .data(data)
        .join('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.name))
        .attr('width', x.bandwidth())
        .attr('y', chartHeight)
        .attr('height', 0)
        .attr('fill', d => d.color)
        .attr('rx', 4)
        .transition()
        .duration(600)
        .delay((_, i) => i * 80)
        .attr('y', d => y(d.value))
        .attr('height', d => chartHeight - y(d.value));

      // Value labels
      g.selectAll('.value-label')
        .data(data)
        .join('text')
        .attr('class', 'value-label')
        .attr('x', d => x(d.name) + x.bandwidth() / 2)
        .attr('y', d => y(d.value) - 5)
        .attr('text-anchor', 'middle')
        .attr('fill', 'var(--text-secondary)')
        .style('font-size', '0.7rem')
        .style('font-weight', '600')
        .text(d => d.value.toFixed(metricKey === 'cpuUtilization' ? 1 : 2));

      // X axis
      g.append('g')
        .attr('transform', `translate(0, ${chartHeight})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .attr('fill', 'var(--text-secondary)')
        .style('font-size', '0.7rem')
        .attr('transform', 'rotate(-20)')
        .style('text-anchor', 'end');

      g.selectAll('.domain, .tick line')
        .attr('stroke', 'var(--border-color)');

      // Y axis
      g.append('g')
        .call(d3.axisLeft(y).ticks(4))
        .selectAll('text')
        .attr('fill', 'var(--text-secondary)')
        .style('font-size', '0.7rem');

      g.selectAll('.domain, .tick line')
        .attr('stroke', 'var(--border-color)');
    });
  }, [results]);

  if (!results || results.length === 0) return null;

  return (
    <div className="comparison-bar-chart">
      <h3 style={{ marginBottom: '12px', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
        📊 Metric Comparison Charts
      </h3>
      <div style={{ overflowX: 'auto' }}>
        <svg ref={svgRef} />
      </div>
    </div>
  );
}

export const ComparisonBarChart = memo(ComparisonBarChartInner);
export default ComparisonBarChart;

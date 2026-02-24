// Gantt Chart Component using D3.js
// Real-time visualization with enter/update/exit pattern and zoom/pan

import React, { useRef, useEffect, useMemo, useState } from 'react';
import * as d3 from 'd3';
import { useSimulation } from '../context/SimulationContext.jsx';
import './GanttChart.css';

// Color palette for processes
const PROCESS_COLORS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#f97316', // Orange
  '#84cc16', // Lime
  '#ef4444', // Red
];

const CONTEXT_SWITCH_COLOR = '#334155';
const IDLE_COLOR = '#1e293b';

export function GanttChart({ data, processes }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const tooltipRef = useRef(null);
  const wrapperRef = useRef(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [autoScroll, setAutoScroll] = useState(true);
  
  const chartData = useMemo(() => {
    return data || [];
  }, [data]);

  const processColorMap = useMemo(() => {
    const map = {};
    (processes || []).forEach((p, i) => {
      map[p.pid] = PROCESS_COLORS[i % PROCESS_COLORS.length];
    });
    return map;
  }, [processes]);

  // Calculate dynamic width based on data and zoom
  const dynamicWidth = useMemo(() => {
    const minWidth = 800;
    const maxTime = chartData.length > 0 ? Math.max(...chartData.map(d => d.endTime || 0)) : 0;
    const calculatedWidth = Math.max(minWidth, maxTime * 35 * zoomLevel);
    return calculatedWidth;
  }, [chartData, zoomLevel]);

  // Auto-scroll to end when new data arrives
  useEffect(() => {
    if (autoScroll && containerRef.current && chartData.length > 0) {
      containerRef.current.scrollLeft = containerRef.current.scrollWidth;
    }
  }, [chartData.length, autoScroll]);

  useEffect(() => {
    if (!svgRef.current || chartData.length === 0) return;

    const margin = { top: 40, right: 30, bottom: 50, left: 80 };
    const height = 120;
    const innerWidth = dynamicWidth - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', dynamicWidth)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Determine time range
    const maxTime = d3.max(chartData, d => d.endTime) || 1;

    // X Scale (Time)
    const xScale = d3.scaleLinear()
      .domain([0, maxTime])
      .range([0, innerWidth]);

    // X Axis
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .ticks(Math.min(maxTime, Math.floor(innerWidth / 40)))
        .tickFormat(d => d));

    // X Axis Label
    svg.append('text')
      .attr('class', 'axis-label')
      .attr('x', dynamicWidth / 2)
      .attr('y', height - 5)
      .attr('text-anchor', 'middle')
      .text('Time (units)');

    // Y Axis Label
    svg.append('text')
      .attr('class', 'axis-label')
      .attr('x', 15)
      .attr('y', margin.top + innerHeight / 2)
      .attr('text-anchor', 'middle')
      .attr('transform', `rotate(-90, 15, ${margin.top + innerHeight / 2})`)
      .text('CPU');

    // Tooltip
    const tooltip = d3.select(tooltipRef.current);

    // Draw bars using data join pattern
    const bars = g.selectAll('.gantt-bar')
      .data(chartData, d => `${d.startTime}-${d.pid || d.type}`);

    // Enter
    const barsEnter = bars.enter()
      .append('g')
      .attr('class', 'gantt-bar');

    barsEnter.append('rect')
      .attr('class', 'bar-rect')
      .attr('x', d => xScale(d.startTime))
      .attr('y', 0)
      .attr('width', d => Math.max(2, xScale(d.endTime) - xScale(d.startTime) - 1))
      .attr('height', innerHeight)
      .attr('rx', 4)
      .attr('fill', d => {
        if (d.type === 'CONTEXT_SWITCH') return CONTEXT_SWITCH_COLOR;
        if (d.type === 'IDLE') return IDLE_COLOR;
        return processColorMap[d.pid] || PROCESS_COLORS[0];
      })
      .attr('stroke', d => {
        if (d.type === 'PROCESS') return 'rgba(255,255,255,0.2)';
        return 'rgba(255,255,255,0.1)';
      })
      .attr('stroke-width', 1)
      .style('opacity', 1)
      .on('mouseenter', function(event, d) {
        
        let content = '';
        if (d.type === 'PROCESS') {
          content = `<strong>P${d.pid}</strong><br/>Time: ${d.startTime} - ${d.endTime}<br/>Duration: ${d.endTime - d.startTime}`;
          if (d.queueLevel !== undefined) {
            content += `<br/>Queue: ${d.queueLevel + 1}`;
          }
        } else if (d.type === 'CONTEXT_SWITCH') {
          content = `<strong>Context Switch</strong><br/>Time: ${d.startTime} - ${d.endTime}`;
        } else {
          content = `<strong>CPU Idle</strong><br/>Time: ${d.startTime} - ${d.endTime}`;
        }
        
        // Calculate position relative to container
        const containerRect = wrapperRef.current ? wrapperRef.current.getBoundingClientRect() : { left: 0, top: 0 };
        const x = event.clientX - containerRect.left;
        const y = event.clientY - containerRect.top;

        tooltip
          .style('opacity', 1)
          .html(content)
          .style('left', `${x + 10}px`)
          .style('top', `${y + 20}px`);
      })
      .on('mousemove', function(event) {
        const containerRect = wrapperRef.current ? wrapperRef.current.getBoundingClientRect() : { left: 0, top: 0 };
        const x = event.clientX - containerRect.left;
        const y = event.clientY - containerRect.top;

        tooltip
          .style('left', `${x + 10}px`)
          .style('top', `${y + 20}px`);
      })
      .on('mouseleave', function() {
        tooltip.style('opacity', 0);
      });

    // Add process label inside bar
    barsEnter.append('text')
      .attr('class', 'bar-label')
      .attr('x', d => xScale(d.startTime) + Math.max(2, xScale(d.endTime) - xScale(d.startTime) - 1) / 2)
      .attr('y', innerHeight / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .text(d => {
        const barWidth = xScale(d.endTime) - xScale(d.startTime);
        if (d.type === 'PROCESS' && barWidth >= 20) return `P${d.pid}`;
        if (d.type === 'CONTEXT_SWITCH' && barWidth >= 20) return 'CS';
        return '';
      })
      .style('pointer-events', 'none');

    // Update (merge enter + update)
    bars.merge(barsEnter)
      .select('.bar-rect')
      .transition()
      .duration(200)
      .attr('x', d => xScale(d.startTime))
      .attr('width', d => Math.max(2, xScale(d.endTime) - xScale(d.startTime) - 1));

    // Exit
    bars.exit()
      .transition()
      .duration(200)
      .style('opacity', 0)
      .remove();

  }, [chartData, processColorMap, dynamicWidth, zoomLevel]);

  const handleZoomIn = () => setZoomLevel(z => Math.min(z * 1.5, 4));
  const handleZoomOut = () => setZoomLevel(z => Math.max(z / 1.5, 0.5));
  const handleZoomReset = () => setZoomLevel(1);

  return (
    <div className="gantt-chart-container" ref={wrapperRef}>
      <div className="gantt-header">
        <h3>CPU Gantt Chart</h3>
        <div className="gantt-controls">
          {chartData.length > 0 && (
            <span className="gantt-info">
              Total: {chartData[chartData.length - 1]?.endTime || 0} time units
            </span>
          )}
          <div className="zoom-controls">
            <button 
              className="zoom-btn" 
              onClick={handleZoomOut}
              title="Zoom Out"
              disabled={zoomLevel <= 0.5}
            >
              −
            </button>
            <span className="zoom-level">{Math.round(zoomLevel * 100)}%</span>
            <button 
              className="zoom-btn" 
              onClick={handleZoomIn}
              title="Zoom In"
              disabled={zoomLevel >= 4}
            >
              +
            </button>
            <button 
              className="zoom-btn reset" 
              onClick={handleZoomReset}
              title="Reset Zoom"
            >
              ⟲
            </button>
          </div>
          <label className="auto-scroll-toggle">
            <input 
              type="checkbox" 
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
            />
            <span>Auto-scroll</span>
          </label>
        </div>
      </div>
      
      <div className="gantt-scroll-container" ref={containerRef}>
        <svg ref={svgRef} />
      </div>
      
      <div ref={tooltipRef} className="gantt-tooltip" />
      
      {/* Legend */}
      <div className="gantt-legend">
        {processes?.slice(0, 10).map((p, i) => (
          <div key={p.pid} className="legend-item">
            <span 
              className="legend-color" 
              style={{ background: PROCESS_COLORS[i % PROCESS_COLORS.length] }}
            />
            <span className="legend-label">P{p.pid}</span>
          </div>
        ))}
        {processes?.length > 10 && (
          <div className="legend-item">
            <span className="legend-label">+{processes.length - 10} more</span>
          </div>
        )}
        <div className="legend-item">
          <span className="legend-color context-switch" />
          <span className="legend-label">Context Switch</span>
        </div>
        <div className="legend-item">
          <span className="legend-color idle" />
          <span className="legend-label">Idle</span>
        </div>
      </div>
    </div>
  );
}

// Wrapper component to use with context
export function GanttChartContainer() {
  const { state } = useSimulation();
  
  const chartData = state.simulationState === 'COMPLETED' 
    ? state.fullGanttChart 
    : state.ganttChart;

  return (
    <GanttChart 
      data={chartData}
      processes={state.processInputs}
    />
  );
}

export default GanttChart;

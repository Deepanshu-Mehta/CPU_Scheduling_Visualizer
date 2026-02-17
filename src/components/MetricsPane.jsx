// Metrics Pane Component
// Displays AWT, ATAT, CPU Utilization, and other metrics

import React from 'react';
import { useSimulation } from '../context/SimulationContext.jsx';
import { SimulationState } from '../simulation/SimulationController.js';
import './MetricsPane.css';

export function MetricsPane() {
  const { state } = useSimulation();

  const metrics = state.metrics || {};
  const isCompleted = state.simulationState === SimulationState.COMPLETED;

  const formatNumber = (num, decimals = 2) => {
    if (num === undefined || num === null) return '—';
    return Number(num).toFixed(decimals);
  };

  const metricsData = [
    {
      label: 'Avg Turnaround Time',
      value: formatNumber(metrics.avgTurnaroundTime),
      unit: 'units',
      icon: '⏱',
      color: 'primary',
      description: 'Average time from arrival to completion',
    },
    {
      label: 'Avg Waiting Time',
      value: formatNumber(metrics.avgWaitingTime),
      unit: 'units',
      icon: '⏳',
      color: 'secondary',
      description: 'Average time spent in Ready queue',
    },
    {
      label: 'Avg Response Time',
      value: formatNumber(metrics.avgResponseTime),
      unit: 'units',
      icon: '⚡',
      color: 'warning',
      description: 'Average time to first CPU access',
    },
    {
      label: 'CPU Utilization',
      value: formatNumber(metrics.cpuUtilization, 1),
      unit: '%',
      icon: '📊',
      color: 'success',
      description: 'Percentage of time CPU was busy',
    },
    {
      label: 'Throughput',
      value: formatNumber(metrics.throughput, 3),
      unit: 'proc/unit',
      icon: '🔄',
      color: 'info',
      description: 'Processes completed per time unit',
    },
  ];

  const additionalMetrics = [
    {
      label: 'Total Time',
      value: metrics.totalTime || state.currentTime,
      unit: 'units',
    },
    {
      label: 'Context Switches',
      value: metrics.contextSwitches || 0,
      unit: '',
    },
    {
      label: 'Processes',
      value: state.processInputs?.length || 0,
      unit: '',
    },
  ];

  return (
    <div className="metrics-pane">
      <div className="metrics-header">
        <h3>Performance Metrics</h3>
        {!isCompleted && state.simulationState !== SimulationState.IDLE && (
          <span className="calculating-badge">Calculating...</span>
        )}
      </div>

      <div className="metrics-grid">
        {metricsData.map((metric, index) => (
          <div key={index} className={`metric-card ${metric.color}`}>
            <div className="metric-icon">{metric.icon}</div>
            <div className="metric-content">
              <div className="metric-value">
                {metric.value}
                <span className="metric-unit">{metric.unit}</span>
              </div>
              <div className="metric-label">{metric.label}</div>
            </div>
          </div>
        ))}
      </div>

      {isCompleted && (
        <div className="additional-metrics">
          {additionalMetrics.map((metric, index) => (
            <div key={index} className="additional-metric">
              <span className="additional-label">{metric.label}:</span>
              <span className="additional-value">
                {metric.value} {metric.unit}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Formulas reference */}
      <div className="formulas-section">
        <details>
          <summary>Metric Formulas</summary>
          <div className="formulas-content">
            <p><strong>Turnaround Time</strong> = Completion Time − Arrival Time</p>
            <p><strong>Waiting Time</strong> = Turnaround Time − Total CPU Burst</p>
            <p><strong>Response Time</strong> = First CPU Access − Arrival Time</p>
            <p><strong>CPU Utilization</strong> = (CPU Busy Time / Total Time) × 100%</p>
            <p><strong>Throughput</strong> = Completed Processes / Total Time</p>
          </div>
        </details>
      </div>
    </div>
  );
}

export default MetricsPane;

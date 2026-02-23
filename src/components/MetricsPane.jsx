// Metrics Pane Component
// Displays AWT, ATAT, CPU Utilization, Throughput, and other metrics

import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext.jsx';
import { SimulationState } from '../simulation/SimulationController.js';
import './MetricsPane.css';

export function MetricsPane() {
  const { state } = useSimulation();
  const [showPerProcess, setShowPerProcess] = useState(false);

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
      unit: 'p/unit',
      icon: '🔄',
      color: 'info',
      description: 'Processes completed per time unit',
    },
    {
      label: 'Avg Completion Time',
      value: formatNumber(metrics.avgCompletionTime),
      unit: 'units',
      icon: '🏁',
      color: 'danger',
      description: 'Average absolute completion time',
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
      value: metrics.contextSwitches ?? 0,
      unit: '',
    },
    {
      label: 'Processes',
      value: state.processInputs?.length || 0,
      unit: '',
    },
    {
      label: 'Idle Time',
      value: metrics.idleTime ?? '—',
      unit: metrics.idleTime !== undefined ? 'units' : '',
    },
    {
      label: 'Max Wait',
      value: formatNumber(metrics.maxWaitingTime),
      unit: 'units',
    },
    {
      label: 'Max Response',
      value: formatNumber(metrics.maxResponseTime),
      unit: 'units',
    },
    {
      label: 'Schedule Length',
      value: metrics.schedulingLength ?? '—',
      unit: metrics.schedulingLength !== undefined ? 'units' : '',
    },
  ];

  const perProcess = metrics.perProcess || [];

  // For bar chart visualization
  const maxTat = perProcess.length > 0
    ? Math.max(...perProcess.map(p => p.turnaroundTime), 1)
    : 1;

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

      {/* Per-process breakdown */}
      {isCompleted && perProcess.length > 0 && (
        <div className="per-process-section">
          <button
            className="per-process-toggle"
            onClick={() => setShowPerProcess(!showPerProcess)}
          >
            <span className="toggle-icon">{showPerProcess ? '▾' : '▸'}</span>
            Per-Process Breakdown
          </button>
          {showPerProcess && (
            <div className="per-process-content">
              <div className="per-process-table-wrapper">
                <table className="per-process-table">
                  <thead>
                    <tr>
                      <th>PID</th>
                      <th>Arrival</th>
                      <th>Burst</th>
                      <th>Completion</th>
                      <th>TAT</th>
                      <th>Waiting</th>
                      <th>Response</th>
                    </tr>
                  </thead>
                  <tbody>
                    {perProcess.map((p, i) => (
                      <tr key={i}>
                        <td className="pid-cell">P{p.pid}</td>
                        <td>{p.arrivalTime}</td>
                        <td>{p.burstTime}</td>
                        <td>{p.completionTime}</td>
                        <td>{formatNumber(p.turnaroundTime)}</td>
                        <td>{formatNumber(p.waitingTime)}</td>
                        <td>{formatNumber(p.responseTime)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="per-process-bars">
                <div className="bars-header">Turnaround Time Comparison</div>
                {perProcess.map((p, i) => (
                  <div key={i} className="bar-row">
                    <span className="bar-label">P{p.pid}</span>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{ width: `${(p.turnaroundTime / maxTat) * 100}%` }}
                      >
                        <span className="bar-value">{formatNumber(p.turnaroundTime)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
            <p><strong>Throughput</strong> = Total Processes / Total Time</p>
            <p><strong>Avg Completion</strong> = Σ Completion Time / n</p>
            <p><strong>Idle Time</strong> = Total Time − CPU Busy Time</p>
            <p><strong>Schedule Length</strong> = Total Time − min(Arrival Time)</p>
          </div>
        </details>
      </div>
    </div>
  );
}

export default MetricsPane;

// Comparison Dashboard Component
// Side-by-side comparison of multiple algorithms

import React from 'react';
import { useSimulation } from '../context/SimulationContext.jsx';
import { GanttChart } from '../visualization/GanttChart.jsx';
import './ComparisonDashboard.css';

export function ComparisonDashboard() {
  const {
    state,
    algorithmList,
    setComparisonAlgorithms,
    runComparison,
  } = useSimulation();

  const handleAlgorithmToggle = (key) => {
    const current = state.comparisonAlgorithms;
    if (current.includes(key)) {
      if (current.length > 1) {
        setComparisonAlgorithms(current.filter(k => k !== key));
      }
    } else {
      setComparisonAlgorithms([...current, key]);
    }
  };

  const formatNumber = (num, decimals = 2) => {
    if (num === undefined || num === null) return '—';
    return Number(num).toFixed(decimals);
  };

  const getBestValue = (metric, results) => {
    const values = Object.values(results).map(r => r.metrics[metric]);
    if (metric === 'cpuUtilization') {
      return Math.max(...values);
    }
    return Math.min(...values.filter(v => v !== undefined));
  };

  return (
    <div className="comparison-dashboard">
      <div className="comparison-header">
        <h3>Algorithm Comparison</h3>
        <p className="comparison-hint">
          Compare performance of different scheduling algorithms on the same dataset
        </p>
      </div>

      {/* Algorithm Selection */}
      <div className="algorithm-selection">
        <h4>Select Algorithms to Compare</h4>
        <div className="algorithm-checkboxes">
          {algorithmList.map((algo) => (
            <label key={algo.key} className="checkbox-item">
              <input
                type="checkbox"
                checked={state.comparisonAlgorithms.includes(algo.key)}
                onChange={() => handleAlgorithmToggle(algo.key)}
              />
              <span className="checkbox-label">{algo.shortName}</span>
            </label>
          ))}
        </div>
        <button 
          className="compare-btn"
          onClick={runComparison}
          disabled={state.comparisonAlgorithms.length < 2}
        >
          Run Comparison
        </button>
      </div>

      {/* Comparison Results */}
      {state.comparisonResults && (
        <div className="comparison-results">
          {/* Metrics Comparison Table */}
          <div className="metrics-comparison">
            <h4>Performance Metrics</h4>
            <div className="comparison-table-container">
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th>Metric</th>
                    {Object.entries(state.comparisonResults).map(([key, result]) => (
                      <th key={key}>{result.algorithmShortName}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Avg Turnaround Time</td>
                    {Object.entries(state.comparisonResults).map(([key, result]) => {
                      const isBest = result.metrics.avgTurnaroundTime === 
                        getBestValue('avgTurnaroundTime', state.comparisonResults);
                      return (
                        <td key={key} className={isBest ? 'best-value' : ''}>
                          {formatNumber(result.metrics.avgTurnaroundTime)}
                          {isBest && <span className="best-badge">Best</span>}
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td>Avg Waiting Time</td>
                    {Object.entries(state.comparisonResults).map(([key, result]) => {
                      const isBest = result.metrics.avgWaitingTime === 
                        getBestValue('avgWaitingTime', state.comparisonResults);
                      return (
                        <td key={key} className={isBest ? 'best-value' : ''}>
                          {formatNumber(result.metrics.avgWaitingTime)}
                          {isBest && <span className="best-badge">Best</span>}
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td>Avg Response Time</td>
                    {Object.entries(state.comparisonResults).map(([key, result]) => {
                      const isBest = result.metrics.avgResponseTime === 
                        getBestValue('avgResponseTime', state.comparisonResults);
                      return (
                        <td key={key} className={isBest ? 'best-value' : ''}>
                          {formatNumber(result.metrics.avgResponseTime)}
                          {isBest && <span className="best-badge">Best</span>}
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td>CPU Utilization (%)</td>
                    {Object.entries(state.comparisonResults).map(([key, result]) => {
                      const isBest = result.metrics.cpuUtilization === 
                        getBestValue('cpuUtilization', state.comparisonResults);
                      return (
                        <td key={key} className={isBest ? 'best-value' : ''}>
                          {formatNumber(result.metrics.cpuUtilization, 1)}%
                          {isBest && <span className="best-badge">Best</span>}
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td>Total Time</td>
                    {Object.entries(state.comparisonResults).map(([key, result]) => (
                      <td key={key}>{result.metrics.totalTime}</td>
                    ))}
                  </tr>
                  <tr>
                    <td>Context Switches</td>
                    {Object.entries(state.comparisonResults).map(([key, result]) => (
                      <td key={key}>{result.metrics.contextSwitches}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Gantt Charts */}
          <div className="gantt-comparison">
            <h4>Gantt Charts</h4>
            <div className="gantt-charts-grid">
              {Object.entries(state.comparisonResults).map(([key, result]) => (
                <div key={key} className="gantt-chart-item">
                  <h5>{result.algorithmName}</h5>
                  <GanttChart 
                    data={result.ganttChart}
                    processes={state.processInputs}
                    width={600}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ComparisonDashboard;

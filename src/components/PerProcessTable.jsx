// Per-Process Metrics Table Component
// Shows detailed per-process metrics after simulation completes

import React, { memo } from 'react';
import { useSimulation } from '../context/SimulationContext.jsx';
import { SimulationState } from '../simulation/SimulationController.js';
import './PerProcessTable.css';

function PerProcessTableInner() {
  const { state } = useSimulation();

  const isCompleted = state.simulationState === SimulationState.COMPLETED;
  const processes = state.processStates || [];

  if (!isCompleted || processes.length === 0) {
    return null;
  }

  return (
    <div className="per-process-table">
      <div className="ppt-header">
        <h3>Per-Process Metrics</h3>
        <span className="ppt-algo">{state.algorithmName || state.selectedAlgorithm}</span>
      </div>

      <div className="ppt-container">
        <table>
          <thead>
            <tr>
              <th>PID</th>
              <th>Arrival</th>
              <th>CPU Burst</th>
              <th>Priority</th>
              <th>Completion</th>
              <th>Turnaround</th>
              <th>Waiting</th>
              <th>Response</th>
            </tr>
          </thead>
          <tbody>
            {processes.map((p) => (
              <tr key={p.pid}>
                <td><span className="ppt-pid">P{p.pid}</span></td>
                <td>{p.arrivalTime}</td>
                <td>{p.totalCpuBurstTime}</td>
                <td>{p.originalPriority ?? p.priority ?? 0}</td>
                <td>{p.completionTime !== -1 ? p.completionTime : '—'}</td>
                <td>
                  {p.turnaroundTime !== undefined && p.turnaroundTime !== -1
                    ? p.turnaroundTime
                    : '—'}
                </td>
                <td>
                  {p.calculatedWaitTime !== undefined && p.calculatedWaitTime !== -1
                    ? p.calculatedWaitTime
                    : '—'}
                </td>
                <td>{p.responseTime !== -1 ? p.responseTime : '—'}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={4}><strong>Averages</strong></td>
              <td>—</td>
              <td>
                <strong>
                  {state.metrics?.avgTurnaroundTime !== undefined
                    ? state.metrics.avgTurnaroundTime.toFixed(2)
                    : '—'}
                </strong>
              </td>
              <td>
                <strong>
                  {state.metrics?.avgWaitingTime !== undefined
                    ? state.metrics.avgWaitingTime.toFixed(2)
                    : '—'}
                </strong>
              </td>
              <td>
                <strong>
                  {state.metrics?.avgResponseTime !== undefined
                    ? state.metrics.avgResponseTime.toFixed(2)
                    : '—'}
                </strong>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export const PerProcessTable = memo(PerProcessTableInner);
export default PerProcessTable;

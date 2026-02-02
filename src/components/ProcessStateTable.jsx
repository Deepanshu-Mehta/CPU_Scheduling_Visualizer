// Process State Table Component
// Shows current state of all processes during simulation
// Includes HRRN Response Ratio and MLFQ Queue Level

import React, { useMemo } from 'react';
import { useSimulation } from '../context/SimulationContext.jsx';
import { ProcessState } from '../core/PCB.js';
import { SimulationState } from '../simulation/SimulationController.js';
import './ProcessStateTable.css';

const stateConfig = {
  [ProcessState.NEW]: { color: 'gray', label: 'New' },
  [ProcessState.READY]: { color: 'blue', label: 'Ready' },
  [ProcessState.RUNNING]: { color: 'green', label: 'Running' },
  [ProcessState.WAITING]: { color: 'orange', label: 'Waiting' },
  [ProcessState.TERMINATED]: { color: 'purple', label: 'Terminated' },
};

const QUEUE_NAMES = ['Q0', 'Q1', 'Q2'];
const QUEUE_COLORS = ['#10b981', '#f59e0b', '#ef4444'];

export function ProcessStateTable() {
  const { state } = useSimulation();
  
  const processes = state.processStates?.length > 0 
    ? state.processStates 
    : state.processInputs;

  const isActive = state.simulationState !== SimulationState.IDLE;
  const isHRRN = state.selectedAlgorithm === 'HRRN';
  const isMLFQ = state.selectedAlgorithm === 'MLFQ';

  // Calculate Response Ratios for HRRN
  const responseRatios = useMemo(() => {
    if (!isHRRN || !isActive) return {};
    
    const ratios = {};
    let maxRatio = 0;
    let maxPid = null;
    
    processes.forEach(p => {
      const currentState = p.currentState || p.state || ProcessState.NEW;
      if (currentState !== ProcessState.READY) return;
      
      // Response Ratio = (W + S) / S = 1 + W/S
      const waitTime = state.currentTime - p.arrivalTime;
      const serviceTime = p.remainingBurstTime || p.cpuBurst || 1;
      const ratio = 1 + (waitTime / serviceTime);
      
      ratios[p.pid] = ratio;
      
      if (ratio > maxRatio) {
        maxRatio = ratio;
        maxPid = p.pid;
      }
    });
    
    return { ratios, highestPid: maxPid };
  }, [processes, state.currentTime, isHRRN, isActive]);

  return (
    <div className="process-state-table">
      <div className="table-header">
        <h3>Process States</h3>
        <div className="header-badges">
          {isHRRN && <span className="algo-badge hrrn">HRRN</span>}
          {isMLFQ && <span className="algo-badge mlfq">MLFQ</span>}
          {isActive && (
            <span className="time-display">T = {state.currentTime}</span>
          )}
        </div>
      </div>

      <div className="state-grid">
        {processes.map((process) => {
          const currentState = process.currentState || process.state || ProcessState.NEW;
          const config = stateConfig[currentState] || stateConfig[ProcessState.NEW];
          const hasHighestRatio = responseRatios.highestPid === process.pid;
          const queueLevel = process.currentQueueLevel ?? 0;
          
          return (
            <div 
              key={process.pid} 
              className={`process-card ${config.color} ${currentState === ProcessState.RUNNING ? 'running' : ''} ${hasHighestRatio ? 'highest-ratio' : ''}`}
            >
              <div className="card-top">
                <div className="process-id">P{process.pid}</div>
                {isMLFQ && currentState !== ProcessState.TERMINATED && currentState !== ProcessState.NEW && (
                  <span 
                    className="queue-badge"
                    style={{ background: QUEUE_COLORS[queueLevel] }}
                  >
                    {QUEUE_NAMES[queueLevel]}
                  </span>
                )}
              </div>
              
              <div className={`process-state ${config.color}`}>
                {config.label}
              </div>
              
              {/* HRRN Response Ratio */}
              {isHRRN && currentState === ProcessState.READY && responseRatios.ratios?.[process.pid] && (
                <div className={`response-ratio ${hasHighestRatio ? 'highest' : ''}`}>
                  <span className="ratio-label">RR:</span>
                  <span className="ratio-value">
                    {responseRatios.ratios[process.pid].toFixed(2)}
                  </span>
                  {hasHighestRatio && <span className="next-badge">Next</span>}
                </div>
              )}
              
              {isActive && (
                <div className="process-details">
                  {currentState === ProcessState.RUNNING && (
                    <div className="detail-item">
                      <span className="detail-label">Remaining:</span>
                      <span className="detail-value">{process.remainingBurstTime}</span>
                    </div>
                  )}
                  {currentState === ProcessState.TERMINATED && (
                    <>
                      <div className="detail-item">
                        <span className="detail-label">Completion:</span>
                        <span className="detail-value">
                          {process.completionTime !== -1 ? process.completionTime : '—'}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Turnaround:</span>
                        <span className="detail-value">
                          {(process.turnaroundTime !== undefined && process.turnaroundTime !== -1) 
                            ? process.turnaroundTime 
                            : (process.calculatedWaitTime !== undefined && process.calculatedWaitTime !== -1)
                              ? (process.completionTime - process.arrivalTime)
                              : '—'}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Formula Reference for HRRN */}
      {isHRRN && (
        <div className="formula-ref">
          <span className="formula">Response Ratio = 1 + (W/S)</span>
          <span className="formula-desc">W = wait time, S = service time</span>
        </div>
      )}

      {/* State Legend */}
      <div className="state-legend">
        {Object.entries(stateConfig).map(([key, config]) => (
          <div key={key} className="legend-item">
            <span className={`legend-dot ${config.color}`} />
            <span className="legend-label">{config.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProcessStateTable;

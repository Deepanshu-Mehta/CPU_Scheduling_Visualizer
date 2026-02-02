// Process State Table Component
// Shows current state of all processes during simulation

import React from 'react';
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

export function ProcessStateTable() {
  const { state } = useSimulation();
  
  const processes = state.processStates?.length > 0 
    ? state.processStates 
    : state.processInputs;

  const isActive = state.simulationState !== SimulationState.IDLE;

  return (
    <div className="process-state-table">
      <div className="table-header">
        <h3>Process States</h3>
        {isActive && (
          <span className="time-display">T = {state.currentTime}</span>
        )}
      </div>

      <div className="state-grid">
        {processes.map((process) => {
          const currentState = process.currentState || process.state || ProcessState.NEW;
          const config = stateConfig[currentState] || stateConfig[ProcessState.NEW];
          
          return (
            <div 
              key={process.pid} 
              className={`process-card ${config.color} ${currentState === ProcessState.RUNNING ? 'running' : ''}`}
            >
              <div className="process-id">P{process.pid}</div>
              <div className={`process-state ${config.color}`}>
                {config.label}
              </div>
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

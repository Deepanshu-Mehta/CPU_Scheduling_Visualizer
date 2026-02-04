// Process Input Table Component
// Allows users to add/edit/remove processes with validation

import React from 'react';
import { useSimulation } from '../context/SimulationContext.jsx';
import { SimulationState } from '../simulation/SimulationController.js';
import './ProcessInputTable.css';

export function ProcessInputTable() {
  const {
    state,
    addProcess,
    removeProcess,
    updateProcess,
    toggleIOMode,
    addIOBurst,
    removeIOBurst,
    updateIOBurst,
  } = useSimulation();

  const isRunning = state.simulationState !== SimulationState.IDLE && 
                    state.simulationState !== SimulationState.COMPLETED;

  const needsPriority = state.selectedAlgorithm.includes('PRIORITY');

  const validateNumber = (value, min = 0, max = 1000) => {
    const num = parseInt(value, 10);
    if (isNaN(num)) return min;
    return Math.max(min, Math.min(max, num));
  };

  const handleChange = (id, field, value) => {
    let validatedValue;
    switch (field) {
      case 'arrivalTime':
      case 'cpuBurst':
        validatedValue = validateNumber(value, 0, 1000);
        break;
      case 'priority':
        validatedValue = validateNumber(value, 0, 100);
        break;
      default:
        validatedValue = value;
    }
    updateProcess(id, { [field]: validatedValue });
  };

  const handleIOBurstChange = (processId, index, field, value) => {
    const validatedValue = validateNumber(value, 0, 100);
    updateIOBurst(processId, index, { [field]: validatedValue });
  };

  return (
    <div className="process-input-table">
      <div className="table-header">
        <h3>Process Configuration</h3>
        <button 
          className="add-btn"
          onClick={addProcess}
          disabled={isRunning}
        >
          <span className="icon">+</span>
          Add Process
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>PID</th>
              <th>Arrival Time</th>
              <th>CPU Burst</th>
              {needsPriority && <th>Priority</th>}
              <th>I/O Bursts</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {state.processInputs.map((process) => (
              <React.Fragment key={process.id}>
                <tr className={process.ioEnabled ? 'has-io' : ''}>
                  <td>
                    <span className="pid-badge">P{process.pid}</span>
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={process.arrivalTime}
                      onChange={(e) => handleChange(process.id, 'arrivalTime', e.target.value)}
                      disabled={isRunning}
                      className="number-input"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      value={process.cpuBurst}
                      onChange={(e) => handleChange(process.id, 'cpuBurst', e.target.value)}
                      disabled={isRunning}
                      className="number-input"
                    />
                  </td>
                  {needsPriority && (
                    <td>
                      <input
                        type="number"
                        min="0"
                        value={process.priority}
                        onChange={(e) => handleChange(process.id, 'priority', e.target.value)}
                        disabled={isRunning}
                        className="number-input priority-input"
                        title="Lower number = Higher priority"
                      />
                    </td>
                  )}
                  <td>
                    <button
                      className={`io-toggle ${process.ioEnabled ? 'active' : ''}`}
                      onClick={() => toggleIOMode(process.id)}
                      disabled={isRunning}
                    >
                      {process.ioEnabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </td>
                  <td>
                    <button
                      className="remove-btn"
                      onClick={() => removeProcess(process.id)}
                      disabled={isRunning || state.processInputs.length <= 1}
                    >
                      ✕
                    </button>
                  </td>
                </tr>

                {/* I/O Burst Row */}
                {process.ioEnabled && (
                  <tr className="io-burst-row">
                    <td colSpan={needsPriority ? 6 : 5}>
                      <div className="io-bursts-container">
                        <span className="io-label">I/O Bursts:</span>
                        <div className="io-bursts-list">
                          {process.ioBursts.map((io, index) => (
                            <div key={index} className="io-burst-item">
                              <label>
                                After CPU:
                                <input
                                  type="number"
                                  min="0"
                                  max={process.cpuBurst}
                                  value={io.afterCpu}
                                  onChange={(e) => handleIOBurstChange(process.id, index, 'afterCpu', e.target.value)}
                                  disabled={isRunning}
                                  className="number-input small"
                                />
                              </label>
                              <label>
                                Duration:
                                <input
                                  type="number"
                                  min="1"
                                  value={io.duration}
                                  onChange={(e) => handleIOBurstChange(process.id, index, 'duration', e.target.value)}
                                  disabled={isRunning}
                                  className="number-input small"
                                />
                              </label>
                              <button
                                className="remove-io-btn"
                                onClick={() => removeIOBurst(process.id, index)}
                                disabled={isRunning}
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                          <button
                            className="add-io-btn"
                            onClick={() => addIOBurst(process.id)}
                            disabled={isRunning}
                          >
                            + Add I/O
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <span className="process-count">
          {state.processInputs.length} process{state.processInputs.length !== 1 ? 'es' : ''}
        </span>
        {needsPriority && (
          <span className="priority-note">
            Lower priority number = Higher priority
          </span>
        )}
      </div>
    </div>
  );
}

export default ProcessInputTable;

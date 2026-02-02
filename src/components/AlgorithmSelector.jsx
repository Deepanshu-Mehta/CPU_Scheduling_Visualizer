// Algorithm Selector Component
// Dropdown with configuration options for each algorithm

import React from 'react';
import { useSimulation } from '../context/SimulationContext.jsx';
import { SimulationState } from '../simulation/SimulationController.js';
import './AlgorithmSelector.css';

export function AlgorithmSelector() {
  const {
    state,
    algorithmList,
    setAlgorithm,
    setAlgorithmOptions,
    toggleAdvancedOptions,
  } = useSimulation();

  const isRunning = state.simulationState !== SimulationState.IDLE && 
                    state.simulationState !== SimulationState.COMPLETED;

  const selectedAlgoInfo = algorithmList.find(a => a.key === state.selectedAlgorithm);

  const handleAlgorithmChange = (e) => {
    setAlgorithm(e.target.value);
  };

  const handleOptionChange = (key, value) => {
    setAlgorithmOptions({ [key]: parseInt(value, 10) });
  };

  return (
    <div className="algorithm-selector">
      <div className="selector-header">
        <h3>Scheduling Algorithm</h3>
      </div>

      <div className="algorithm-dropdown">
        <select
          value={state.selectedAlgorithm}
          onChange={handleAlgorithmChange}
          disabled={isRunning}
        >
          {algorithmList.map((algo) => (
            <option key={algo.key} value={algo.key}>
              {algo.name}
            </option>
          ))}
        </select>
        <span className="dropdown-arrow">▼</span>
      </div>

      {selectedAlgoInfo && (
        <div className="algorithm-info">
          <div className="algo-badges">
            <span className={`badge ${selectedAlgoInfo.preemptive ? 'preemptive' : 'non-preemptive'}`}>
              {selectedAlgoInfo.preemptive ? 'Preemptive' : 'Non-Preemptive'}
            </span>
          </div>
        </div>
      )}

      {/* Algorithm-specific configuration */}
      {selectedAlgoInfo?.config?.length > 0 && (
        <div className="config-section">
          <button 
            className="config-toggle"
            onClick={toggleAdvancedOptions}
          >
            <span>Configuration</span>
            <span className={`toggle-icon ${state.showAdvancedOptions ? 'open' : ''}`}>▼</span>
          </button>

          {state.showAdvancedOptions && (
            <div className="config-options">
              {selectedAlgoInfo.config.map((option) => (
                <div key={option.key} className="config-option">
                  <label htmlFor={option.key}>{option.label}</label>
                  <input
                    type="number"
                    id={option.key}
                    min={option.min}
                    max={option.max}
                    value={state.algorithmOptions[option.key] || option.default}
                    onChange={(e) => handleOptionChange(option.key, e.target.value)}
                    disabled={isRunning}
                    className="config-input"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Context Switch Time - Always shown */}
      <div className="context-switch-config">
        <div className="config-option">
          <label htmlFor="contextSwitchTime">Context Switch Time</label>
          <input
            type="number"
            id="contextSwitchTime"
            min={0}
            max={10}
            value={state.algorithmOptions.contextSwitchTime}
            onChange={(e) => handleOptionChange('contextSwitchTime', e.target.value)}
            disabled={isRunning}
            className="config-input"
          />
        </div>
      </div>
    </div>
  );
}

export default AlgorithmSelector;

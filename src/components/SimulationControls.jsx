// Simulation Controls Component
// Play, Pause, Step, Reset with Speed adjustment

import React from 'react';
import { useSimulation } from '../context/SimulationContext.jsx';
import { SimulationState } from '../simulation/SimulationController.js';
import './SimulationControls.css';

export function SimulationControls() {
  const {
    state,
    startSimulation,
    pauseSimulation,
    resumeSimulation,
    stepSimulation,
    resetSimulation,
    setSpeed,
  } = useSimulation();

  const isIdle = state.simulationState === SimulationState.IDLE;
  const isRunning = state.simulationState === SimulationState.RUNNING;
  const isPaused = state.simulationState === SimulationState.PAUSED;
  const isCompleted = state.simulationState === SimulationState.COMPLETED;

  const speedOptions = [
    { value: 0.5, label: '0.5x' },
    { value: 1, label: '1x' },
    { value: 2, label: '2x' },
    { value: 4, label: '4x' },
  ];

  const handlePlayPause = () => {
    if (isIdle || isCompleted) {
      startSimulation();
    } else if (isRunning) {
      pauseSimulation();
    } else if (isPaused) {
      resumeSimulation();
    }
  };

  const getPlayPauseIcon = () => {
    if (isRunning) return '⏸';
    return '▶';
  };

  const getPlayPauseLabel = () => {
    if (isRunning) return 'Pause';
    if (isPaused) return 'Resume';
    return 'Start';
  };

  return (
    <div className="simulation-controls">
      <div className="controls-header">
        <h3>Simulation Controls</h3>
        <div className={`status-indicator ${state.simulationState.toLowerCase()}`}>
          {state.simulationState}
        </div>
      </div>

      <div className="controls-main">
        <div className="control-buttons">
          <button
            className={`control-btn play-pause ${isRunning ? 'running' : ''}`}
            onClick={handlePlayPause}
            title={getPlayPauseLabel()}
          >
            <span className="btn-icon">{getPlayPauseIcon()}</span>
            <span className="btn-label">{getPlayPauseLabel()}</span>
          </button>

          <button
            className="control-btn step"
            onClick={stepSimulation}
            disabled={isRunning}
            title="Step"
          >
            <span className="btn-icon">⏭</span>
            <span className="btn-label">Step</span>
          </button>

          <button
            className="control-btn reset"
            onClick={resetSimulation}
            disabled={isIdle}
            title="Reset"
          >
            <span className="btn-icon">↺</span>
            <span className="btn-label">Reset</span>
          </button>
        </div>

        <div className="speed-control">
          <label>Speed:</label>
          <div className="speed-buttons">
            {speedOptions.map((option) => (
              <button
                key={option.value}
                className={`speed-btn ${state.speed === option.value ? 'active' : ''}`}
                onClick={() => setSpeed(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-section">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${state.progress || 0}%` }}
          />
        </div>
        <div className="progress-info">
          <span className="current-time">Time: {state.currentTime}</span>
          <span className="progress-percent">{Math.round(state.progress || 0)}%</span>
        </div>
      </div>
    </div>
  );
}

export default SimulationControls;

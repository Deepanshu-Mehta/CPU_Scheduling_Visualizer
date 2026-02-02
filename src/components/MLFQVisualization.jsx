// MLFQ Queue Visualization Component
// Shows 3-tier queue stack with process movement

import React, { useMemo } from 'react';
import { useSimulation } from '../context/SimulationContext.jsx';
import { ProcessState } from '../core/PCB.js';
import { SimulationState } from '../simulation/SimulationController.js';
import './MLFQVisualization.css';

const PROCESS_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
  '#06b6d4', '#3b82f6', '#f97316', '#84cc16', '#ef4444',
];

const QUEUE_CONFIG = [
  { level: 0, name: 'Q0', priority: 'High', tq: 4, color: '#10b981' },
  { level: 1, name: 'Q1', priority: 'Medium', tq: 8, color: '#f59e0b' },
  { level: 2, name: 'Q2', priority: 'Low', tq: '∞', color: '#ef4444' },
];

export function MLFQVisualization() {
  const { state } = useSimulation();
  
  const isMLFQ = state.selectedAlgorithm === 'MLFQ';
  const isActive = state.simulationState !== SimulationState.IDLE;
  
  // Group processes by queue level
  const queues = useMemo(() => {
    const q0 = [], q1 = [], q2 = [];
    
    const processes = state.processStates?.length > 0 ? state.processStates : state.processInputs;
    
    processes.forEach((p, idx) => {
      const currentState = p.currentState || p.state || ProcessState.NEW;
      if (currentState !== ProcessState.READY && currentState !== ProcessState.RUNNING) return;
      
      const processData = {
        pid: p.pid,
        color: PROCESS_COLORS[idx % PROCESS_COLORS.length],
        state: currentState,
        isRunning: currentState === ProcessState.RUNNING
      };
      
      const level = p.currentQueueLevel ?? 0;
      if (level === 0) q0.push(processData);
      else if (level === 1) q1.push(processData);
      else q2.push(processData);
    });
    
    return [q0, q1, q2];
  }, [state.processStates, state.processInputs]);

  if (!isMLFQ) return null;

  return (
    <div className="mlfq-visualization">
      <div className="mlfq-header">
        <h3>MLFQ Queue Levels</h3>
        {isActive && <span className="time-badge">T = {state.currentTime}</span>}
      </div>
      
      <div className="mlfq-stack">
        {QUEUE_CONFIG.map((config, idx) => (
          <div 
            key={config.level}
            className={`mlfq-queue ${queues[idx].length > 0 ? 'has-processes' : ''}`}
            style={{ '--queue-color': config.color }}
          >
            <div className="queue-info">
              <span className="queue-name" style={{ color: config.color }}>{config.name}</span>
              <span className="queue-priority">{config.priority}</span>
              <span className="queue-tq">TQ: {config.tq}</span>
            </div>
            
            <div className="queue-processes">
              {queues[idx].length === 0 ? (
                <span className="empty-indicator">—</span>
              ) : (
                queues[idx].map(p => (
                  <div 
                    key={p.pid}
                    className={`mlfq-process ${p.isRunning ? 'running' : ''}`}
                    style={{ '--process-color': p.color }}
                  >
                    P{p.pid}
                    {p.isRunning && <span className="running-indicator">▶</span>}
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mlfq-legend">
        <div className="legend-item">
          <span className="arrow-down">↓</span>
          <span>Demotion (TQ expired)</span>
        </div>
        <div className="legend-item">
          <span className="arrow-up">↑</span>
          <span>Promotion (aging)</span>
        </div>
      </div>
    </div>
  );
}

export default MLFQVisualization;

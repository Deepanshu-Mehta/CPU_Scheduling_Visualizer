// Queue Visualization Component
// Shows Ready Queue, Context Switch, and Running CPU with animated transitions

import React, { useMemo } from 'react';
import { useSimulation } from '../context/SimulationContext.jsx';
import { ProcessState } from '../core/PCB.js';
import { SimulationState } from '../simulation/SimulationController.js';
import './QueueVisualization.css';

// Color palette for processes
const PROCESS_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
  '#06b6d4', '#3b82f6', '#f97316', '#84cc16', '#ef4444',
];

export function QueueVisualization() {
  const { state } = useSimulation();
  
  const isActive = state.simulationState !== SimulationState.IDLE;
  
  // Build current queue state from process states
  const { readyQueue, runningProcess, waitingQueue, contextSwitching } = useMemo(() => {
    const ready = [];
    const waiting = [];
    let running = null;
    let cs = false;
    
    // Check if context switch is happening from gantt
    const lastGantt = state.ganttChart[state.ganttChart.length - 1];
    if (lastGantt?.type === 'CONTEXT_SWITCH') {
      cs = true;
    }
    
    // Get process states
    const processes = state.processStates?.length > 0 ? state.processStates : state.processInputs;
    
    processes.forEach((p, idx) => {
      const currentState = p.currentState || p.state || ProcessState.NEW;
      const processData = {
        pid: p.pid,
        color: PROCESS_COLORS[idx % PROCESS_COLORS.length],
        state: currentState,
        remainingBurst: p.remainingBurstTime,
        queueLevel: p.currentQueueLevel
      };
      
      switch (currentState) {
        case ProcessState.READY:
          ready.push(processData);
          break;
        case ProcessState.RUNNING:
          running = processData;
          break;
        case ProcessState.WAITING:
          waiting.push(processData);
          break;
        default:
          break;
      }
    });
    
    return { readyQueue: ready, runningProcess: running, waitingQueue: waiting, contextSwitching: cs };
  }, [state.processStates, state.processInputs, state.ganttChart]);

  if (!isActive) {
    return (
      <div className="queue-visualization">
        <div className="queue-header">
          <h3>Dispatcher View</h3>
          <span className="idle-badge">Idle</span>
        </div>
        <div className="queue-idle-message">
          Start the simulation to see process flow
        </div>
      </div>
    );
  }

  return (
    <div className="queue-visualization">
      <div className="queue-header">
        <h3>Dispatcher View</h3>
        <span className="time-badge">T = {state.currentTime}</span>
      </div>
      
      <div className="dispatcher-flow">
        {/* Ready Queue */}
        <div className="queue-section ready-queue-section">
          <div className="queue-label">Ready Queue</div>
          <div className="queue-box ready-queue">
            {readyQueue.length === 0 ? (
              <span className="empty-queue">Empty</span>
            ) : (
              readyQueue.map((p, idx) => (
                <div 
                  key={p.pid}
                  className={`process-badge ${idx === 0 ? 'next' : ''}`}
                  style={{ '--process-color': p.color }}
                  title={`P${p.pid} - Remaining: ${p.remainingBurst}`}
                >
                  P{p.pid}
                  {idx === 0 && <span className="next-indicator">→</span>}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Arrow */}
        <div className="flow-arrow">
          <svg width="40" height="24" viewBox="0 0 40 24">
            <path d="M0 12 L30 12 M22 4 L32 12 L22 20" 
                  stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Context Switch Block */}
        <div className={`queue-section cs-section ${contextSwitching ? 'active' : ''}`}>
          <div className="queue-label">Context Switch</div>
          <div className={`cs-block ${contextSwitching ? 'switching' : ''}`}>
            {contextSwitching ? (
              <div className="cs-animation">
                <span className="cs-dot"></span>
                <span className="cs-dot"></span>
                <span className="cs-dot"></span>
              </div>
            ) : (
              <span className="cs-idle">—</span>
            )}
          </div>
        </div>

        {/* Arrow */}
        <div className="flow-arrow">
          <svg width="40" height="24" viewBox="0 0 40 24">
            <path d="M0 12 L30 12 M22 4 L32 12 L22 20" 
                  stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
          </svg>
        </div>

        {/* CPU (Running) */}
        <div className="queue-section cpu-section">
          <div className="queue-label">CPU (Running)</div>
          <div className={`cpu-block ${runningProcess ? 'active' : 'idle'}`}>
            {runningProcess ? (
              <div 
                className="running-process"
                style={{ '--process-color': runningProcess.color }}
              >
                <span className="running-pid">P{runningProcess.pid}</span>
                <span className="running-burst">{runningProcess.remainingBurst}</span>
              </div>
            ) : (
              <span className="cpu-idle">Idle</span>
            )}
          </div>
        </div>
      </div>

      {/* Waiting Queue (I/O) */}
      {waitingQueue.length > 0 && (
        <div className="waiting-section">
          <div className="queue-label">I/O Waiting</div>
          <div className="queue-box waiting-queue">
            {waitingQueue.map(p => (
              <div 
                key={p.pid}
                className="process-badge waiting"
                style={{ '--process-color': p.color }}
              >
                P{p.pid}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default QueueVisualization;

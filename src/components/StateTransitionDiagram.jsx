// State Transition Diagram Component
// Visual timeline showing process state changes (NEW → READY → RUNNING → TERMINATED)

import React, { useMemo, memo } from 'react';
import { useSimulation } from '../context/SimulationContext.jsx';
import { ProcessState } from '../core/PCB.js';
import { SimulationState } from '../simulation/SimulationController.js';
import { PROCESS_COLORS } from '../utils/colors.js';
import './StateTransitionDiagram.css';

const STATE_LABELS = {
  [ProcessState.NEW]: 'New',
  [ProcessState.READY]: 'Rdy',
  [ProcessState.RUNNING]: 'Run',
  [ProcessState.WAITING]: 'Wait',
  [ProcessState.TERMINATED]: 'Done',
};

const STATE_COLORS = {
  [ProcessState.NEW]: '#94a3b8',
  [ProcessState.READY]: '#3b82f6',
  [ProcessState.RUNNING]: '#10b981',
  [ProcessState.WAITING]: '#f59e0b',
  [ProcessState.TERMINATED]: '#8b5cf6',
};

function StateTransitionDiagramInner() {
  const { state } = useSimulation();

  const isActive = state.simulationState !== SimulationState.IDLE;
  const transitions = useMemo(() => {
    return state.stateTransitions || [];
  }, [state.stateTransitions]);

  // Group transitions by PID
  const perProcessTransitions = useMemo(() => {
    if (transitions.length === 0) return {};

    const grouped = {};
    const processes = state.processStates?.length > 0 ? state.processStates : state.processInputs;

    processes.forEach((p, idx) => {
      grouped[p.pid] = {
        color: PROCESS_COLORS[idx % PROCESS_COLORS.length],
        transitions: transitions.filter(t => t.pid === p.pid),
      };
    });

    return grouped;
  }, [transitions, state.processStates, state.processInputs]);

  const maxTime = useMemo(() => {
    if (transitions.length === 0) return 0;
    return Math.max(...transitions.map(t => t.time), state.currentTime);
  }, [transitions, state.currentTime]);

  if (!isActive || transitions.length === 0) {
    return (
      <div className="state-transition-diagram">
        <div className="std-header">
          <h3>State Transition Timeline</h3>
          <span className="idle-badge">Idle</span>
        </div>
        <div className="std-empty">
          Run a simulation to see process state transitions
        </div>
      </div>
    );
  }

  return (
    <div className="state-transition-diagram">
      <div className="std-header">
        <h3>State Transition Timeline</h3>
        <span className="time-badge">T = {state.currentTime}</span>
      </div>

      <div className="std-body">
        {Object.entries(perProcessTransitions).map(([pid, data]) => (
          <div key={pid} className="std-process-row">
            <div className="std-pid" style={{ color: data.color }}>
              P{pid}
            </div>
            <div className="std-timeline">
              {data.transitions.map((t, idx) => {
                const nextT = data.transitions[idx + 1];
                const width = nextT
                  ? ((nextT.time - t.time) / Math.max(maxTime, 1)) * 100
                  : ((maxTime - t.time + 1) / Math.max(maxTime, 1)) * 100;

                return (
                  <div
                    key={idx}
                    className="std-segment"
                    style={{
                      width: `${Math.max(width, 2)}%`,
                      backgroundColor: STATE_COLORS[t.to] || '#64748b',
                    }}
                    title={`T=${t.time}: ${t.from} → ${t.to}`}
                  >
                    <span className="std-label">
                      {STATE_LABELS[t.to] || t.to}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="std-legend">
        {Object.entries(STATE_COLORS).map(([stateKey, color]) => (
          <div key={stateKey} className="std-legend-item">
            <span className="std-legend-dot" style={{ backgroundColor: color }} />
            <span className="std-legend-label">{STATE_LABELS[stateKey]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export const StateTransitionDiagram = memo(StateTransitionDiagramInner);
export default StateTransitionDiagram;

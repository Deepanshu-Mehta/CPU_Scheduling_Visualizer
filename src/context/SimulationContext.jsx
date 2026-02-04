// React Context for Simulation State Management

import React, { createContext, useContext, useReducer, useCallback, useRef, useEffect } from 'react';
import { SimulationController, SimulationState, compareAlgorithms } from '../simulation/SimulationController.js';
import { getAlgorithmList, ALGORITHMS } from '../algorithms/index.js';
import { BurstType } from '../core/PCB.js';

// Initial state
const initialState = {
  // Process input data
  processInputs: [
    { id: 1, pid: 1, arrivalTime: 0, cpuBurst: 10, priority: 2, ioEnabled: false, ioBursts: [] },
    { id: 2, pid: 2, arrivalTime: 1, cpuBurst: 5, priority: 1, ioEnabled: false, ioBursts: [] },
    { id: 3, pid: 3, arrivalTime: 2, cpuBurst: 8, priority: 3, ioEnabled: false, ioBursts: [] },
  ],
  nextProcessId: 4,

  // Algorithm selection
  selectedAlgorithm: 'FCFS',
  algorithmOptions: {
    contextSwitchTime: 1,
    timeQuantum: 4,
    agingInterval: 5,
    agingBoost: 1,
    q1TimeQuantum: 4,
    q2TimeQuantum: 8
  },

  // Simulation state
  simulationState: SimulationState.IDLE,
  currentTime: 0,
  ganttChart: [],
  fullGanttChart: [],
  stateTransitions: [],
  processStates: [],
  metrics: null,
  speed: 1,
  progress: 0,

  // Comparison mode
  comparisonMode: false,
  comparisonAlgorithms: ['FCFS', 'SJF', 'SRTF'],
  comparisonResults: null,

  // UI state
  activeTab: 'simulation',
  showAdvancedOptions: false
};

// Action types
const ActionTypes = {
  // Process actions
  ADD_PROCESS: 'ADD_PROCESS',
  REMOVE_PROCESS: 'REMOVE_PROCESS',
  UPDATE_PROCESS: 'UPDATE_PROCESS',
  SET_PROCESSES: 'SET_PROCESSES',
  TOGGLE_IO_MODE: 'TOGGLE_IO_MODE',
  ADD_IO_BURST: 'ADD_IO_BURST',
  REMOVE_IO_BURST: 'REMOVE_IO_BURST',
  UPDATE_IO_BURST: 'UPDATE_IO_BURST',

  // Algorithm actions
  SET_ALGORITHM: 'SET_ALGORITHM',
  SET_ALGORITHM_OPTIONS: 'SET_ALGORITHM_OPTIONS',

  // Simulation actions
  UPDATE_SIMULATION: 'UPDATE_SIMULATION',
  RESET_SIMULATION: 'RESET_SIMULATION',
  SET_SPEED: 'SET_SPEED',

  // Comparison actions
  SET_COMPARISON_MODE: 'SET_COMPARISON_MODE',
  SET_COMPARISON_ALGORITHMS: 'SET_COMPARISON_ALGORITHMS',
  SET_COMPARISON_RESULTS: 'SET_COMPARISON_RESULTS',

  // UI actions
  SET_ACTIVE_TAB: 'SET_ACTIVE_TAB',
  TOGGLE_ADVANCED_OPTIONS: 'TOGGLE_ADVANCED_OPTIONS'
};

// Reducer
function simulationReducer(state, action) {
  switch (action.type) {
    case ActionTypes.ADD_PROCESS:
      return {
        ...state,
        processInputs: [
          ...state.processInputs,
          {
            id: state.nextProcessId,
            pid: state.nextProcessId,
            arrivalTime: 0,
            cpuBurst: 5,
            priority: 0,
            ioEnabled: false,
            ioBursts: []
          }
        ],
        nextProcessId: state.nextProcessId + 1
      };

    case ActionTypes.REMOVE_PROCESS:
      return {
        ...state,
        processInputs: state.processInputs.filter(p => p.id !== action.payload)
      };

    case ActionTypes.UPDATE_PROCESS:
      return {
        ...state,
        processInputs: state.processInputs.map(p =>
          p.id === action.payload.id ? { ...p, ...action.payload.updates } : p
        )
      };

    case ActionTypes.SET_PROCESSES:
      return {
        ...state,
        processInputs: action.payload,
        nextProcessId: Math.max(...action.payload.map(p => p.id)) + 1
      };

    case ActionTypes.TOGGLE_IO_MODE:
      return {
        ...state,
        processInputs: state.processInputs.map(p =>
          p.id === action.payload 
            ? { ...p, ioEnabled: !p.ioEnabled, ioBursts: !p.ioEnabled ? [] : p.ioBursts }
            : p
        )
      };

    case ActionTypes.ADD_IO_BURST:
      return {
        ...state,
        processInputs: state.processInputs.map(p =>
          p.id === action.payload
            ? { ...p, ioBursts: [...p.ioBursts, { afterCpu: 0, duration: 2 }] }
            : p
        )
      };

    case ActionTypes.REMOVE_IO_BURST:
      return {
        ...state,
        processInputs: state.processInputs.map(p =>
          p.id === action.payload.processId
            ? { ...p, ioBursts: p.ioBursts.filter((_, i) => i !== action.payload.index) }
            : p
        )
      };

    case ActionTypes.UPDATE_IO_BURST:
      return {
        ...state,
        processInputs: state.processInputs.map(p =>
          p.id === action.payload.processId
            ? {
                ...p,
                ioBursts: p.ioBursts.map((io, i) =>
                  i === action.payload.index ? { ...io, ...action.payload.updates } : io
                )
              }
            : p
        )
      };

    case ActionTypes.SET_ALGORITHM:
      return {
        ...state,
        selectedAlgorithm: action.payload
      };

    case ActionTypes.SET_ALGORITHM_OPTIONS:
      return {
        ...state,
        algorithmOptions: { ...state.algorithmOptions, ...action.payload }
      };

    case ActionTypes.UPDATE_SIMULATION:
      return {
        ...state,
        simulationState: action.payload.state,
        currentTime: action.payload.currentTime,
        ganttChart: action.payload.ganttChart,
        fullGanttChart: action.payload.fullGanttChart,
        stateTransitions: action.payload.stateTransitions,
        processStates: action.payload.processes,
        metrics: action.payload.metrics,
        progress: action.payload.progress
      };

    case ActionTypes.RESET_SIMULATION:
      return {
        ...state,
        simulationState: SimulationState.IDLE,
        currentTime: 0,
        ganttChart: [],
        fullGanttChart: [],
        stateTransitions: [],
        processStates: [],
        metrics: null,
        progress: 0,
        comparisonResults: null
      };

    case ActionTypes.SET_SPEED:
      return {
        ...state,
        speed: action.payload
      };

    case ActionTypes.SET_COMPARISON_MODE:
      return {
        ...state,
        comparisonMode: action.payload
      };

    case ActionTypes.SET_COMPARISON_ALGORITHMS:
      return {
        ...state,
        comparisonAlgorithms: action.payload
      };

    case ActionTypes.SET_COMPARISON_RESULTS:
      return {
        ...state,
        comparisonResults: action.payload,
        simulationState: SimulationState.COMPLETED
      };

    case ActionTypes.SET_ACTIVE_TAB:
      return {
        ...state,
        activeTab: action.payload
      };

    case ActionTypes.TOGGLE_ADVANCED_OPTIONS:
      return {
        ...state,
        showAdvancedOptions: !state.showAdvancedOptions
      };

    default:
      return state;
  }
}

// Context
const SimulationContext = createContext(null);

// Provider component
export function SimulationProvider({ children }) {
  const [state, dispatch] = useReducer(simulationReducer, initialState);
  const controllerRef = useRef(new SimulationController());

  // Update controller when simulation state changes
  const handleSimulationUpdate = useCallback((simState) => {
    dispatch({ type: ActionTypes.UPDATE_SIMULATION, payload: simState });
  }, []);

  // Set up controller callback
  useEffect(() => {
    controllerRef.current.setOnUpdate(handleSimulationUpdate);
  }, [handleSimulationUpdate]);

  // Process actions
  const addProcess = useCallback(() => {
    dispatch({ type: ActionTypes.ADD_PROCESS });
  }, []);

  const removeProcess = useCallback((id) => {
    dispatch({ type: ActionTypes.REMOVE_PROCESS, payload: id });
  }, []);

  const updateProcess = useCallback((id, updates) => {
    dispatch({ type: ActionTypes.UPDATE_PROCESS, payload: { id, updates } });
  }, []);

  const setProcesses = useCallback((processes) => {
    dispatch({ type: ActionTypes.SET_PROCESSES, payload: processes });
  }, []);

  const toggleIOMode = useCallback((id) => {
    dispatch({ type: ActionTypes.TOGGLE_IO_MODE, payload: id });
  }, []);

  const addIOBurst = useCallback((processId) => {
    dispatch({ type: ActionTypes.ADD_IO_BURST, payload: processId });
  }, []);

  const removeIOBurst = useCallback((processId, index) => {
    dispatch({ type: ActionTypes.REMOVE_IO_BURST, payload: { processId, index } });
  }, []);

  const updateIOBurst = useCallback((processId, index, updates) => {
    dispatch({ type: ActionTypes.UPDATE_IO_BURST, payload: { processId, index, updates } });
  }, []);

  // Algorithm actions
  const setAlgorithm = useCallback((algorithm) => {
    dispatch({ type: ActionTypes.SET_ALGORITHM, payload: algorithm });
  }, []);

  const setAlgorithmOptions = useCallback((options) => {
    dispatch({ type: ActionTypes.SET_ALGORITHM_OPTIONS, payload: options });
  }, []);

  // Simulation controls
  const startSimulation = useCallback(() => {
    const controller = controllerRef.current;
    controller.stop();
    controller.setProcesses(state.processInputs);
    controller.setAlgorithm(state.selectedAlgorithm);
    controller.setOptions(state.algorithmOptions);
    controller.setSpeed(state.speed);
    controller.start();
  }, [state.processInputs, state.selectedAlgorithm, state.algorithmOptions, state.speed]);

  const pauseSimulation = useCallback(() => {
    controllerRef.current.pause();
  }, []);

  const resumeSimulation = useCallback(() => {
    controllerRef.current.resume();
  }, []);

  const stepSimulation = useCallback(() => {
    const controller = controllerRef.current;
    if (state.simulationState === SimulationState.IDLE) {
      controller.setProcesses(state.processInputs);
      controller.setAlgorithm(state.selectedAlgorithm);
      controller.setOptions(state.algorithmOptions);
    }
    controller.step();
  }, [state.processInputs, state.selectedAlgorithm, state.algorithmOptions, state.simulationState]);

  const resetSimulation = useCallback(() => {
    controllerRef.current.stop();
    dispatch({ type: ActionTypes.RESET_SIMULATION });
  }, []);

  const setSpeed = useCallback((speed) => {
    dispatch({ type: ActionTypes.SET_SPEED, payload: speed });
    controllerRef.current.setSpeed(speed);
  }, []);

  // Comparison actions
  const setComparisonMode = useCallback((enabled) => {
    dispatch({ type: ActionTypes.SET_COMPARISON_MODE, payload: enabled });
  }, []);

  const setComparisonAlgorithms = useCallback((algorithms) => {
    dispatch({ type: ActionTypes.SET_COMPARISON_ALGORITHMS, payload: algorithms });
  }, []);

  const runComparison = useCallback(() => {
    const results = compareAlgorithms(
      state.processInputs,
      state.comparisonAlgorithms,
      state.algorithmOptions
    );
    dispatch({ type: ActionTypes.SET_COMPARISON_RESULTS, payload: results });
  }, [state.processInputs, state.comparisonAlgorithms, state.algorithmOptions]);

  // UI actions
  const setActiveTab = useCallback((tab) => {
    dispatch({ type: ActionTypes.SET_ACTIVE_TAB, payload: tab });
  }, []);

  const toggleAdvancedOptions = useCallback(() => {
    dispatch({ type: ActionTypes.TOGGLE_ADVANCED_OPTIONS });
  }, []);

  const value = {
    state,
    algorithmList: getAlgorithmList(),
    algorithms: ALGORITHMS,

    // Process actions
    addProcess,
    removeProcess,
    updateProcess,
    setProcesses,
    toggleIOMode,
    addIOBurst,
    removeIOBurst,
    updateIOBurst,

    // Algorithm actions
    setAlgorithm,
    setAlgorithmOptions,

    // Simulation controls
    startSimulation,
    pauseSimulation,
    resumeSimulation,
    stepSimulation,
    resetSimulation,
    setSpeed,

    // Comparison actions
    setComparisonMode,
    setComparisonAlgorithms,
    runComparison,

    // UI actions
    setActiveTab,
    toggleAdvancedOptions
  };

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
}

// Hook to use the simulation context
// eslint-disable-next-line react-refresh/only-export-components
export function useSimulation() {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
}

export default SimulationContext;

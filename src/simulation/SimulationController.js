// Simulation Controller - Manages the discrete-event simulation

import { PCB, ProcessState, BurstType, createSimplePCB } from '../core/PCB.js';
import { runAlgorithm, ALGORITHMS } from '../algorithms/index.js';

export const SimulationState = {
  IDLE: 'IDLE',
  RUNNING: 'RUNNING',
  PAUSED: 'PAUSED',
  STEPPING: 'STEPPING',
  COMPLETED: 'COMPLETED'
};

/**
 * Animation Controller using requestAnimationFrame
 * Provides smooth 60fps animation with speed control
 */
export class AnimationController {
  constructor(onTick, speed = 1) {
    this.onTick = onTick;
    this.speed = speed; // 0.5, 1, 2
    this.isRunning = false;
    this.lastTime = 0;
    this.accumulator = 0;
    this.tickInterval = 500; // Base interval in ms (1 tick per 500ms at 1x speed)
    this.frameId = null;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.loop();
  }

  stop() {
    this.isRunning = false;
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }

  pause() {
    this.stop();
  }

  resume() {
    this.start();
  }

  setSpeed(speed) {
    this.speed = speed;
  }

  loop = () => {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    this.accumulator += deltaTime * this.speed;

    while (this.accumulator >= this.tickInterval) {
      this.accumulator -= this.tickInterval;
      const shouldContinue = this.onTick();
      if (!shouldContinue) {
        this.stop();
        return;
      }
    }

    this.frameId = requestAnimationFrame(this.loop);
  };
}

/**
 * Simulation Controller
 * Manages the entire simulation lifecycle with tick-by-tick execution
 */
export class SimulationController {
  constructor() {
    this.reset();
    this.animationController = null;
    this.onUpdate = null;
  }

  reset() {
    this.processes = [];
    this.algorithm = 'FCFS';
    this.algorithmOptions = {
      contextSwitchTime: 1,
      timeQuantum: 4,
      agingInterval: 5,
      agingBoost: 1,
      q1TimeQuantum: 4,
      q2TimeQuantum: 8
    };
    this.state = SimulationState.IDLE;
    this.currentTime = 0;
    this.simulationResult = null;
    this.currentTickIndex = 0;
    this.speed = 1;
  }

  /**
   * Set the processes to simulate
   */
  setProcesses(processData) {
    this.processes = processData.map(p => {
      // Handle both simple format and burst sequence format
      if (p.burstSequence) {
        return new PCB({
          pid: p.pid,
          arrivalTime: p.arrivalTime,
          priority: p.priority || 0,
          burstSequence: p.burstSequence
        });
      } else {
        // Simple format with cpuBurst and optional ioBursts
        return createSimplePCB(
          p.pid,
          p.arrivalTime,
          p.cpuBurst,
          p.priority || 0,
          p.ioBursts || []
        );
      }
    });
  }

  /**
   * Set the scheduling algorithm
   */
  setAlgorithm(algorithm) {
    if (!ALGORITHMS[algorithm]) {
      throw new Error(`Unknown algorithm: ${algorithm}`);
    }
    this.algorithm = algorithm;
  }

  /**
   * Set algorithm options
   */
  setOptions(options) {
    this.algorithmOptions = { ...this.algorithmOptions, ...options };
  }

  /**
   * Set the callback for state updates
   */
  setOnUpdate(callback) {
    this.onUpdate = callback;
  }

  /**
   * Run the complete simulation instantly (for comparison mode)
   */
  runComplete() {
    if (this.processes.length === 0) {
      throw new Error('No processes to simulate');
    }

    this.simulationResult = runAlgorithm(
      this.algorithm,
      this.processes,
      this.algorithmOptions
    );

    this.state = SimulationState.COMPLETED;
    this.currentTickIndex = this.simulationResult.rawGanttChart.length;

    if (this.onUpdate) {
      this.onUpdate(this.getState());
    }

    return this.simulationResult;
  }

  /**
   * Start animated simulation
   */
  start() {
    if (this.state === SimulationState.RUNNING) return;

    // Run full simulation first, then animate the result
    if (!this.simulationResult) {
      this.simulationResult = runAlgorithm(
        this.algorithm,
        this.processes,
        this.algorithmOptions
      );
    }

    this.state = SimulationState.RUNNING;
    this.currentTickIndex = 0;

    this.animationController = new AnimationController(() => {
      return this.tick();
    }, this.speed);

    this.animationController.start();

    if (this.onUpdate) {
      this.onUpdate(this.getState());
    }
  }

  /**
   * Process one tick of the animation
   */
  tick() {
    if (!this.simulationResult) return false;

    if (this.currentTickIndex >= this.simulationResult.rawGanttChart.length) {
      this.state = SimulationState.COMPLETED;
      if (this.onUpdate) {
        this.onUpdate(this.getState());
      }
      return false;
    }

    this.currentTickIndex++;
    this.currentTime = this.currentTickIndex;

    if (this.onUpdate) {
      this.onUpdate(this.getState());
    }

    return true;
  }

  /**
   * Execute a single step
   */
  step() {
    if (!this.simulationResult) {
      this.simulationResult = runAlgorithm(
        this.algorithm,
        this.processes,
        this.algorithmOptions
      );
    }

    this.state = SimulationState.STEPPING;
    const result = this.tick();

    if (!result) {
      this.state = SimulationState.COMPLETED;
    } else {
      this.state = SimulationState.PAUSED;
    }

    if (this.onUpdate) {
      this.onUpdate(this.getState());
    }
  }

  /**
   * Pause the simulation
   */
  pause() {
    if (this.animationController) {
      this.animationController.pause();
    }
    this.state = SimulationState.PAUSED;
    if (this.onUpdate) {
      this.onUpdate(this.getState());
    }
  }

  /**
   * Resume the simulation
   */
  resume() {
    if (this.animationController) {
      this.animationController.resume();
    }
    this.state = SimulationState.RUNNING;
    if (this.onUpdate) {
      this.onUpdate(this.getState());
    }
  }

  /**
   * Stop and reset the simulation
   */
  stop() {
    if (this.animationController) {
      this.animationController.stop();
      this.animationController = null;
    }
    this.state = SimulationState.IDLE;
    this.currentTickIndex = 0;
    this.currentTime = 0;
    this.simulationResult = null;
    if (this.onUpdate) {
      this.onUpdate(this.getState());
    }
  }

  /**
   * Set animation speed
   */
  setSpeed(speed) {
    this.speed = speed;
    if (this.animationController) {
      this.animationController.setSpeed(speed);
    }
  }

  /**
   * Get current simulation state for UI
   */
  getState() {
    const visibleGantt = this.simulationResult
      ? this.simulationResult.rawGanttChart.slice(0, this.currentTickIndex)
      : [];

    // Consolidate visible gantt
    const consolidatedGantt = [];
    for (const entry of visibleGantt) {
      const last = consolidatedGantt[consolidatedGantt.length - 1];
      if (last && last.type === entry.type && last.pid === entry.pid) {
        last.endTime = entry.time + 1;
        last.duration++;
      } else {
        consolidatedGantt.push({
          ...entry,
          startTime: entry.time,
          endTime: entry.time + 1,
          duration: 1
        });
      }
    }

    // Get current process states up to currentTickIndex
    const currentTransitions = this.simulationResult
      ? this.simulationResult.stateTransitions.filter(t => t.time <= this.currentTickIndex)
      : [];

    // Build current process states
    const processStates = {};
    for (const p of this.processes) {
      processStates[p.pid] = ProcessState.NEW;
    }
    for (const t of currentTransitions) {
      processStates[t.pid] = t.to;
    }

    // Calculate current metrics
    let metrics = null;
    if (this.simulationResult && this.state === SimulationState.COMPLETED) {
      metrics = this.simulationResult.metrics;
    } else if (visibleGantt.length > 0) {
      // Calculate partial metrics
      const processedTime = visibleGantt.filter(e => e.type === 'PROCESS').length;
      const totalTime = visibleGantt.length;
      metrics = {
        cpuUtilization: totalTime > 0 ? (processedTime / totalTime) * 100 : 0,
        progress: this.simulationResult 
          ? (this.currentTickIndex / this.simulationResult.rawGanttChart.length) * 100 
          : 0
      };
    }

    return {
      state: this.state,
      currentTime: this.currentTickIndex,
      algorithm: this.algorithm,
      algorithmName: ALGORITHMS[this.algorithm]?.name || this.algorithm,
      // Use simulationResult.processes when completed to get accurate final metrics
      processes: (this.state === SimulationState.COMPLETED && this.simulationResult)
        ? this.simulationResult.processes.map(p => ({
            ...p,
            currentState: p.state
          }))
        : this.processes.map(p => ({
            ...p.toJSON(),
            currentState: processStates[p.pid]
          })),
      ganttChart: consolidatedGantt,
      fullGanttChart: this.simulationResult?.ganttChart || [],
      stateTransitions: currentTransitions,
      allTransitions: this.simulationResult?.stateTransitions || [],
      metrics: this.state === SimulationState.COMPLETED ? this.simulationResult?.metrics : metrics,
      fullMetrics: this.simulationResult?.metrics,
      options: this.algorithmOptions,
      speed: this.speed,
      progress: this.simulationResult 
        ? (this.currentTickIndex / this.simulationResult.rawGanttChart.length) * 100 
        : 0
    };
  }
}

/**
 * Compare multiple algorithms on the same dataset
 */
export function compareAlgorithms(processes, algorithmKeys, options = {}) {
  const results = {};

  for (const key of algorithmKeys) {
    const controller = new SimulationController();
    controller.setProcesses(processes);
    controller.setAlgorithm(key);
    controller.setOptions(options);
    results[key] = controller.runComplete();
    results[key].algorithmName = ALGORITHMS[key]?.name || key;
    results[key].algorithmShortName = ALGORITHMS[key]?.shortName || key;
  }

  return results;
}

export default SimulationController;

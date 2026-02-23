// Scheduling Algorithm Implementations
// All algorithms implemented as pure functions for testability

import { ProcessState, BurstType } from '../core/PCB.js';
import { ReadyQueue, IOQueue, MLFQueue } from '../core/Queues.js';
import { consolidateGanttChart, calculateMetrics } from '../utils/schedulerUtils.js';

/**
 * Base scheduler simulation that runs a complete scheduling cycle
 * @param {Array} processes - Array of PCB instances
 * @param {Function} selectNext - Function to select next process from ready queue
 * @param {Object} options - Algorithm-specific options
 * @returns {Object} - Simulation results including timeline and metrics
 */
function runSchedulerSimulation(processes, selectNext, options = {}) {
  const {
    preemptive = false,
    timeQuantum = null,
    contextSwitchTime = 0,
    checkPreemption = null, // Function to check if preemption needed
    onTick = null // Callback for each tick (for real-time updates)
  } = options;

  // Clone processes to avoid mutation
  const procs = processes.map(p => p.clone());
  
  // Sort by arrival time initially
  procs.sort((a, b) => a.arrivalTime - b.arrivalTime);

  const readyQueue = new ReadyQueue();
  const ioQueue = new IOQueue();
  const ganttChart = [];
  const stateTransitions = [];
  
  let currentTime = 0;
  let runningProcess = null;
  let timeInCurrentBurst = 0;
  let completedCount = 0;
  let cpuBusyTime = 0;
  let contextSwitchRemaining = 0;
  let processArrivalIndex = 0;
  
  // Maximum iterations to prevent infinite loops
  const maxIterations = 10000;
  let iterations = 0;

  while (completedCount < procs.length && iterations < maxIterations) {
    iterations++;

    // 1. Handle new arrivals
    while (processArrivalIndex < procs.length && 
           procs[processArrivalIndex].arrivalTime <= currentTime) {
      const arrivingProcess = procs[processArrivalIndex];
      arrivingProcess.state = ProcessState.READY;
      arrivingProcess.lastReadyTime = currentTime;
      readyQueue.enqueue(arrivingProcess);
      
      stateTransitions.push({
        time: currentTime,
        pid: arrivingProcess.pid,
        from: ProcessState.NEW,
        to: ProcessState.READY
      });
      
      processArrivalIndex++;
    }

    // 2. Handle I/O completions
    const ioCompleted = ioQueue.tick();
    for (const process of ioCompleted) {
      if (!process.isComplete()) {
        process.lastReadyTime = currentTime;
        readyQueue.enqueue(process);
        
        stateTransitions.push({
          time: currentTime,
          pid: process.pid,
          from: ProcessState.WAITING,
          to: ProcessState.READY
        });
      }
    }

    // 3. Handle context switch overhead
    if (contextSwitchRemaining > 0) {
      contextSwitchRemaining--;
      ganttChart.push({
        time: currentTime,
        type: 'CONTEXT_SWITCH',
        pid: null
      });
      currentTime++;
      continue;
    }

    // 4. Check for preemption
    let shouldPreempt = false;
    if (runningProcess && preemptive && checkPreemption) {
      shouldPreempt = checkPreemption(runningProcess, readyQueue, currentTime);
    }

    // 5. Check for time quantum expiry (Round Robin)
    if (runningProcess && timeQuantum !== null && timeInCurrentBurst >= timeQuantum) {
      shouldPreempt = true;
    }

    // 6. Handle preemption
    if (shouldPreempt && runningProcess) {
      // Save current progress
      runningProcess.state = ProcessState.READY;
      runningProcess.lastReadyTime = currentTime;
      readyQueue.enqueue(runningProcess);
      
      stateTransitions.push({
        time: currentTime,
        pid: runningProcess.pid,
        from: ProcessState.RUNNING,
        to: ProcessState.READY
      });
      
      runningProcess = null;
      timeInCurrentBurst = 0;
      
      if (contextSwitchTime > 0) {
        contextSwitchRemaining = contextSwitchTime;
      }
    }

    // 7. If no process running, select next
    if (!runningProcess && !readyQueue.isEmpty()) {
      runningProcess = selectNext(readyQueue, currentTime);
      runningProcess.state = ProcessState.RUNNING;
      timeInCurrentBurst = 0;
      
      // Record response time on first CPU access
      if (runningProcess.responseTime === -1) {
        runningProcess.responseTime = currentTime - runningProcess.arrivalTime;
      }
      
      stateTransitions.push({
        time: currentTime,
        pid: runningProcess.pid,
        from: ProcessState.READY,
        to: ProcessState.RUNNING
      });
    }

    // 8. Execute current process or idle
    if (runningProcess) {
      ganttChart.push({
        time: currentTime,
        type: 'PROCESS',
        pid: runningProcess.pid
      });
      
      cpuBusyTime++;
      const burstComplete = runningProcess.executeTick();
      timeInCurrentBurst++;

      // Check if current burst is complete
      if (burstComplete) {
        const hasMoreBursts = runningProcess.moveToNextBurst();
        
        if (!hasMoreBursts) {
          // Process complete
          runningProcess.completionTime = currentTime + 1;
          runningProcess.state = ProcessState.TERMINATED;
          completedCount++;
          
          stateTransitions.push({
            time: currentTime + 1,
            pid: runningProcess.pid,
            from: ProcessState.RUNNING,
            to: ProcessState.TERMINATED
          });
        } else if (runningProcess.getCurrentBurstType() === BurstType.IO) {
          // Move to I/O queue
          ioQueue.enqueue(runningProcess);
          
          stateTransitions.push({
            time: currentTime + 1,
            pid: runningProcess.pid,
            from: ProcessState.RUNNING,
            to: ProcessState.WAITING
          });
        }
        
        runningProcess = null;
        timeInCurrentBurst = 0;
        
        if (contextSwitchTime > 0 && completedCount < procs.length) {
          contextSwitchRemaining = contextSwitchTime;
        }
      }
    } else {
      // CPU idle
      ganttChart.push({
        time: currentTime,
        type: 'IDLE',
        pid: null
      });
    }

    // Increment wait time for processes in ready queue
    readyQueue.incrementWaitTime();

    // Callback for real-time updates
    if (onTick) {
      onTick({
        currentTime,
        runningProcess: runningProcess?.toJSON(),
        readyQueue: readyQueue.getAll().map(p => p.toJSON()),
        ioQueue: ioQueue.getAll(),
        ganttChart: [...ganttChart]
      });
    }

    currentTime++;
  }

  // Consolidate Gantt chart and calculate metrics using shared utilities
  const consolidatedGantt = consolidateGanttChart(ganttChart);
  const metrics = calculateMetrics(procs, ganttChart, currentTime, cpuBusyTime);

  return {
    ganttChart: consolidatedGantt,
    rawGanttChart: ganttChart,
    stateTransitions,
    processes: procs.map(p => p.toJSON()),
    metrics
  };
}


// ============ FCFS - First Come First Serve ============
export function runFCFS(processes, options = {}) {
  const selectNext = (readyQueue) => {
    readyQueue.sortByArrival();
    return readyQueue.dequeue();
  };

  return runSchedulerSimulation(processes, selectNext, {
    ...options,
    preemptive: false,
    timeQuantum: null
  });
}


// ============ SJF - Shortest Job First (Non-Preemptive) ============
export function runSJF(processes, options = {}) {
  const selectNext = (readyQueue) => {
    readyQueue.sortByBurstTime();
    return readyQueue.dequeue();
  };

  return runSchedulerSimulation(processes, selectNext, {
    ...options,
    preemptive: false,
    timeQuantum: null
  });
}


// ============ SRTF - Shortest Remaining Time First (Preemptive SJF) ============
export function runSRTF(processes, options = {}) {
  const selectNext = (readyQueue) => {
    readyQueue.sortByBurstTime();
    return readyQueue.dequeue();
  };

  const checkPreemption = (runningProcess, readyQueue) => {
    if (readyQueue.isEmpty()) return false;
    
    // Check if any process in ready queue has shorter remaining time
    const shortest = readyQueue.getAll().reduce((min, p) => 
      p.remainingBurstTime < min.remainingBurstTime ? p : min
    );
    
    return shortest.remainingBurstTime < runningProcess.remainingBurstTime;
  };

  return runSchedulerSimulation(processes, selectNext, {
    ...options,
    preemptive: true,
    checkPreemption
  });
}


// ============ Priority Scheduling (Non-Preemptive) ============
export function runPriorityNP(processes, options = {}) {
  const { agingInterval = 0, agingBoost = 1 } = options;

  const selectNext = (readyQueue, currentTime) => {
    if (agingInterval > 0) {
      readyQueue.applyAging(currentTime, agingInterval, agingBoost);
    }
    readyQueue.sortByPriority();
    return readyQueue.dequeue();
  };

  return runSchedulerSimulation(processes, selectNext, {
    ...options,
    preemptive: false,
    timeQuantum: null
  });
}


// ============ Priority Scheduling (Preemptive) ============
export function runPriorityP(processes, options = {}) {
  const { agingInterval = 0, agingBoost = 1 } = options;

  const selectNext = (readyQueue, currentTime) => {
    if (agingInterval > 0) {
      readyQueue.applyAging(currentTime, agingInterval, agingBoost);
    }
    readyQueue.sortByPriority();
    return readyQueue.dequeue();
  };

  const checkPreemption = (runningProcess, readyQueue, currentTime) => {
    if (readyQueue.isEmpty()) return false;
    
    // Apply aging before checking
    if (agingInterval > 0) {
      readyQueue.applyAging(currentTime, agingInterval, agingBoost);
    }
    
    // Check if any process has higher priority (lower number)
    const highest = readyQueue.getAll().reduce((min, p) => 
      p.priority < min.priority ? p : min
    );
    
    return highest.priority < runningProcess.priority;
  };

  return runSchedulerSimulation(processes, selectNext, {
    ...options,
    preemptive: true,
    checkPreemption
  });
}


// ============ Round Robin ============
export function runRoundRobin(processes, options = {}) {
  const { timeQuantum = 4 } = options;

  const selectNext = (readyQueue) => {
    // FCFS within the queue (tail insertion on preemption)
    return readyQueue.dequeue();
  };

  return runSchedulerSimulation(processes, selectNext, {
    ...options,
    preemptive: true,
    timeQuantum,
    checkPreemption: () => false // Only preempt on TQ expiry
  });
}


// ============ HRRN - Highest Response Ratio Next ============
export function runHRRN(processes, options = {}) {
  const selectNext = (readyQueue, currentTime) => {
    readyQueue.sortByResponseRatio(currentTime);
    return readyQueue.dequeue();
  };

  return runSchedulerSimulation(processes, selectNext, {
    ...options,
    preemptive: false,
    timeQuantum: null
  });
}


// ============ MLFQ - Multilevel Feedback Queue ============
export function runMLFQ(processes, options = {}) {
  const {
    queueConfigs = [
      { timeQuantum: 4, type: 'RR' },
      { timeQuantum: 8, type: 'RR' },
      { timeQuantum: Infinity, type: 'FCFS' }
    ],
    contextSwitchTime = 0,
    agingInterval = 0,
    onTick = null
  } = options;

  // Clone processes
  const procs = processes.map(p => p.clone());
  procs.sort((a, b) => a.arrivalTime - b.arrivalTime);

  const mlfq = new MLFQueue(queueConfigs);
  const ioQueue = new IOQueue();
  const ganttChart = [];
  const stateTransitions = [];

  let currentTime = 0;
  let runningProcess = null;
  let currentQueueLevel = 0;
  let currentTimeQuantum = 0;
  let timeInCurrentBurst = 0;
  let completedCount = 0;
  let cpuBusyTime = 0;
  let contextSwitchRemaining = 0;
  let processArrivalIndex = 0;
  let usedFullQuantum = false;

  const maxIterations = 10000;
  let iterations = 0;

  while (completedCount < procs.length && iterations < maxIterations) {
    iterations++;

    // 1. Handle new arrivals (always go to highest priority queue)
    while (processArrivalIndex < procs.length && 
           procs[processArrivalIndex].arrivalTime <= currentTime) {
      const arrivingProcess = procs[processArrivalIndex];
      arrivingProcess.state = ProcessState.READY;
      arrivingProcess.lastReadyTime = currentTime;
      mlfq.enqueue(arrivingProcess, 0); // Start at highest priority
      
      stateTransitions.push({
        time: currentTime,
        pid: arrivingProcess.pid,
        from: ProcessState.NEW,
        to: ProcessState.READY
      });
      
      processArrivalIndex++;
    }

    // 2. Handle I/O completions (promote on I/O completion)
    const ioCompleted = ioQueue.tick();
    for (const process of ioCompleted) {
      if (!process.isComplete()) {
        // Promote process (returned from I/O early)
        const newLevel = Math.max(0, process.currentQueueLevel - 1);
        process.lastReadyTime = currentTime;
        mlfq.enqueue(process, newLevel);
        
        stateTransitions.push({
          time: currentTime,
          pid: process.pid,
          from: ProcessState.WAITING,
          to: ProcessState.READY
        });
      }
    }

    // 3. Handle context switch overhead
    if (contextSwitchRemaining > 0) {
      contextSwitchRemaining--;
      ganttChart.push({
        time: currentTime,
        type: 'CONTEXT_SWITCH',
        pid: null
      });
      currentTime++;
      continue;
    }

    // 4. Check for time quantum expiry
    let shouldPreempt = false;
    if (runningProcess && timeInCurrentBurst >= currentTimeQuantum) {
      shouldPreempt = true;
      usedFullQuantum = true;
    }

    // 5. Check if higher priority queue has processes
    if (runningProcess && !shouldPreempt) {
      const nextInfo = mlfq.peekNextProcess();
      if (nextInfo && nextInfo.queueLevel < currentQueueLevel) {
        shouldPreempt = true;
        usedFullQuantum = false; // Didn't use full quantum
      }
    }

    // 6. Handle preemption
    if (shouldPreempt && runningProcess) {
      runningProcess.state = ProcessState.READY;
      runningProcess.lastReadyTime = currentTime;
      
      // Demote if used full quantum, otherwise stay at same level
      if (usedFullQuantum) {
        mlfq.demote(runningProcess);
      } else {
        mlfq.enqueue(runningProcess, currentQueueLevel);
      }
      
      stateTransitions.push({
        time: currentTime,
        pid: runningProcess.pid,
        from: ProcessState.RUNNING,
        to: ProcessState.READY
      });
      
      runningProcess = null;
      timeInCurrentBurst = 0;
      usedFullQuantum = false;
      
      if (contextSwitchTime > 0) {
        contextSwitchRemaining = contextSwitchTime;
      }
    }

    // 7. Apply aging
    if (agingInterval > 0) {
      mlfq.applyAging(currentTime, agingInterval);
    }

    // 8. Select next process
    if (!runningProcess && !mlfq.isEmpty()) {
      const nextInfo = mlfq.getNextProcess();
      if (nextInfo) {
        runningProcess = nextInfo.process;
        currentQueueLevel = nextInfo.queueLevel;
        currentTimeQuantum = nextInfo.timeQuantum;
        runningProcess.state = ProcessState.RUNNING;
        timeInCurrentBurst = 0;
        
        if (runningProcess.responseTime === -1) {
          runningProcess.responseTime = currentTime - runningProcess.arrivalTime;
        }
        
        stateTransitions.push({
          time: currentTime,
          pid: runningProcess.pid,
          from: ProcessState.READY,
          to: ProcessState.RUNNING
        });
      }
    }

    // 9. Execute or idle
    if (runningProcess) {
      ganttChart.push({
        time: currentTime,
        type: 'PROCESS',
        pid: runningProcess.pid,
        queueLevel: currentQueueLevel
      });
      
      cpuBusyTime++;
      const burstComplete = runningProcess.executeTick();
      timeInCurrentBurst++;

      if (burstComplete) {
        const hasMoreBursts = runningProcess.moveToNextBurst();
        
        if (!hasMoreBursts) {
          runningProcess.completionTime = currentTime + 1;
          runningProcess.state = ProcessState.TERMINATED;
          completedCount++;
          
          stateTransitions.push({
            time: currentTime + 1,
            pid: runningProcess.pid,
            from: ProcessState.RUNNING,
            to: ProcessState.TERMINATED
          });
        } else if (runningProcess.getCurrentBurstType() === BurstType.IO) {
          ioQueue.enqueue(runningProcess);
          
          stateTransitions.push({
            time: currentTime + 1,
            pid: runningProcess.pid,
            from: ProcessState.RUNNING,
            to: ProcessState.WAITING
          });
        }
        
        runningProcess = null;
        timeInCurrentBurst = 0;
        usedFullQuantum = false;
        
        if (contextSwitchTime > 0 && completedCount < procs.length) {
          contextSwitchRemaining = contextSwitchTime;
        }
      }
    } else {
      ganttChart.push({
        time: currentTime,
        type: 'IDLE',
        pid: null
      });
    }

    mlfq.incrementWaitTime();

    if (onTick) {
      onTick({
        currentTime,
        runningProcess: runningProcess?.toJSON(),
        queues: mlfq.getQueueStates(),
        ioQueue: ioQueue.getAll(),
        ganttChart: [...ganttChart]
      });
    }

    currentTime++;
  }

  // Consolidate Gantt chart and calculate metrics using shared utilities
  const consolidatedGantt = consolidateGanttChart(ganttChart);
  const metrics = calculateMetrics(procs, ganttChart, currentTime, cpuBusyTime);

  return {
    ganttChart: consolidatedGantt,
    rawGanttChart: ganttChart,
    stateTransitions,
    processes: procs.map(p => p.toJSON()),
    metrics
  };
}


// ============ Algorithm Registry ============
export const ALGORITHMS = {
  FCFS: {
    name: 'First Come First Serve (FCFS)',
    shortName: 'FCFS',
    run: runFCFS,
    preemptive: false,
    config: []
  },
  SJF: {
    name: 'Shortest Job First (SJF)',
    shortName: 'SJF',
    run: runSJF,
    preemptive: false,
    config: []
  },
  SRTF: {
    name: 'Shortest Remaining Time First (SRTF)',
    shortName: 'SRTF',
    run: runSRTF,
    preemptive: true,
    config: []
  },
  PRIORITY_NP: {
    name: 'Priority (Non-Preemptive)',
    shortName: 'Priority-NP',
    run: runPriorityNP,
    preemptive: false,
    config: [
      { key: 'agingInterval', label: 'Aging Interval', default: 0, min: 0, max: 100 },
      { key: 'agingBoost', label: 'Aging Boost', default: 1, min: 1, max: 10 }
    ]
  },
  PRIORITY_P: {
    name: 'Priority (Preemptive)',
    shortName: 'Priority-P',
    run: runPriorityP,
    preemptive: true,
    config: [
      { key: 'agingInterval', label: 'Aging Interval', default: 0, min: 0, max: 100 },
      { key: 'agingBoost', label: 'Aging Boost', default: 1, min: 1, max: 10 }
    ]
  },
  ROUND_ROBIN: {
    name: 'Round Robin (RR)',
    shortName: 'RR',
    run: runRoundRobin,
    preemptive: true,
    config: [
      { key: 'timeQuantum', label: 'Time Quantum', default: 4, min: 1, max: 100 }
    ]
  },
  HRRN: {
    name: 'Highest Response Ratio Next (HRRN)',
    shortName: 'HRRN',
    run: runHRRN,
    preemptive: false,
    config: []
  },
  MLFQ: {
    name: 'Multilevel Feedback Queue (MLFQ)',
    shortName: 'MLFQ',
    run: runMLFQ,
    preemptive: true,
    config: [
      { key: 'q1TimeQuantum', label: 'Queue 1 TQ', default: 4, min: 1, max: 50 },
      { key: 'q2TimeQuantum', label: 'Queue 2 TQ', default: 8, min: 1, max: 100 },
      { key: 'agingInterval', label: 'Aging Interval', default: 0, min: 0, max: 100 }
    ]
  }
};

export function getAlgorithmList() {
  return Object.entries(ALGORITHMS).map(([key, algo]) => ({
    key,
    ...algo
  }));
}

export function runAlgorithm(algorithmKey, processes, options = {}) {
  const algo = ALGORITHMS[algorithmKey];
  if (!algo) {
    throw new Error(`Unknown algorithm: ${algorithmKey}`);
  }

  // Handle MLFQ queue configs
  if (algorithmKey === 'MLFQ') {
    const q1TQ = options.q1TimeQuantum || 4;
    const q2TQ = options.q2TimeQuantum || 8;
    options.queueConfigs = [
      { timeQuantum: q1TQ, type: 'RR' },
      { timeQuantum: q2TQ, type: 'RR' },
      { timeQuantum: Infinity, type: 'FCFS' }
    ];
  }

  return algo.run(processes, options);
}


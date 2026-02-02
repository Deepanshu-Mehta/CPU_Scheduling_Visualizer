// Ready Queue and I/O Queue implementations

import { ProcessState } from './PCB.js';

/**
 * Ready Queue - Manages processes waiting for CPU
 * Supports different ordering strategies based on algorithm
 */
export class ReadyQueue {
  constructor() {
    this.processes = [];
  }

  /**
   * Add a process to the ready queue
   */
  enqueue(process) {
    process.state = ProcessState.READY;
    this.processes.push(process);
  }

  /**
   * Remove and return the process at the front
   */
  dequeue() {
    if (this.isEmpty()) return null;
    return this.processes.shift();
  }

  /**
   * Get the front process without removing
   */
  peek() {
    return this.processes.length > 0 ? this.processes[0] : null;
  }

  /**
   * Remove a specific process from the queue
   */
  remove(pid) {
    const index = this.processes.findIndex(p => p.pid === pid);
    if (index !== -1) {
      return this.processes.splice(index, 1)[0];
    }
    return null;
  }

  /**
   * Check if queue is empty
   */
  isEmpty() {
    return this.processes.length === 0;
  }

  /**
   * Get queue size
   */
  size() {
    return this.processes.length;
  }

  /**
   * Sort queue by arrival time (FCFS order)
   */
  sortByArrival() {
    this.processes.sort((a, b) => {
      if (a.arrivalTime !== b.arrivalTime) {
        return a.arrivalTime - b.arrivalTime;
      }
      return a.pid - b.pid; // Tie-break by PID
    });
  }

  /**
   * Sort queue by remaining burst time (SJF/SRTF order)
   */
  sortByBurstTime() {
    this.processes.sort((a, b) => {
      if (a.remainingBurstTime !== b.remainingBurstTime) {
        return a.remainingBurstTime - b.remainingBurstTime;
      }
      if (a.arrivalTime !== b.arrivalTime) {
        return a.arrivalTime - b.arrivalTime;
      }
      return a.pid - b.pid; // Tie-break by PID
    });
  }

  /**
   * Sort queue by priority (lower number = higher priority)
   */
  sortByPriority() {
    this.processes.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      if (a.arrivalTime !== b.arrivalTime) {
        return a.arrivalTime - b.arrivalTime;
      }
      return a.pid - b.pid; // Tie-break by PID
    });
  }

  /**
   * Sort queue by response ratio (HRRN)
   * Response Ratio = (W + S) / S where W = waiting time, S = service time
   */
  sortByResponseRatio(currentTime) {
    this.processes.sort((a, b) => {
      const waitA = currentTime - a.arrivalTime;
      const waitB = currentTime - b.arrivalTime;
      const serviceA = a.remainingBurstTime;
      const serviceB = b.remainingBurstTime;
      
      const ratioA = (waitA + serviceA) / serviceA;
      const ratioB = (waitB + serviceB) / serviceB;
      
      if (ratioA !== ratioB) {
        return ratioB - ratioA; // Higher ratio first
      }
      if (a.arrivalTime !== b.arrivalTime) {
        return a.arrivalTime - b.arrivalTime;
      }
      return a.pid - b.pid; // Tie-break by PID
    });
  }

  /**
   * Get all processes (for display purposes)
   */
  getAll() {
    return [...this.processes];
  }

  /**
   * Clear the queue
   */
  clear() {
    this.processes = [];
  }

  /**
   * Apply aging to all processes in queue
   */
  applyAging(currentTime, agingInterval, agingBoost = 1) {
    for (const process of this.processes) {
      if (process.lastReadyTime !== -1) {
        const timeInQueue = currentTime - process.lastReadyTime;
        const agingUnits = Math.floor(timeInQueue / agingInterval);
        if (agingUnits > 0) {
          process.applyAging(agingBoost * agingUnits);
        }
      }
    }
  }

  /**
   * Update wait time for all processes in queue
   */
  incrementWaitTime() {
    for (const process of this.processes) {
      process.waitTime++;
    }
  }
}

/**
 * I/O Queue - Manages processes waiting for I/O completion
 */
export class IOQueue {
  constructor() {
    this.processes = []; // Each entry: { process, remainingIOTime }
  }

  /**
   * Add a process to the I/O queue
   */
  enqueue(process) {
    process.state = ProcessState.WAITING;
    this.processes.push({
      process,
      remainingIOTime: process.remainingBurstTime
    });
  }

  /**
   * Process one time unit of I/O for all waiting processes
   * Returns array of processes that completed I/O
   */
  tick() {
    const completedProcesses = [];
    
    this.processes = this.processes.filter(entry => {
      entry.remainingIOTime--;
      if (entry.remainingIOTime <= 0) {
        // I/O complete, move to next burst
        entry.process.moveToNextBurst();
        completedProcesses.push(entry.process);
        return false; // Remove from queue
      }
      return true; // Keep in queue
    });

    return completedProcesses;
  }

  /**
   * Check if queue is empty
   */
  isEmpty() {
    return this.processes.length === 0;
  }

  /**
   * Get queue size
   */
  size() {
    return this.processes.length;
  }

  /**
   * Get all processes (for display purposes)
   */
  getAll() {
    return this.processes.map(entry => ({
      ...entry.process.toJSON(),
      remainingIOTime: entry.remainingIOTime
    }));
  }

  /**
   * Clear the queue
   */
  clear() {
    this.processes = [];
  }
}

/**
 * Multilevel Feedback Queue structure
 */
export class MLFQueue {
  constructor(queueConfigs = [
    { timeQuantum: 4, type: 'RR' },
    { timeQuantum: 8, type: 'RR' },
    { timeQuantum: Infinity, type: 'FCFS' }
  ]) {
    this.queues = queueConfigs.map((config, level) => ({
      queue: new ReadyQueue(),
      timeQuantum: config.timeQuantum,
      type: config.type,
      level
    }));
  }

  /**
   * Add a process to the appropriate queue
   */
  enqueue(process, level = 0) {
    if (level >= this.queues.length) {
      level = this.queues.length - 1;
    }
    process.currentQueueLevel = level;
    this.queues[level].queue.enqueue(process);
  }

  /**
   * Demote a process to the next lower priority queue
   */
  demote(process) {
    const newLevel = Math.min(process.currentQueueLevel + 1, this.queues.length - 1);
    this.enqueue(process, newLevel);
  }

  /**
   * Promote a process to the next higher priority queue
   */
  promote(process) {
    const newLevel = Math.max(process.currentQueueLevel - 1, 0);
    this.enqueue(process, newLevel);
  }

  /**
   * Get the next process to run (from highest priority non-empty queue)
   */
  getNextProcess() {
    for (const queueInfo of this.queues) {
      if (!queueInfo.queue.isEmpty()) {
        return {
          process: queueInfo.queue.dequeue(),
          timeQuantum: queueInfo.timeQuantum,
          queueLevel: queueInfo.level
        };
      }
    }
    return null;
  }

  /**
   * Peek at the next process without removing
   */
  peekNextProcess() {
    for (const queueInfo of this.queues) {
      if (!queueInfo.queue.isEmpty()) {
        return {
          process: queueInfo.queue.peek(),
          timeQuantum: queueInfo.timeQuantum,
          queueLevel: queueInfo.level
        };
      }
    }
    return null;
  }

  /**
   * Check if all queues are empty
   */
  isEmpty() {
    return this.queues.every(queueInfo => queueInfo.queue.isEmpty());
  }

  /**
   * Get total number of processes across all queues
   */
  totalSize() {
    return this.queues.reduce((sum, queueInfo) => sum + queueInfo.queue.size(), 0);
  }

  /**
   * Get queue information for display
   */
  getQueueStates() {
    return this.queues.map(queueInfo => ({
      level: queueInfo.level,
      type: queueInfo.type,
      timeQuantum: queueInfo.timeQuantum,
      processes: queueInfo.queue.getAll().map(p => p.toJSON())
    }));
  }

  /**
   * Clear all queues
   */
  clear() {
    this.queues.forEach(queueInfo => queueInfo.queue.clear());
  }

  /**
   * Apply aging and potentially promote processes
   */
  applyAging(currentTime, agingInterval, agingThreshold = 3) {
    // For MLFQ, aging promotes processes to higher queue
    for (let i = 1; i < this.queues.length; i++) {
      const processesToPromote = [];
      const queueInfo = this.queues[i];
      
      for (const process of queueInfo.queue.getAll()) {
        if (process.lastReadyTime !== -1) {
          const timeInQueue = currentTime - process.lastReadyTime;
          if (timeInQueue >= agingThreshold * agingInterval) {
            processesToPromote.push(process);
          }
        }
      }

      for (const process of processesToPromote) {
        queueInfo.queue.remove(process.pid);
        this.enqueue(process, i - 1);
        process.lastReadyTime = currentTime;
      }
    }
  }

  /**
   * Increment wait time for all processes in all queues
   */
  incrementWaitTime() {
    this.queues.forEach(queueInfo => queueInfo.queue.incrementWaitTime());
  }
}

export default { ReadyQueue, IOQueue, MLFQueue };

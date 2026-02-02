// Process Control Block (PCB) - Core data structure for each process
import { v4 as uuidv4 } from "uuid";

// Process States
export const ProcessState = {
  NEW: "NEW",
  READY: "READY",
  RUNNING: "RUNNING",
  WAITING: "WAITING",
  TERMINATED: "TERMINATED",
};

// Burst types
export const BurstType = {
  CPU: "CPU",
  IO: "IO",
};

/**
 * Process Control Block class
 * Contains all information needed to manage a process in the scheduler
 */
export class PCB {
  constructor({ pid, arrivalTime, priority = 0, burstSequence = [] }) {
    // Static properties (set at creation)
    this.id = uuidv4(); // Internal unique ID
    this.pid = pid; // Process ID (user-visible integer)
    this.arrivalTime = arrivalTime;
    this.originalPriority = priority;
    this.priority = priority; // Current priority (may change with aging)
    this.burstSequence = burstSequence.map((b) => ({ ...b })); // Deep copy

    // Calculate total CPU burst time
    this.totalCpuBurstTime = burstSequence
      .filter((b) => b.type === BurstType.CPU)
      .reduce((sum, b) => sum + b.duration, 0);

    // Dynamic properties (change during simulation)
    this.state = ProcessState.NEW;
    this.currentBurstIndex = 0;
    this.remainingBurstTime =
      burstSequence.length > 0 ? burstSequence[0].duration : 0;

    // Timing metrics
    this.waitTime = 0;
    this.responseTime = -1; // -1 means not yet responded (first CPU access)
    this.completionTime = -1;
    this.lastReadyTime = -1; // When process last entered Ready queue (for aging)

    // MLFQ specific
    this.currentQueueLevel = 0;
  }

  /**
   * Get the current burst type (CPU or IO)
   */
  getCurrentBurstType() {
    if (this.currentBurstIndex >= this.burstSequence.length) {
      return null;
    }
    return this.burstSequence[this.currentBurstIndex].type;
  }

  /**
   * Get remaining time for current burst
   */
  getRemainingBurstTime() {
    return this.remainingBurstTime;
  }

  /**
   * Execute one time unit of the current burst
   * Returns true if burst is complete
   */
  executeTick() {
    if (this.remainingBurstTime > 0) {
      this.remainingBurstTime--;
    }
    return this.remainingBurstTime === 0;
  }

  /**
   * Move to next burst in sequence
   * Returns true if there are more bursts, false if process is complete
   */
  moveToNextBurst() {
    this.currentBurstIndex++;
    if (this.currentBurstIndex >= this.burstSequence.length) {
      return false; // No more bursts
    }
    this.remainingBurstTime =
      this.burstSequence[this.currentBurstIndex].duration;
    return true;
  }

  /**
   * Calculate turnaround time
   */
  getTurnaroundTime() {
    if (this.completionTime === -1) return -1;
    return this.completionTime - this.arrivalTime;
  }

  /**
   * Calculate waiting time (Turnaround Time - Total CPU Burst Time)
   */
  getWaitingTime() {
    const turnaround = this.getTurnaroundTime();
    if (turnaround === -1) return -1;
    return turnaround - this.totalCpuBurstTime;
  }

  /**
   * Check if process has completed all bursts
   */
  isComplete() {
    return this.currentBurstIndex >= this.burstSequence.length;
  }

  /**
   * Apply aging - increase priority (decrease priority number)
   */
  applyAging(agingBoost = 1) {
    if (this.priority > 0) {
      this.priority = Math.max(0, this.priority - agingBoost);
    }
  }

  /**
   * Reset priority to original value
   */
  resetPriority() {
    this.priority = this.originalPriority;
  }

  /**
   * Create a deep clone of the PCB
   */
  clone() {
    const cloned = new PCB({
      pid: this.pid,
      arrivalTime: this.arrivalTime,
      priority: this.originalPriority,
      burstSequence: this.burstSequence.map((b) => ({ ...b })),
    });
    cloned.id = this.id;
    cloned.state = this.state;
    cloned.currentBurstIndex = this.currentBurstIndex;
    cloned.remainingBurstTime = this.remainingBurstTime;
    cloned.priority = this.priority;
    cloned.waitTime = this.waitTime;
    cloned.responseTime = this.responseTime;
    cloned.completionTime = this.completionTime;
    cloned.lastReadyTime = this.lastReadyTime;
    cloned.currentQueueLevel = this.currentQueueLevel;
    return cloned;
  }

  /**
   * Serialize to plain object
   */
  toJSON() {
    return {
      pid: this.pid,
      arrivalTime: this.arrivalTime,
      priority: this.priority,
      originalPriority: this.originalPriority,
      burstSequence: this.burstSequence,
      state: this.state,
      currentBurstIndex: this.currentBurstIndex,
      remainingBurstTime: this.remainingBurstTime,
      totalCpuBurstTime: this.totalCpuBurstTime,
      waitTime: this.waitTime,
      responseTime: this.responseTime,
      completionTime: this.completionTime,
      turnaroundTime: this.getTurnaroundTime(),
      calculatedWaitTime: this.getWaitingTime(),
      currentQueueLevel: this.currentQueueLevel,
    };
  }
}

/**
 * Create a PCB from simple input format
 * @param {number} pid - Process ID
 * @param {number} arrivalTime - Arrival time
 * @param {number} cpuBurst - CPU burst time (for simple processes)
 * @param {number} priority - Priority (optional)
 * @param {Array} ioBursts - Array of {afterCpu: number, duration: number} for I/O bursts
 */
export function createSimplePCB(
  pid,
  arrivalTime,
  cpuBurst,
  priority = 0,
  ioBursts = [],
) {
  // If no I/O bursts, create simple CPU-only process
  if (ioBursts.length === 0) {
    return new PCB({
      pid,
      arrivalTime,
      priority,
      burstSequence: [{ type: BurstType.CPU, duration: cpuBurst }],
    });
  }

  // Create burst sequence with I/O
  const burstSequence = [];
  let remainingCpu = cpuBurst;

  // Sort I/O bursts by when they occur
  const sortedIO = [...ioBursts].sort((a, b) => a.afterCpu - b.afterCpu);

  let cpuConsumed = 0;
  for (const io of sortedIO) {
    const cpuBeforeIO = io.afterCpu - cpuConsumed;
    if (cpuBeforeIO > 0) {
      burstSequence.push({ type: BurstType.CPU, duration: cpuBeforeIO });
      cpuConsumed += cpuBeforeIO;
      remainingCpu -= cpuBeforeIO;
    }
    burstSequence.push({ type: BurstType.IO, duration: io.duration });
  }

  // Add remaining CPU burst
  if (remainingCpu > 0) {
    burstSequence.push({ type: BurstType.CPU, duration: remainingCpu });
  }

  return new PCB({
    pid,
    arrivalTime,
    priority,
    burstSequence,
  });
}

export default PCB;

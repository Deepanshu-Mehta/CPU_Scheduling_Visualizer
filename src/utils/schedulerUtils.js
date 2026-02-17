// Shared scheduler utility functions
// Extracted to eliminate code duplication across algorithms and simulation controller

import { ProcessState } from '../core/PCB.js';

/**
 * Consolidate raw Gantt chart entries by merging consecutive same-process blocks
 * @param {Array} rawGanttChart - Array of per-tick Gantt entries
 * @returns {Array} - Consolidated Gantt chart with startTime, endTime, duration
 */
export function consolidateGanttChart(rawGanttChart) {
  const consolidated = [];
  for (const entry of rawGanttChart) {
    const last = consolidated[consolidated.length - 1];
    if (
      last &&
      last.type === entry.type &&
      last.pid === entry.pid &&
      last.queueLevel === entry.queueLevel
    ) {
      last.endTime = entry.time + 1;
      last.duration++;
    } else {
      consolidated.push({
        ...entry,
        startTime: entry.time,
        endTime: entry.time + 1,
        duration: 1,
      });
    }
  }
  return consolidated;
}

/**
 * Calculate standard scheduling metrics from completed processes
 * @param {Array} processes - Array of PCB instances (must have state, getTurnaroundTime, etc.)
 * @param {Array} ganttChart - Raw Gantt chart entries
 * @param {number} totalTime - Total simulation time
 * @param {number} cpuBusyTime - Total time CPU was busy
 * @returns {Object} - Metrics object
 */
export function calculateMetrics(processes, ganttChart, totalTime, cpuBusyTime) {
  const completedProcs = processes.filter(
    (p) => p.state === ProcessState.TERMINATED,
  );

  const avgTurnaroundTime =
    completedProcs.length > 0
      ? completedProcs.reduce((sum, p) => sum + p.getTurnaroundTime(), 0) /
        completedProcs.length
      : 0;

  const avgWaitingTime =
    completedProcs.length > 0
      ? completedProcs.reduce((sum, p) => sum + p.getWaitingTime(), 0) /
        completedProcs.length
      : 0;

  const avgResponseTime =
    completedProcs.length > 0
      ? completedProcs.reduce((sum, p) => sum + p.responseTime, 0) /
        completedProcs.length
      : 0;

  const cpuUtilization =
    totalTime > 0 ? (cpuBusyTime / totalTime) * 100 : 0;

  const throughput =
    totalTime > 0 ? completedProcs.length / totalTime : 0;

  return {
    avgTurnaroundTime,
    avgWaitingTime,
    avgResponseTime,
    cpuUtilization,
    throughput,
    totalTime,
    contextSwitches: ganttChart.filter((e) => e.type === 'CONTEXT_SWITCH')
      .length,
  };
}

/**
 * Validate process inputs before simulation start
 * @param {Array} processInputs - Array of process input objects
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateProcessInputs(processInputs) {
  const errors = [];

  if (!processInputs || processInputs.length === 0) {
    errors.push('At least one process is required.');
    return { valid: false, errors };
  }

  processInputs.forEach((p) => {
    if (p.cpuBurst <= 0) {
      errors.push(`P${p.pid}: CPU burst must be greater than 0.`);
    }
    if (p.arrivalTime < 0) {
      errors.push(`P${p.pid}: Arrival time cannot be negative.`);
    }
    if (p.ioEnabled && p.ioBursts) {
      p.ioBursts.forEach((io, idx) => {
        if (io.afterCpu < 0 || io.afterCpu > p.cpuBurst) {
          errors.push(
            `P${p.pid} I/O #${idx + 1}: "After CPU" value must be between 0 and ${p.cpuBurst}.`,
          );
        }
        if (io.duration <= 0) {
          errors.push(
            `P${p.pid} I/O #${idx + 1}: Duration must be greater than 0.`,
          );
        }
      });

      // Check for overlapping I/O bursts
      const sorted = [...(p.ioBursts || [])].sort(
        (a, b) => a.afterCpu - b.afterCpu,
      );
      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i].afterCpu === sorted[i - 1].afterCpu) {
          errors.push(
            `P${p.pid}: Multiple I/O bursts at the same CPU position (${sorted[i].afterCpu}).`,
          );
        }
      }
    }
  });

  return { valid: errors.length === 0, errors };
}

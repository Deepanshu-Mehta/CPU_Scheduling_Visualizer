/**
 * Utility functions for CPU scheduling algorithms
 */

/**
 * Consolidates raw Gantt chart data by combining contiguous blocks
 * of the same process/idle time into start/end intervals.
 */
export function consolidateGanttChart(rawGantt) {
  if (!rawGantt || rawGantt.length === 0) return [];
  
  const consolidated = [];
  let currentBlock = {
    type: rawGantt[0].type,
    pid: rawGantt[0].pid,
    startTime: rawGantt[0].time,
    endTime: rawGantt[0].time + 1,
    queueLevel: rawGantt[0].queueLevel
  };

  for (let i = 1; i < rawGantt.length; i++) {
    const tick = rawGantt[i];
    // If it's a context switch, treat it separately
    if (tick.type === 'CONTEXT_SWITCH') {
      consolidated.push({ ...currentBlock });
      currentBlock = {
        type: tick.type,
        pid: null,
        startTime: tick.time,
        endTime: tick.time + 1,
        queueLevel: tick.queueLevel
      };
      continue;
    }

    if (tick.type === currentBlock.type && tick.pid === currentBlock.pid && tick.queueLevel === currentBlock.queueLevel) {
       // Extend the block
      currentBlock.endTime = tick.time + 1;
    } else {
      consolidated.push({ ...currentBlock });
      currentBlock = {
        type: tick.type,
        pid: tick.pid,
        startTime: tick.time,
        endTime: tick.time + 1,
        queueLevel: tick.queueLevel
      };
    }
  }
  consolidated.push(currentBlock);
  return consolidated;
}

/**
 * Re-calculate aggregate metrics for the given set of processes.
 */
export function calculateMetrics(processes, rawGanttChart, totalTime, cpuBusyTime) {
  if (!processes || processes.length === 0) {
    return {
      avgTurnaroundTime: 0,
      avgWaitingTime: 0,
      avgResponseTime: 0,
      cpuUtilization: 0,
      totalTime: totalTime,
      contextSwitches: 0
    };
  }

  let totalTurnaroundTime = 0;
  let totalWaitingTime = 0;
  let totalResponseTime = 0;
  
  const contextSwitches = rawGanttChart.filter(tick => tick.type === 'CONTEXT_SWITCH').length;

  processes.forEach(p => {
    const tat = typeof p.getTurnaroundTime === 'function'
      ? p.getTurnaroundTime()
      : (p.turnaroundTime ?? 0);
    const wt = typeof p.getWaitingTime === 'function'
      ? p.getWaitingTime()
      : (p.calculatedWaitTime ?? 0);
    const rt = p.responseTime ?? 0;

    totalTurnaroundTime += tat > 0 ? tat : 0;
    totalWaitingTime += wt > 0 ? wt : 0;
    totalResponseTime += rt > -1 ? rt : 0;
  });

  return {
    avgTurnaroundTime: totalTurnaroundTime / processes.length,
    avgWaitingTime: totalWaitingTime / processes.length,
    avgResponseTime: totalResponseTime / processes.length,
    cpuUtilization: totalTime > 0 ? (cpuBusyTime / totalTime) * 100 : 0,
    totalTime,
    contextSwitches
  };
}

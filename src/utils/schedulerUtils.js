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
      contextSwitches: 0,
      throughput: 0,
      avgCompletionTime: 0,
      idleTime: 0,
      maxWaitingTime: 0,
      maxResponseTime: 0,
      schedulingLength: 0,
      perProcess: []
    };
  }

  let totalTurnaroundTime = 0;
  let totalWaitingTime = 0;
  let totalResponseTime = 0;
  let totalCompletionTime = 0;
  let maxWaitingTime = 0;
  let maxResponseTime = 0;
  let minArrivalTime = Infinity;
  
  const contextSwitches = rawGanttChart.filter(tick => tick.type === 'CONTEXT_SWITCH').length;

  const perProcess = [];

  processes.forEach(p => {
    const tat = typeof p.getTurnaroundTime === 'function'
      ? p.getTurnaroundTime()
      : (p.turnaroundTime ?? 0);
    const wt = typeof p.getWaitingTime === 'function'
      ? p.getWaitingTime()
      : (p.calculatedWaitTime ?? 0);
    const rt = p.responseTime ?? 0;
    const ct = p.completionTime ?? 0;
    const at = p.arrivalTime ?? 0;
    const burst = p.totalCpuBurstTime ?? (p.cpuBurst ?? 0);

    const safeTat = tat > 0 ? tat : 0;
    const safeWt = wt > 0 ? wt : 0;
    const safeRt = rt > -1 ? rt : 0;

    totalTurnaroundTime += safeTat;
    totalWaitingTime += safeWt;
    totalResponseTime += safeRt;
    totalCompletionTime += ct > 0 ? ct : 0;

    if (safeWt > maxWaitingTime) maxWaitingTime = safeWt;
    if (safeRt > maxResponseTime) maxResponseTime = safeRt;
    if (at < minArrivalTime) minArrivalTime = at;

    perProcess.push({
      pid: p.pid,
      arrivalTime: at,
      burstTime: burst,
      completionTime: ct > 0 ? ct : 0,
      turnaroundTime: safeTat,
      waitingTime: safeWt,
      responseTime: safeRt
    });
  });

  const n = processes.length;
  const idleTime = totalTime - cpuBusyTime;
  const schedulingLength = totalTime - (minArrivalTime !== Infinity ? minArrivalTime : 0);

  return {
    avgTurnaroundTime: totalTurnaroundTime / n,
    avgWaitingTime: totalWaitingTime / n,
    avgResponseTime: totalResponseTime / n,
    cpuUtilization: totalTime > 0 ? (cpuBusyTime / totalTime) * 100 : 0,
    totalTime,
    contextSwitches,
    throughput: totalTime > 0 ? n / totalTime : 0,
    avgCompletionTime: totalCompletionTime / n,
    idleTime: idleTime > 0 ? idleTime : 0,
    maxWaitingTime,
    maxResponseTime,
    schedulingLength: schedulingLength > 0 ? schedulingLength : totalTime,
    perProcess
  };
}

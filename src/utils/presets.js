// Preset scenarios for classic CPU scheduling demonstrations

export const PRESETS = [
  {
    id: 'convoy',
    name: '🚛 Convoy Effect',
    description: 'Demonstrates how a long CPU burst blocks shorter processes in FCFS.',
    algorithm: 'FCFS',
    processes: [
      { id: 1, pid: 1, arrivalTime: 0, cpuBurst: 24, priority: 0, ioEnabled: false, ioBursts: [] },
      { id: 2, pid: 2, arrivalTime: 1, cpuBurst: 3, priority: 0, ioEnabled: false, ioBursts: [] },
      { id: 3, pid: 3, arrivalTime: 2, cpuBurst: 3, priority: 0, ioEnabled: false, ioBursts: [] },
    ],
  },
  {
    id: 'sjf-optimal',
    name: '⚡ SJF Optimal',
    description: 'Shows SJF achieving minimum average waiting time on non-preemptive workload.',
    algorithm: 'SJF',
    processes: [
      { id: 1, pid: 1, arrivalTime: 0, cpuBurst: 6, priority: 0, ioEnabled: false, ioBursts: [] },
      { id: 2, pid: 2, arrivalTime: 0, cpuBurst: 8, priority: 0, ioEnabled: false, ioBursts: [] },
      { id: 3, pid: 3, arrivalTime: 0, cpuBurst: 7, priority: 0, ioEnabled: false, ioBursts: [] },
      { id: 4, pid: 4, arrivalTime: 0, cpuBurst: 3, priority: 0, ioEnabled: false, ioBursts: [] },
    ],
  },
  {
    id: 'starvation',
    name: '🔒 Priority Starvation',
    description: 'Low-priority process starves without aging in non-preemptive priority scheduling.',
    algorithm: 'PRIORITY_NP',
    processes: [
      { id: 1, pid: 1, arrivalTime: 0, cpuBurst: 10, priority: 3, ioEnabled: false, ioBursts: [] },
      { id: 2, pid: 2, arrivalTime: 1, cpuBurst: 4, priority: 1, ioEnabled: false, ioBursts: [] },
      { id: 3, pid: 3, arrivalTime: 2, cpuBurst: 5, priority: 1, ioEnabled: false, ioBursts: [] },
      { id: 4, pid: 4, arrivalTime: 3, cpuBurst: 6, priority: 2, ioEnabled: false, ioBursts: [] },
      { id: 5, pid: 5, arrivalTime: 0, cpuBurst: 3, priority: 5, ioEnabled: false, ioBursts: [] },
    ],
  },
  {
    id: 'rr-quantum',
    name: '🔄 Round Robin Effect',
    description: 'Compare fair time-slicing with TQ=4 across varied burst lengths.',
    algorithm: 'ROUND_ROBIN',
    processes: [
      { id: 1, pid: 1, arrivalTime: 0, cpuBurst: 10, priority: 0, ioEnabled: false, ioBursts: [] },
      { id: 2, pid: 2, arrivalTime: 0, cpuBurst: 4, priority: 0, ioEnabled: false, ioBursts: [] },
      { id: 3, pid: 3, arrivalTime: 0, cpuBurst: 7, priority: 0, ioEnabled: false, ioBursts: [] },
    ],
  },
  {
    id: 'srtf-preemption',
    name: '⏩ SRTF Preemption',
    description: 'Shows preemption when a shorter job arrives while a long job is running.',
    algorithm: 'SRTF',
    processes: [
      { id: 1, pid: 1, arrivalTime: 0, cpuBurst: 8, priority: 0, ioEnabled: false, ioBursts: [] },
      { id: 2, pid: 2, arrivalTime: 1, cpuBurst: 4, priority: 0, ioEnabled: false, ioBursts: [] },
      { id: 3, pid: 3, arrivalTime: 2, cpuBurst: 2, priority: 0, ioEnabled: false, ioBursts: [] },
      { id: 4, pid: 4, arrivalTime: 3, cpuBurst: 1, priority: 0, ioEnabled: false, ioBursts: [] },
    ],
  },
  {
    id: 'mlfq-demotion',
    name: '📶 MLFQ Demotion',
    description: 'CPU-bound process gets demoted while I/O-bound process stays in Q0.',
    algorithm: 'MLFQ',
    processes: [
      { id: 1, pid: 1, arrivalTime: 0, cpuBurst: 20, priority: 0, ioEnabled: false, ioBursts: [] },
      { id: 2, pid: 2, arrivalTime: 0, cpuBurst: 3, priority: 0, ioEnabled: false, ioBursts: [] },
      { id: 3, pid: 3, arrivalTime: 2, cpuBurst: 3, priority: 0, ioEnabled: false, ioBursts: [] },
      { id: 4, pid: 4, arrivalTime: 4, cpuBurst: 3, priority: 0, ioEnabled: false, ioBursts: [] },
    ],
  },
  {
    id: 'hrrn-demo',
    name: '📊 HRRN Fairness',
    description: 'HRRN favors long-waiting processes using response ratio = (W + S) / S.',
    algorithm: 'HRRN',
    processes: [
      { id: 1, pid: 1, arrivalTime: 0, cpuBurst: 3, priority: 0, ioEnabled: false, ioBursts: [] },
      { id: 2, pid: 2, arrivalTime: 2, cpuBurst: 6, priority: 0, ioEnabled: false, ioBursts: [] },
      { id: 3, pid: 3, arrivalTime: 4, cpuBurst: 4, priority: 0, ioEnabled: false, ioBursts: [] },
      { id: 4, pid: 4, arrivalTime: 6, cpuBurst: 5, priority: 0, ioEnabled: false, ioBursts: [] },
      { id: 5, pid: 5, arrivalTime: 8, cpuBurst: 2, priority: 0, ioEnabled: false, ioBursts: [] },
    ],
  },
  {
    id: 'io-burst',
    name: '💾 I/O Burst Demo',
    description: 'Processes with interleaved CPU and I/O bursts showing state transitions.',
    algorithm: 'FCFS',
    processes: [
      { id: 1, pid: 1, arrivalTime: 0, cpuBurst: 8, priority: 0, ioEnabled: true, ioBursts: [{ afterCpu: 3, duration: 2 }] },
      { id: 2, pid: 2, arrivalTime: 1, cpuBurst: 5, priority: 0, ioEnabled: true, ioBursts: [{ afterCpu: 2, duration: 3 }] },
      { id: 3, pid: 3, arrivalTime: 2, cpuBurst: 6, priority: 0, ioEnabled: false, ioBursts: [] },
    ],
  },
];

export default PRESETS;

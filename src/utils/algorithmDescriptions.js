// Algorithm descriptions for educational tooltips

export const ALGORITHM_DESCRIPTIONS = {
  FCFS: {
    description: 'Processes are executed in the order they arrive. Simple but can cause the convoy effect where short processes wait behind long ones.',
    bestFor: 'Simple batch systems with similar burst lengths',
    weakness: 'High average waiting time with varying burst lengths',
  },
  SJF: {
    description: 'Selects the process with the shortest CPU burst time from the ready queue. Provably optimal for minimizing average waiting time.',
    bestFor: 'Minimizing average waiting time when all arrival times are known',
    weakness: 'Requires knowing burst times in advance; can cause starvation of long processes',
  },
  SRTF: {
    description: 'Preemptive version of SJF. If a new process arrives with a shorter remaining burst than the running process, it preempts the CPU.',
    bestFor: 'Minimizing average waiting time in dynamic workloads',
    weakness: 'Frequent context switches; starvation of long processes',
  },
  PRIORITY_NP: {
    description: 'Selects the process with the highest priority (lowest number). Non-preemptive — once a process starts, it runs to completion.',
    bestFor: 'Systems where process importance varies and preemption is costly',
    weakness: 'Low-priority processes may starve indefinitely without aging',
  },
  PRIORITY_P: {
    description: 'Preemptive priority scheduling. A higher-priority process arriving will immediately preempt the running process.',
    bestFor: 'Real-time systems requiring immediate response to high-priority tasks',
    weakness: 'Starvation of low-priority processes; more context switches',
  },
  ROUND_ROBIN: {
    description: 'Each process gets a fixed time quantum. After the quantum expires, the process is preempted and moved to the back of the ready queue.',
    bestFor: 'Time-sharing systems requiring fair CPU distribution',
    weakness: 'Performance depends heavily on time quantum selection',
  },
  HRRN: {
    description: 'Selects the process with the highest Response Ratio = (W + S) / S, where W is waiting time and S is service time. Balances short jobs and long-waiting jobs.',
    bestFor: 'Preventing starvation while favoring shorter jobs',
    weakness: 'Requires calculating ratios each scheduling decision (overhead)',
  },
  MLFQ: {
    description: 'Uses multiple queues with different priority levels and time quanta. New processes start at the highest priority. CPU-bound processes get demoted; I/O-bound processes stay promoted.',
    bestFor: 'General-purpose OS schedulers (used in Linux, Windows, macOS)',
    weakness: 'Complex to configure; behavior depends on queue parameters',
  },
};

export default ALGORITHM_DESCRIPTIONS;

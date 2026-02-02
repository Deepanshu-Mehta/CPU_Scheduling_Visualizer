# CPU Scheduling Visualizer

A high-fidelity CPU Scheduling Visualizer built with React + Vite featuring real-time D3.js animations and 8 scheduling algorithms.

## Features

- **8 Scheduling Algorithms**: FCFS, SJF, SRTF, Priority (P/NP), Round Robin, HRRN, MLFQ
- **Real-time Visualization**: D3.js Gantt chart with 60fps animation
- **Process State Tracking**: 5 states (New → Ready → Running → Waiting → Terminated)
- **Configurable Parameters**: Time quantum, context switch overhead, aging intervals
- **Comparison Dashboard**: Side-by-side algorithm analysis
- **Export Options**: JSON and PDF report generation
- **I/O Burst Simulation**: Complete Ready → Waiting → Ready transitions
- **Zoom Controls**: Scalable Gantt chart for many processes

## Tech Stack

- **Frontend**: React 18 + Vite
- **Visualization**: D3.js
- **State Management**: React Context + useReducer
- **Styling**: CSS with modern dark theme

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

Then open http://localhost:5173

## Algorithms Implemented

| Algorithm     | Type           | Description                   |
| ------------- | -------------- | ----------------------------- |
| FCFS          | Non-Preemptive | First Come First Serve        |
| SJF           | Non-Preemptive | Shortest Job First            |
| SRTF          | Preemptive     | Shortest Remaining Time First |
| Priority (NP) | Non-Preemptive | Priority with Aging           |
| Priority (P)  | Preemptive     | Priority with Aging           |
| Round Robin   | Preemptive     | Configurable Time Quantum     |
| HRRN          | Non-Preemptive | Highest Response Ratio Next   |
| MLFQ          | Preemptive     | 3-Queue Multilevel Feedback   |

## Performance Metrics

- Average Turnaround Time (ATAT)
- Average Waiting Time (AWT)
- Average Response Time
- CPU Utilization (%)
- Context Switch Count

## Project Structure

```
src/
├── core/           # PCB, Queues data structures
├── algorithms/     # All scheduling algorithm implementations
├── simulation/     # SimulationController with requestAnimationFrame
├── context/        # React Context for state management
├── components/     # UI components (tables, controls, metrics)
├── visualization/  # D3.js Gantt chart
└── utils/          # Export utilities
```

## License

MIT

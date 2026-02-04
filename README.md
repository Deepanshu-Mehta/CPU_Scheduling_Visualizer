# CPU Scheduling Visualizer

An expert-grade Operating System simulation tool designed to bridge the gap between theoretical scheduling algorithms and practical kernel behavior. This visualizer provides a high-fidelity, interactive environment to observe how a CPU manages processes under varying workloads and realistic constraints like context-switching overhead.

![CPU Scheduling Visualizer](https://img.shields.io/badge/React-18-blue?logo=react) ![Vite](https://img.shields.io/badge/Vite-7-purple?logo=vite) ![D3.js](https://img.shields.io/badge/D3.js-7-orange?logo=d3.js) ![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Key Features

### 🔧 7+ Standard Algorithms

Robust implementations of industry-standard CPU scheduling algorithms:

- **FCFS** - First Come First Serve
- **SJF** - Shortest Job First (Non-Preemptive)
- **SRTF** - Shortest Remaining Time First (Preemptive)
- **Round Robin** - Configurable Time Quantum
- **Priority Scheduling** - Preemptive & Non-Preemptive with Aging
- **HRRN** - Highest Response Ratio Next (Math-Transparent)
- **MLFQ** - Multi-Level Feedback Queue (3 Priority Levels)

### 📊 High-Fidelity Visualization

| Feature                    | Description                                                                            |
| -------------------------- | -------------------------------------------------------------------------------------- |
| **Dynamic Gantt Chart**    | Visualizes execution, idle time, and shaded context-switch overhead with zoom controls |
| **Dispatcher View**        | Real-time animation of process flow from Ready Queue → Context Switch → CPU            |
| **MLFQ Hierarchy**         | Specialized dashboard showing process movement across priority queues (Q0, Q1, Q2)     |
| **Process State Tracking** | 5 states (New → Ready → Running → Waiting → Terminated) with I/O burst simulation      |

### 📈 Deep Performance Analytics

Real-time calculation of:

- **Average Turnaround Time (TAT)**
- **Average Waiting Time (WT)**
- **Average Response Time (RT)**
- **CPU Utilization** (mathematically accurate)
- **Context Switch Count**

### 🔬 Research Tools

- **Algorithm Comparison Mode** - Side-by-side analysis on identical datasets
- **Export to JSON** - Raw data for programmatic analysis
- **Export to PDF** - Formatted reports for academic submissions
- **Interactive Tutorial** - Guided walkthrough for first-time users

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/Deepanshu-Mehta/CPU_Scheduling_Visualizer.git
cd CPU_Scheduling_Visualizer

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🛠️ Tech Stack

| Category             | Technology                 |
| -------------------- | -------------------------- |
| **Frontend**         | React 18 + Vite            |
| **Visualization**    | D3.js                      |
| **State Management** | React Context + useReducer |
| **Styling**          | CSS with modern dark theme |
| **Build Tool**       | Vite                       |
| **Linting**          | ESLint                     |

---

## 📋 Algorithm Comparison

| Algorithm     | Type           | Key Characteristic                        |
| ------------- | -------------- | ----------------------------------------- |
| FCFS          | Non-Preemptive | Simple, FIFO ordering                     |
| SJF           | Non-Preemptive | Optimal for average waiting time          |
| SRTF          | Preemptive     | Preempts on shorter burst arrival         |
| Priority (NP) | Non-Preemptive | Priority with aging to prevent starvation |
| Priority (P)  | Preemptive     | Immediate preemption on higher priority   |
| Round Robin   | Preemptive     | Time slicing with configurable quantum    |
| HRRN          | Non-Preemptive | Response ratio: (W + S) / S               |
| MLFQ          | Preemptive     | 3-queue hierarchy with demotion/promotion |

---

## 📁 Project Structure

```
src/
├── core/           # PCB, Queues data structures
├── algorithms/     # All scheduling algorithm implementations
├── simulation/     # SimulationController with requestAnimationFrame
├── context/        # React Context for state management
├── components/     # UI components (tables, controls, metrics)
├── visualization/  # D3.js Gantt chart
└── utils/          # Export utilities (JSON, PDF)
```

---

## 🎓 Educational Use

This tool is designed for:

- **Operating Systems courses** - Demonstrate scheduling concepts visually
- **Research projects** - Compare algorithm performance with exportable data
- **Self-learning** - Interactive tutorial guides new users

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

<div align="center">
  <strong>Built with ❤️ for OS enthusiasts</strong>
</div>

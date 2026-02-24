# CPU Scheduling Visualizer

An expert-grade Operating System simulation tool designed to bridge the gap between theoretical scheduling algorithms and practical kernel behavior. This visualizer provides a high-fidelity, interactive environment to observe how a CPU manages processes under varying workloads and realistic constraints like context-switching overhead.

![CPU Scheduling Visualizer](https://img.shields.io/badge/React-18-blue?logo=react) ![Vite](https://img.shields.io/badge/Vite-7-purple?logo=vite) ![D3.js](https://img.shields.io/badge/D3.js-7-orange?logo=d3.js) ![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel) ![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Key Features

### 🏢 Premium Interactive Dashboard
A stunning, state-of-the-art landing page featuring:
- **Magnetic Interaction** - Interactive buttons with physics-based movement.
- **Three.js Background** - Immersive 3D animated environment.
- **Micro-animations** - Framer Motion powered transitions and hover effects.
- **Algorithm Exploration** - Instant preview and direct simulation entry for 7+ algorithms.

### 🔧 7+ Standard Algorithms
Robust implementations of industry-standard CPU scheduling algorithms:
- **FCFS** - First Come First Serve
- **SJF** - Shortest Job First (Non-Preemptive)
- **SRTF** - Shortest Remaining Time First (Preemptive)
- **Round Robin** - Configurable Time Quantum
- **Priority Scheduling** - Preemptive & Non-Preemptive with Aging
- **HRRN** - Highest Response Ratio Next (Wait-aware Optimization)
- **MLFQ** - Multi-Level Feedback Queue (Adaptive 3-tier Hierarchy)

### 📊 High-Fidelity Visualization
| Feature                    | Description                                                                            |
| -------------------------- | -------------------------------------------------------------------------------------- |
| **Real-time Gantt Chart**  | D3.js powered timeline with zoom, pan, and dynamic duration tooltips                   |
| **Dispatcher View**        | Visual representation of Ready Queue, I/O Queue, and CPU transitions                   |
| **MLFQ Dashboard**         | Specialized visualization of process movement across priority queues                    |
| **State-Machine Tracking** | Complete lifecycle tracking: New → Ready → Running → Waiting → Terminated              |

### 📈 Advanced Performance Metrics
Real-time analytics engine calculating:
- **Primary Stats** - Avg Turnaround, Wait, and Response times.
- **System Efficiency** - Accurate CPU Utilization & Throughput (Processes/Time).
- **Per-Process Breakdown** - Detailed metric table for every simulated process.
- **Overhead Analysis** - Context-switch count and total overhead impact.

### 🔬 Research & Export
- **Comparison Mode** - Run multiple algorithms on the exact same workload side-by-side.
- **Data Export** - Save simulation results to **JSON** or professional **PDF** reports.
- **SPA Optimized** - Native Vercel support with integrated client-side routing rewrites.

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
```

---

## 🛠️ Tech Stack

| Category             | Technology                           |
| -------------------- | ------------------------------------ |
| **Frontend Core**    | React 18 + Vite                      |
| **Visualization**    | D3.js v7                             |
| **Animations**       | Framer Motion + Three.js             |
| **Icons**            | Lucide React                         |
| **State Management** | React Context + useReducer           |
| **Deployment**       | Vercel (SPA-configured)              |

---

## 📁 Project Structure

```
src/
├── core/           # PCB & Queue data structures
├── algorithms/     # Pure functional algorithm logic
├── simulation/     # Tick-by-tick Simulation Controller
├── components/     # UI Design System & Component Library
├── visualization/  # D3.js Visualization components
└── pages/          # Dashboard & Main Landing
```

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

---

<div align="center">
  <strong>Built with ❤️ for OS enthusiasts and CS students</strong>
</div>

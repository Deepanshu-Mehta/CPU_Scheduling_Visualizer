import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Minus,
  Cpu,
  Clock,
  Layers,
  Zap,
  ArrowRightLeft,
  Activity,
  BarChart2,
  ChevronDown,
  ArrowRight,
  Github,
  BarChart3,
  GitCompare,
} from "lucide-react";
import { ThreeBackground } from "../components/ThreeBackground.jsx";
import { CustomCursor } from "../components/CustomCursor.jsx";
import "./Dashboard.css";

const algorithms = [
  {
    id: "fcfs",
    algoKey: "FCFS",
    name: "First-Come, First-Served",
    short: "01 / FCFS",
    icon: <Clock size={24} strokeWidth={1} />,
    description:
      "The absolute baseline of process orchestration. Tasks are queued and executed strictly in the order they arrive, offering perfect fairness at the cost of potential bottlenecking. A non-preemptive foundation.",
    bestFor: "Batch processing, predictable workloads",
  },
  {
    id: "sjf",
    algoKey: "SJF",
    name: "Shortest Job First",
    short: "02 / SJF",
    icon: <Zap size={24} strokeWidth={1} />,
    description:
      "An aggressive optimization paradigm where the scheduler peers ahead, selecting the process with the smallest impending CPU burst. This mathematically guarantees the minimum average waiting time across the system.",
    bestFor: "Throughput maximization, known burst times",
  },
  {
    id: "srtf",
    algoKey: "SRTF",
    name: "Shortest Remaining Time",
    short: "03 / SRTF",
    icon: <Activity size={24} strokeWidth={1} />,
    description:
      "The ruthless, preemptive sibling to SJF. If a new process arrives requiring less time than the current process has remaining, the CPU is immediately hijacked. Maximum responsiveness, high context-switching overhead.",
    bestFor: "Interactive and responsive environments",
  },
  {
    id: "rr",
    algoKey: "ROUND_ROBIN",
    name: "Round Robin",
    short: "04 / RR",
    icon: <ArrowRightLeft size={24} strokeWidth={1} />,
    description:
      "The beating heart of modern time-sharing. CPU time is sliced into equal quanta; processes cycle through execution seamlessly. Ensures no process starves, acting as the great equalizer of scheduled tasks.",
    bestFor: "General-purpose OS, user interactivity",
  },
  {
    id: "priority",
    algoKey: "PRIORITY_NP",
    name: "Priority Scheduling",
    short: "05 / PRIO",
    icon: <BarChart2 size={24} strokeWidth={1} />,
    description:
      "A strict hierarchy of execution. Processes are assigned importance tiers, and the CPU strictly honors the highest rank. Essential for system stability, though lower ranks risk eternal starvation without aging mechanisms.",
    bestFor: "Real-time infrastructure, mission-critical tasks",
  },
  {
    id: "hrrn",
    algoKey: "HRRN",
    name: "Highest Response Ratio",
    short: "06 / HRRN",
    icon: <Activity size={24} strokeWidth={1} />,
    description:
      "An elegant mathematical compromise. By factoring both execution time and time already spent waiting, this algorithm naturally elevates long-waiting processes, comprehensively eliminating starvation while maintaining throughput.",
    bestFor: "Fair, starvation-free throughput",
  },
  {
    id: "mlfq",
    algoKey: "MLFQ",
    name: "Multilevel Feedback",
    short: "07 / MLFQ",
    icon: <Layers size={24} strokeWidth={1} />,
    description:
      "The pinnacle of complex scheduling. A cascade of distinct queues where processes dynamically sink or float based on their runtime behavior. It learns, adapts, and optimizes without requiring prior knowledge of task lengths.",
    bestFor: "Complex, unpredictable, modern operating systems",
  },
];

function MagneticButton({ children, onClick, className }) {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      className="magnetic-btn-wrapper"
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 300, damping: 20, mass: 0.5 }}
    >
      <button className={className} onClick={onClick}>
        {children}
      </button>
    </motion.div>
  );
}

export function Dashboard() {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState(null);
  const [showNav, setShowNav] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowNav(window.scrollY > 200);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const titleVariants = {
    hidden: { y: 100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 1.5, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const pageVariants = {
    initial: { opacity: 1 },
    exit: {
      opacity: 0,
      y: -30,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const toggleAccordion = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <motion.div
      className="dashboard-container"
      variants={pageVariants}
      initial="initial"
      exit="exit"
    >
      <CustomCursor />
      <ThreeBackground />

      <motion.nav
        className={`sticky-nav ${showNav ? "visible" : ""}`}
        initial={{ y: -80 }}
        animate={{ y: showNav ? 0 : -80 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="nav-inner">
          <div className="nav-logo">
            <Cpu size={20} strokeWidth={1.5} />
            <span>CPU Scheduler</span>
          </div>
          <button
            className="nav-cta hover-target"
            onClick={() => navigate("/simulation")}
          >
            Enter Simulation
            <ArrowRight size={14} />
          </button>
        </div>
      </motion.nav>

      <section className="hero-section">
        <div className="hero-content">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } },
            }}
          >
            <div style={{ overflow: "hidden" }}>
              <motion.h1 variants={titleVariants} className="hero-title">
                CPU SCHEDULING <span className="text-subtle"></span>
              </motion.h1>
            </div>
            <div style={{ overflow: "hidden", marginTop: "1rem" }}>
              <motion.h1 variants={titleVariants} className="hero-title">
                VISUALIZER.
              </motion.h1>
            </div>
          </motion.div>

          <div className="hero-spacer"></div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 1 }}
          >
            <MagneticButton
              className="launch-btn hover-target"
              onClick={() => navigate("/simulation")}
            >
              <span>Initialize Simulation</span>
              <Cpu size={18} />
            </MagneticButton>
          </motion.div>

          <motion.div
            className="scroll-indicator"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{
                repeat: Infinity,
                duration: 1.8,
                ease: "easeInOut",
              }}
            >
              <ChevronDown size={28} strokeWidth={1} />
            </motion.div>
            <span>Scroll to explore</span>
          </motion.div>
        </div>
      </section>

      <section className="stats-section">
        <motion.div
          className="stats-row"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="stat-item">
            <Cpu size={20} strokeWidth={1.5} />
            <span className="stat-value">7</span>
            <span className="stat-label">Algorithms</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <BarChart3 size={20} strokeWidth={1.5} />
            <span className="stat-value">Real-time</span>
            <span className="stat-label">Gantt Charts</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <GitCompare size={20} strokeWidth={1.5} />
            <span className="stat-value">Side-by-side</span>
            <span className="stat-label">Comparison</span>
          </div>
        </motion.div>
      </section>

      <section className="explanations-section">
        <div className="section-header">
          <motion.h2
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            The Mechanics of Execution
          </motion.h2>
        </div>

        <div className="accordion-list">
          {algorithms.map((algo) => {
            const isExpanded = expandedId === algo.id;

            return (
              <div
                key={algo.id}
                className={`accordion-item hover-target ${
                  isExpanded ? "expanded" : ""
                }`}
                onMouseEnter={() => setExpandedId(algo.id)}
                onMouseLeave={() => setExpandedId(null)}
              >
                <button
                  className="accordion-header hover-target"
                  onClick={() => toggleAccordion(algo.id)}
                >
                  <div className="accordion-title-group">
                    <span className="algo-short">{algo.short}</span>
                    <span className="algo-icon">{algo.icon}</span>
                    <h3>{algo.name}</h3>
                  </div>
                  <motion.div
                    className="accordion-icon"
                    animate={{ rotate: isExpanded ? 90 : 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {isExpanded ? (
                      <Minus size={32} strokeWidth={1} />
                    ) : (
                      <Plus size={32} strokeWidth={1} />
                    )}
                  </motion.div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      style={{ overflow: "hidden" }}
                    >
                      <div className="accordion-content">
                        <p>{algo.description}</p>
                        <div className="accordion-content-footer">
                          <span className="best-for">
                            Architecture: {algo.bestFor}
                          </span>
                          <button
                            className="simulate-link hover-target"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/simulation?algo=${algo.algoKey}`);
                            }}
                          >
                            Simulate
                            <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      <section className="cta-section">
        <motion.h2
          className="cta-title"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          Seize control of <br /> the CPU cycles.
        </motion.h2>
        <motion.p
          className="cta-subtitle"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          Simulate, compare, and master 7 scheduling algorithms in real time.
        </motion.p>
        <MagneticButton
          className="launch-btn hover-target"
          onClick={() => navigate("/simulation")}
        >
          <span>Enter Sandbox</span>
          <ArrowRightLeft size={18} />
        </MagneticButton>

        <div className="cta-links">
          <a
            href="https://github.com/Deepanshu-Mehta/CPU_Scheduling_Visualizer"
            target="_blank"
            rel="noopener noreferrer"
            className="cta-link hover-target"
          >
            <Github size={16} />
            <span>View on GitHub</span>
          </a>
        </div>
      </section>
    </motion.div>
  );
}

import React, { useState, useEffect } from "react";
import { Cpu } from "lucide-react";
import {
  SimulationProvider,
  useSimulation,
} from "./context/SimulationContext.jsx";
import { ProcessInputTable } from "./components/ProcessInputTable.jsx";
import { AlgorithmSelector } from "./components/AlgorithmSelector.jsx";
import { ALGORITHMS } from "./algorithms/index.js";
import { SimulationControls } from "./components/SimulationControls.jsx";
import { MetricsPane } from "./components/MetricsPane.jsx";
import { ProcessStateTable } from "./components/ProcessStateTable.jsx";
import { ComparisonDashboard } from "./components/ComparisonDashboard.jsx";
import { QueueVisualization } from "./components/QueueVisualization.jsx";
import { MLFQVisualization } from "./components/MLFQVisualization.jsx";
import { GanttChartContainer } from "./visualization/GanttChart.jsx";
import { TutorialOverlay } from "./components/TutorialOverlay.jsx";
import { exportToJSON, exportToPDF } from "./utils/exportUtils.js";
import { SimulationState } from "./simulation/SimulationController.js";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Dashboard } from "./pages/Dashboard.jsx";
import "./App.css";

function AppContent() {
  const { state, setActiveTab, setComparisonMode, setAlgorithm } =
    useSimulation();
  const [showTutorial, setShowTutorial] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Pre-select algorithm from query parameter (e.g. /simulation?algo=SJF)
  useEffect(() => {
    const algoParam = searchParams.get("algo");
    if (algoParam && ALGORITHMS[algoParam]) {
      setAlgorithm(algoParam);
    }
  }, [searchParams, setAlgorithm]);

  const handleStartTutorial = () => {
    localStorage.removeItem("cpu-scheduler-tutorial-completed");
    setShowTutorial(true);
  };

  const handleExportJSON = () => {
    if (state.fullGanttChart.length > 0) {
      const exportData = {
        algorithm: state.selectedAlgorithm,
        algorithmName: state.algorithmName,
        processes: state.processStates,
        ganttChart: state.fullGanttChart,
        metrics: state.metrics,
      };
      exportToJSON(exportData);
    }
  };

  const handleExportPDF = () => {
    if (state.fullGanttChart.length > 0) {
      const exportData = {
        algorithm: state.selectedAlgorithm,
        algorithmName: state.algorithmName,
        processes: state.processStates,
        ganttChart: state.fullGanttChart,
        metrics: state.metrics,
      };
      exportToPDF(exportData);
    }
  };

  const tabs = [
    { id: "simulation", label: "Simulation" },
    { id: "comparison", label: "Comparison" },
  ];

  return (
    <div className="app">
      {showTutorial && (
        <TutorialOverlay onComplete={() => setShowTutorial(false)} />
      )}
      {!showTutorial && <TutorialOverlay onComplete={() => {}} />}
      <header className="app-header">
        <div className="header-content">
          <div
            className="logo"
            onClick={() => navigate("/")}
            style={{ cursor: "pointer" }}
          >
            <span className="logo-icon"><Cpu size={20} strokeWidth={1.5} /></span>
            <h1>CPU Scheduling Visualizer</h1>
          </div>
          <nav className="header-nav">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`nav-btn ${
                  state.activeTab === tab.id ? "active" : ""
                }`}
                onClick={() => {
                  setActiveTab(tab.id);
                  setComparisonMode(tab.id === "comparison");
                }}
              >
                {tab.label}
              </button>
            ))}
          </nav>
          <div className="header-actions">
            {state.simulationState === SimulationState.COMPLETED &&
              state.activeTab === "simulation" && (
                <>
                  <button className="export-btn" onClick={handleExportJSON}>
                    📄 Export JSON
                  </button>
                  <button className="export-btn" onClick={handleExportPDF}>
                    📑 Export PDF
                  </button>
                </>
              )}
            <button
              className="help-btn"
              onClick={handleStartTutorial}
              title="Start Tutorial"
            >
              ?
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        {state.activeTab === "simulation" ? (
          <div className="simulation-layout">
            <aside className="sidebar">
              <ProcessInputTable />
              <AlgorithmSelector />
              <SimulationControls />
            </aside>

            <section className="content">
              <GanttChartContainer />
              <QueueVisualization />
              <MLFQVisualization />
              <div className="content-grid">
                <ProcessStateTable />
                <MetricsPane />
              </div>
            </section>
          </div>
        ) : (
          <div className="comparison-layout">
            <aside className="sidebar">
              <ProcessInputTable />
            </aside>
            <section className="content">
              <ComparisonDashboard />
            </section>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>
          CPU Scheduling Visualizer — Featuring FCFS, SJF, SRTF, Priority, Round
          Robin, HRRN, and MLFQ algorithms
        </p>
      </footer>
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/simulation" element={<AppContent />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <SimulationProvider>
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </SimulationProvider>
  );
}

export default App;

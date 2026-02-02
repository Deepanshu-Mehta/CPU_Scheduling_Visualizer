// Main Application Component
// CPU Scheduling Visualizer

import React from 'react';
import { SimulationProvider, useSimulation } from './context/SimulationContext.jsx';
import { ProcessInputTable } from './components/ProcessInputTable.jsx';
import { AlgorithmSelector } from './components/AlgorithmSelector.jsx';
import { SimulationControls } from './components/SimulationControls.jsx';
import { MetricsPane } from './components/MetricsPane.jsx';
import { ProcessStateTable } from './components/ProcessStateTable.jsx';
import { ComparisonDashboard } from './components/ComparisonDashboard.jsx';
import { QueueVisualization } from './components/QueueVisualization.jsx';
import { MLFQVisualization } from './components/MLFQVisualization.jsx';
import { GanttChartContainer } from './visualization/GanttChart.jsx';
import { exportToJSON, exportToPDF } from './utils/exportUtils.js';
import { SimulationState } from './simulation/SimulationController.js';
import './App.css';

function AppContent() {
  const { state, setActiveTab, setComparisonMode } = useSimulation();

  const handleExportJSON = () => {
    if (state.fullGanttChart.length > 0) {
      const exportData = {
        algorithm: state.selectedAlgorithm,
        algorithmName: state.algorithmName,
        processes: state.processStates,
        ganttChart: state.fullGanttChart,
        metrics: state.metrics
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
        metrics: state.metrics
      };
      exportToPDF(exportData);
    }
  };

  const tabs = [
    { id: 'simulation', label: 'Simulation' },
    { id: 'comparison', label: 'Comparison' },
  ];

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">⚙️</span>
            <h1>CPU Scheduling Visualizer</h1>
          </div>
          <nav className="header-nav">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`nav-btn ${state.activeTab === tab.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(tab.id);
                  setComparisonMode(tab.id === 'comparison');
                }}
              >
                {tab.label}
              </button>
            ))}
          </nav>
          <div className="header-actions">
            {state.simulationState === SimulationState.COMPLETED && state.activeTab === 'simulation' && (
              <>
                <button className="export-btn" onClick={handleExportJSON}>
                  📄 Export JSON
                </button>
                <button className="export-btn" onClick={handleExportPDF}>
                  📑 Export PDF
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        {state.activeTab === 'simulation' ? (
          <div className="simulation-layout">
            {/* Left Sidebar - Configuration */}
            <aside className="sidebar">
              <ProcessInputTable />
              <AlgorithmSelector />
              <SimulationControls />
            </aside>

            {/* Main Content - Visualization */}
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

      {/* Footer */}
      <footer className="app-footer">
        <p>
          CPU Scheduling Visualizer — Featuring FCFS, SJF, SRTF, Priority, Round Robin, HRRN, and MLFQ algorithms
        </p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <SimulationProvider>
      <AppContent />
    </SimulationProvider>
  );
}

export default App;

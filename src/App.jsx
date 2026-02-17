// Main Application Component
// CPU Scheduling Visualizer

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { TutorialOverlay } from './components/TutorialOverlay.jsx';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import { StateTransitionDiagram } from './components/StateTransitionDiagram.jsx';
import { PerProcessTable } from './components/PerProcessTable.jsx';
import { exportToJSON, exportToPDF, importFromJSON } from './utils/exportUtils.js';
import { SimulationState } from './simulation/SimulationController.js';
import { validateProcessInputs } from './utils/schedulerUtils.js';
import { PRESETS } from './utils/presets.js';
import { ALGORITHM_DESCRIPTIONS } from './utils/algorithmDescriptions.js';
import './App.css';

const THEME_KEY = 'cpu-scheduler-theme';

function AppContent() {
  const { state, setActiveTab, setComparisonMode, dispatch,
          startSimulation, pauseSimulation, resumeSimulation,
          stepSimulation, resetSimulation } = useSimulation();
  const [showTutorial, setShowTutorial] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(THEME_KEY) || 'dark';
  });
  const [validationErrors, setValidationErrors] = useState([]);
  const [showPresets, setShowPresets] = useState(false);
  const [showAlgoInfo, setShowAlgoInfo] = useState(false);
  const fileInputRef = useRef(null);
  const presetsRef = useRef(null);
  const algoInfoRef = useRef(null);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (presetsRef.current && !presetsRef.current.contains(e.target)) {
        setShowPresets(false);
      }
      if (algoInfoRef.current && !algoInfoRef.current.contains(e.target)) {
        setShowAlgoInfo(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;

      // Space = Play/Pause
      if (e.code === 'Space' && state.activeTab === 'simulation') {
        e.preventDefault();
        if (state.simulationState === SimulationState.IDLE) {
          const result = validateProcessInputs(state.processInputs);
          if (!result.valid) {
            setValidationErrors(result.errors);
            return;
          }
          setValidationErrors([]);
          startSimulation();
        } else if (state.simulationState === SimulationState.RUNNING) {
          pauseSimulation();
        } else if (state.simulationState === SimulationState.PAUSED) {
          resumeSimulation();
        }
      }

      // S = Step
      if (e.key === 's' && !e.ctrlKey && !e.metaKey && state.activeTab === 'simulation') {
        if (state.simulationState === SimulationState.PAUSED ||
            state.simulationState === SimulationState.IDLE) {
          stepSimulation();
        }
      }

      // R = Reset
      if (e.key === 'r' && !e.ctrlKey && !e.metaKey && state.activeTab === 'simulation') {
        resetSimulation();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.simulationState, state.activeTab, state.processInputs,
      startSimulation, pauseSimulation, resumeSimulation, stepSimulation, resetSimulation]);

  const handleStartTutorial = () => {
    localStorage.removeItem('cpu-scheduler-tutorial-completed');
    setShowTutorial(true);
  };

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

  // Import JSON handler
  const handleImportJSON = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = importFromJSON(event.target.result);
        if (result && result.processes) {
          const importedProcesses = result.processes.map((p, idx) => ({
            id: idx + 1,
            pid: p.pid || idx + 1,
            arrivalTime: p.arrivalTime || 0,
            cpuBurst: p.totalCpuBurstTime || p.cpuBurst || 1,
            priority: p.priority || 0,
            ioEnabled: false,
            ioBursts: [],
          }));
          dispatch({ type: 'LOAD_PROCESSES', payload: importedProcesses });
        }
      } catch {
        setValidationErrors(['Failed to parse JSON file. Please check the format.']);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Load preset
  const handleLoadPreset = (preset) => {
    dispatch({ type: 'LOAD_PROCESSES', payload: preset.processes });
    dispatch({ type: 'SELECT_ALGORITHM', payload: preset.algorithm });
    setShowPresets(false);
    setValidationErrors([]);
  };

  // Dismiss validation errors
  const dismissErrors = () => setValidationErrors([]);

  const tabs = [
    { id: 'simulation', label: 'Simulation' },
    { id: 'comparison', label: 'Comparison' },
  ];

  const algoInfo = ALGORITHM_DESCRIPTIONS[state.selectedAlgorithm];

  return (
    <div className="app">
      {/* Tutorial Overlay - Single instance */}
      <TutorialOverlay onComplete={() => setShowTutorial(false)} show={showTutorial} />

      {/* Validation Errors Toast */}
      {validationErrors.length > 0 && (
        <div className="validation-toast" role="alert">
          <div className="toast-header">
            <span>⚠️ Validation Errors</span>
            <button onClick={dismissErrors} aria-label="Dismiss errors" className="toast-close">✕</button>
          </div>
          <ul>
            {validationErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Hidden file input for JSON import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        style={{ display: 'none' }}
        aria-label="Import JSON file"
      />

      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon" aria-hidden="true">⚙️</span>
            <h1>CPU Scheduling Visualizer</h1>
          </div>
          <nav className="header-nav" aria-label="Main navigation">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`nav-btn ${state.activeTab === tab.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(tab.id);
                  setComparisonMode(tab.id === 'comparison');
                }}
                aria-label={`Switch to ${tab.label} tab`}
                aria-current={state.activeTab === tab.id ? 'page' : undefined}
              >
                {tab.label}
              </button>
            ))}
          </nav>
          <div className="header-actions">
            {/* Presets dropdown */}
            <div className="dropdown" ref={presetsRef}>
              <button
                className="action-btn"
                onClick={() => setShowPresets(!showPresets)}
                aria-label="Load preset scenario"
                title="Load Preset"
              >
                📋 Presets
              </button>
              {showPresets && (
                <div className="dropdown-menu presets-dropdown">
                  <div className="dropdown-header">Load Example Scenario</div>
                  {PRESETS.map(preset => (
                    <button
                      key={preset.id}
                      className="dropdown-item"
                      onClick={() => handleLoadPreset(preset)}
                    >
                      <span className="preset-name">{preset.name}</span>
                      <span className="preset-desc">{preset.description}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Import/Export */}
            <button className="action-btn" onClick={handleImportJSON} aria-label="Import from JSON" title="Import JSON">
              📥 Import
            </button>
            {state.simulationState === SimulationState.COMPLETED && state.activeTab === 'simulation' && (
              <>
                <button className="export-btn" onClick={handleExportJSON} aria-label="Export results as JSON">
                  📄 JSON
                </button>
                <button className="export-btn" onClick={handleExportPDF} aria-label="Export results as PDF">
                  📑 PDF
                </button>
              </>
            )}

            {/* Theme toggle */}
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {/* Help */}
            <button
              className="help-btn"
              onClick={handleStartTutorial}
              title="Start Tutorial"
              aria-label="Start interactive tutorial"
            >
              ?
            </button>
          </div>
        </div>

        {/* Keyboard shortcuts hint */}
        <div className="keyboard-hint">
          <kbd>Space</kbd> Play/Pause &nbsp; <kbd>S</kbd> Step &nbsp; <kbd>R</kbd> Reset
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main" role="main">
        {state.activeTab === 'simulation' ? (
          <div className="simulation-layout">
            {/* Left Sidebar - Configuration */}
            <aside className="sidebar" role="complementary" aria-label="Simulation configuration">
              <ProcessInputTable />
              <AlgorithmSelector />

              {/* Algorithm info panel */}
              {algoInfo && (
                <div className="algo-info-panel" ref={algoInfoRef}>
                  <button
                    className="algo-info-toggle"
                    onClick={() => setShowAlgoInfo(!showAlgoInfo)}
                    aria-expanded={showAlgoInfo}
                    aria-label="Toggle algorithm description"
                  >
                    <span>ℹ️ About {state.algorithmName || state.selectedAlgorithm}</span>
                    <span className={`chevron ${showAlgoInfo ? 'open' : ''}`}>▼</span>
                  </button>
                  {showAlgoInfo && (
                    <div className="algo-info-content">
                      <p>{algoInfo.description}</p>
                      <div className="algo-meta">
                        <span className="algo-tag best">✓ {algoInfo.bestFor}</span>
                        <span className="algo-tag weak">✗ {algoInfo.weakness}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <SimulationControls />
            </aside>

            {/* Main Content - Visualization */}
            <section className="content" aria-label="Simulation visualization">
              <GanttChartContainer />
              <QueueVisualization />
              <MLFQVisualization />
              <StateTransitionDiagram />
              <div className="content-grid">
                <ProcessStateTable />
                <MetricsPane />
              </div>
              <PerProcessTable />
            </section>
          </div>
        ) : (
          <div className="comparison-layout">
            <aside className="sidebar" role="complementary" aria-label="Process configuration">
              <ProcessInputTable />
            </aside>
            <section className="content" aria-label="Algorithm comparison">
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
    <ErrorBoundary>
      <SimulationProvider>
        <AppContent />
      </SimulationProvider>
    </ErrorBoundary>
  );
}

export default App;

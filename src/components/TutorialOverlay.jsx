// Tutorial Overlay Component
// Interactive walkthrough for first-time users

import React, { useState, useEffect, useCallback } from 'react';
import './TutorialOverlay.css';

const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    target: null,
    title: '👋 Welcome to CPU Scheduling Visualizer!',
    content: 'This interactive tool helps you understand how different CPU scheduling algorithms work. Let\'s take a quick tour!',
    position: 'center'
  },
  {
    id: 'process-table',
    target: '.process-input-table',
    title: '📋 Add Your Processes',
    content: 'Start by adding processes here. You can set arrival time, burst time, priority, and even I/O bursts for each process.',
    position: 'right'
  },
  {
    id: 'algorithm-selector',
    target: '.algorithm-selector',
    title: '🎯 Choose an Algorithm',
    content: 'Select from 7 scheduling algorithms: FCFS, SJF, SRTF, Priority (Preemptive/Non-preemptive), Round Robin, HRRN, and MLFQ.',
    position: 'right'
  },
  {
    id: 'simulation-controls',
    target: '.simulation-controls',
    title: '▶️ Control the Simulation',
    content: 'Use these controls to Start, Pause, Step through, or Reset the simulation. Adjust the speed to watch in slow-motion or fast-forward!',
    position: 'right'
  },
  {
    id: 'gantt-chart',
    target: '.gantt-chart',
    title: '📊 Gantt Chart Timeline',
    content: 'Watch the execution timeline update in real-time. Each colored block represents a process running on the CPU. Use zoom controls to scale the view!',
    position: 'top'
  },
  {
    id: 'process-states',
    target: '.process-state-table',
    title: '🔄 Process States',
    content: 'Track each process\'s current state (Ready, Running, Blocked, Completed) and see metrics like turnaround time and waiting time.',
    position: 'left'
  },
  {
    id: 'metrics',
    target: '.metrics-pane',
    title: '📈 Performance Metrics',
    content: 'Analyze the algorithm\'s performance with metrics like Average Turnaround Time, Waiting Time, Response Time, and CPU Utilization.',
    position: 'left'
  },
  {
    id: 'comparison',
    target: '.nav-btn:nth-child(2)',
    title: '⚖️ Compare Algorithms',
    content: 'Switch to the Comparison tab to run all algorithms simultaneously and see side-by-side performance charts!',
    position: 'bottom'
  },
  {
    id: 'complete',
    target: null,
    title: '🎉 You\'re All Set!',
    content: 'You now know the basics! Start experimenting with different processes and algorithms. Click the "?" button anytime to see this tour again.',
    position: 'center'
  }
];

const STORAGE_KEY = 'cpu-scheduler-tutorial-completed';

export function TutorialOverlay({ onComplete }) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [spotlightStyle, setSpotlightStyle] = useState({});
  const [tooltipStyle, setTooltipStyle] = useState({});

  // Check if tutorial should show
  useEffect(() => {
    const hasCompleted = localStorage.getItem(STORAGE_KEY);
    if (!hasCompleted) {
      // Delay to let DOM render
      setTimeout(() => setIsVisible(true), 500);
    }
  }, []);

  // Update spotlight position when step changes
  useEffect(() => {
    if (!isVisible) return;

    const step = TUTORIAL_STEPS[currentStep];
    
    if (!step.target) {
      // Center modal for welcome/complete steps
      setSpotlightStyle({ display: 'none' });
      setTooltipStyle({
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      });
      return;
    }

    const element = document.querySelector(step.target);
    if (!element) {
      // Element not found, skip to next or show centered
      setSpotlightStyle({ display: 'none' });
      setTooltipStyle({
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      });
      return;
    }

    const rect = element.getBoundingClientRect();
    const padding = 8;

    // Set spotlight position
    setSpotlightStyle({
      display: 'block',
      top: rect.top - padding,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2
    });

    // Calculate tooltip position
    const tooltipOffset = 16;
    let tooltipPos = {};

    switch (step.position) {
      case 'right':
        tooltipPos = {
          top: rect.top,
          left: rect.right + tooltipOffset
        };
        break;
      case 'left':
        tooltipPos = {
          top: rect.top,
          right: window.innerWidth - rect.left + tooltipOffset
        };
        break;
      case 'top':
        tooltipPos = {
          bottom: window.innerHeight - rect.top + tooltipOffset,
          left: rect.left
        };
        break;
      case 'bottom':
        tooltipPos = {
          top: rect.bottom + tooltipOffset,
          left: rect.left
        };
        break;
      default:
        tooltipPos = {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        };
    }

    setTooltipStyle({
      position: 'fixed',
      ...tooltipPos
    });
  }, [currentStep, isVisible]);

  const handleComplete = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsVisible(false);
    onComplete?.();
  }, [onComplete]);

  const handleNext = useCallback(() => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  }, [currentStep, handleComplete]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleSkip = useCallback(() => {
    handleComplete();
  }, [handleComplete]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isVisible) return;
      
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'Escape') {
        handleSkip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, handleNext, handlePrev, handleSkip]);

  if (!isVisible) return null;

  const step = TUTORIAL_STEPS[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === TUTORIAL_STEPS.length - 1;

  return (
    <div className="tutorial-overlay">
      {/* Dark backdrop */}
      <div className="tutorial-backdrop" onClick={handleSkip} />
      
      {/* Spotlight cutout */}
      <div className="tutorial-spotlight" style={spotlightStyle} />
      
      {/* Tooltip */}
      <div className="tutorial-tooltip" style={tooltipStyle}>
        <div className="tooltip-header">
          <h3>{step.title}</h3>
          <button className="tooltip-close" onClick={handleSkip} aria-label="Close tutorial">
            ✕
          </button>
        </div>
        
        <p className="tooltip-content">{step.content}</p>
        
        {/* Progress dots */}
        <div className="tutorial-progress">
          {TUTORIAL_STEPS.map((_, index) => (
            <span
              key={index}
              className={`progress-dot ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
            />
          ))}
        </div>
        
        {/* Navigation buttons */}
        <div className="tooltip-actions">
          <button 
            className="tooltip-btn secondary" 
            onClick={handleSkip}
          >
            Skip Tour
          </button>
          
          <div className="tooltip-nav">
            {!isFirst && (
              <button className="tooltip-btn" onClick={handlePrev}>
                ← Back
              </button>
            )}
            <button className="tooltip-btn primary" onClick={handleNext}>
              {isLast ? 'Get Started!' : 'Next →'}
            </button>
          </div>
        </div>
        
        <p className="tooltip-hint">
          Use arrow keys to navigate • Esc to skip
        </p>
      </div>
    </div>
  );
}

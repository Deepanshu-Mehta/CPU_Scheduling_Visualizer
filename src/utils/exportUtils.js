// Export utilities for JSON and PDF

/**
 * Export simulation results to JSON file
 */
export function exportToJSON(data, filename = 'simulation-results.json') {
  const exportData = {
    timestamp: new Date().toISOString(),
    algorithm: data.algorithmName || data.algorithm,
    processes: data.processes,
    ganttChart: data.ganttChart,
    metrics: data.metrics,
    stateTransitions: data.stateTransitions
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  downloadFile(blob, filename);
}

/**
 * Export comparison results to JSON
 */
export function exportComparisonToJSON(data, filename = 'comparison-results.json') {
  const exportData = {
    timestamp: new Date().toISOString(),
    comparison: Object.entries(data).map(([key, result]) => ({
      algorithm: key,
      algorithmName: result.algorithmName,
      metrics: result.metrics,
      ganttChart: result.ganttChart
    }))
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  downloadFile(blob, filename);
}

/**
 * Generate and export PDF report
 */
export async function exportToPDF(data, _filename = 'simulation-report.pdf') {
  // Create a simple HTML report and use print functionality
  const htmlContent = generateHTMLReport(data);
  
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }
}

/**
 * Generate HTML report content
 */
function generateHTMLReport(data) {
  const metrics = data.metrics || {};
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>CPU Scheduling Simulation Report</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
          color: #1e293b;
        }
        h1 { color: #6366f1; border-bottom: 2px solid #6366f1; padding-bottom: 10px; }
        h2 { color: #334155; margin-top: 30px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
        th { background: #f1f5f9; font-weight: 600; }
        .metric { display: inline-block; margin: 10px 20px 10px 0; }
        .metric-value { font-size: 24px; font-weight: 700; color: #6366f1; }
        .metric-label { font-size: 14px; color: #64748b; }
        .gantt-bar { display: inline-block; height: 30px; margin: 2px 0; }
        .timestamp { color: #94a3b8; font-size: 12px; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <h1>CPU Scheduling Simulation Report</h1>
      <p class="timestamp">Generated: ${new Date().toLocaleString()}</p>
      
      <h2>Algorithm: ${data.algorithmName || data.algorithm}</h2>
      
      <h2>Performance Metrics</h2>
      <div>
        <div class="metric">
          <div class="metric-value">${(metrics.avgTurnaroundTime || 0).toFixed(2)}</div>
          <div class="metric-label">Avg Turnaround Time</div>
        </div>
        <div class="metric">
          <div class="metric-value">${(metrics.avgWaitingTime || 0).toFixed(2)}</div>
          <div class="metric-label">Avg Waiting Time</div>
        </div>
        <div class="metric">
          <div class="metric-value">${(metrics.avgResponseTime || 0).toFixed(2)}</div>
          <div class="metric-label">Avg Response Time</div>
        </div>
        <div class="metric">
          <div class="metric-value">${(metrics.cpuUtilization || 0).toFixed(1)}%</div>
          <div class="metric-label">CPU Utilization</div>
        </div>
      </div>
      
      <h2>Process Details</h2>
      <table>
        <thead>
          <tr>
            <th>PID</th>
            <th>Arrival</th>
            <th>CPU Burst</th>
            <th>Completion</th>
            <th>Turnaround</th>
            <th>Waiting</th>
          </tr>
        </thead>
        <tbody>
          ${(data.processes || []).map(p => `
            <tr>
              <td>P${p.pid}</td>
              <td>${p.arrivalTime}</td>
              <td>${p.totalCpuBurstTime}</td>
              <td>${p.completionTime}</td>
              <td>${p.turnaroundTime}</td>
              <td>${p.calculatedWaitTime}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <h2>Gantt Chart Timeline</h2>
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Duration</th>
            <th>Process/Event</th>
          </tr>
        </thead>
        <tbody>
          ${(data.ganttChart || []).map(g => `
            <tr>
              <td>${g.startTime} - ${g.endTime}</td>
              <td>${g.duration}</td>
              <td>${g.type === 'PROCESS' ? `P${g.pid}` : g.type}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;
}

/**
 * Helper function to download a file
 */
function downloadFile(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Import processes from JSON file
 */
export function importFromJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.processes) {
          resolve(data.processes);
        } else {
          reject(new Error('Invalid file format: missing processes array'));
        }
      } catch (_err) {
        reject(new Error('Failed to parse JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

export default {
  exportToJSON,
  exportComparisonToJSON,
  exportToPDF,
  importFromJSON
};

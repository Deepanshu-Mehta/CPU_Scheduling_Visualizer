// Shared color constants for process visualization

export const PROCESS_COLORS = [
  "#6366f1", // Indigo
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#f59e0b", // Amber
  "#10b981", // Emerald
  "#06b6d4", // Cyan
  "#3b82f6", // Blue
  "#f97316", // Orange
  "#84cc16", // Lime
  "#ef4444", // Red
];

export const CONTEXT_SWITCH_COLOR = "#334155";
export const IDLE_COLOR = "#1e293b";

export const QUEUE_COLORS = ["#10b981", "#f59e0b", "#ef4444"];
export const QUEUE_NAMES = ["Q0", "Q1", "Q2"];

/**
 * Get color for a process by index
 */
export function getProcessColor(index) {
  return PROCESS_COLORS[index % PROCESS_COLORS.length];
}

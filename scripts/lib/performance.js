#!/usr/bin/env node

/**
 * Performance Metrics Module - Detailed Execution Analysis
 *
 * Provides comprehensive performance tracking with breakdown of all execution phases.
 * Tracks git operations, turbo execution, and package selection metrics.
 */

/**
 * Performance metrics collector class
 */
export class PerformanceMetrics {
  constructor() {
    this.startTime = Date.now();
    this.metrics = {
      totalDuration: 0,
      gitDiffTime: 0,
      packageAnalysisTime: 0,
      turboExecutionTime: 0,
      phases: [],
      packageMetrics: {
        totalPackages: 0,
        selectedPackages: 0,
        skippedPackages: 0,
        efficiencyRatio: 0,
      },
    };
    this.currentPhase = null;
  }

  /**
   * Start tracking a new phase
   * @param {string} phaseName - Name of the phase being tracked
   */
  startPhase(phaseName) {
    if (this.currentPhase) {
      this.endPhase();
    }

    this.currentPhase = {
      name: phaseName,
      startTime: Date.now(),
      endTime: null,
      duration: 0,
    };
  }

  /**
   * End the current phase
   */
  endPhase() {
    if (!this.currentPhase) return;

    this.currentPhase.endTime = Date.now();
    this.currentPhase.duration =
      this.currentPhase.endTime - this.currentPhase.startTime;
    this.metrics.phases.push({ ...this.currentPhase });
    this.currentPhase = null;
  }

  /**
   * Record git operation timing
   * @param {number} duration - Duration in milliseconds
   */
  recordGitTime(duration) {
    this.metrics.gitDiffTime = duration;
  }

  /**
   * Record package analysis timing
   * @param {number} duration - Duration in milliseconds
   */
  recordPackageAnalysisTime(duration) {
    this.metrics.packageAnalysisTime = duration;
  }

  /**
   * Record turbo execution timing
   * @param {number} duration - Duration in milliseconds
   */
  recordTurboTime(duration) {
    this.metrics.turboExecutionTime = duration;
  }

  /**
   * Record package selection metrics
   * @param {Object} packageData - Package selection data
   */
  recordPackageMetrics(packageData) {
    const { totalPackages = 0, selectedPackages = 0 } = packageData;

    this.metrics.packageMetrics = {
      totalPackages,
      selectedPackages,
      skippedPackages: totalPackages - selectedPackages,
      efficiencyRatio: totalPackages > 0 ? selectedPackages / totalPackages : 0,
    };
  }

  /**
   * Finalize metrics collection
   */
  finalize() {
    if (this.currentPhase) {
      this.endPhase();
    }

    this.metrics.totalDuration = Date.now() - this.startTime;
    return this.metrics;
  }

  /**
   * Get current metrics snapshot
   * @returns {Object} - Current metrics
   */
  getSnapshot() {
    const currentTime = Date.now();
    return {
      ...this.metrics,
      totalDuration: currentTime - this.startTime,
    };
  }
}

/**
 * Format duration for human-readable display
 * @param {number} ms - Duration in milliseconds
 * @returns {string} - Formatted duration
 */
function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

/**
 * Calculate efficiency metrics
 * @param {Object} metrics - Performance metrics
 * @returns {Object} - Efficiency analysis
 */
function calculateEfficiency(metrics) {
  const { packageMetrics, totalDuration, turboExecutionTime } = metrics;
  const overhead = totalDuration - turboExecutionTime;

  return {
    packageEfficiency: packageMetrics.efficiencyRatio,
    timeEfficiency:
      turboExecutionTime > 0 ? turboExecutionTime / totalDuration : 0,
    overheadRatio: totalDuration > 0 ? overhead / totalDuration : 0,
    estimatedSavings:
      packageMetrics.skippedPackages > 0
        ? `~${Math.round(packageMetrics.efficiencyRatio * 100)}% faster than full execution`
        : 'No packages skipped',
  };
}

/**
 * Generate comprehensive performance report
 * @param {Object} metrics - Performance metrics
 * @param {Object} config - Configuration for reporting options
 * @returns {string} - Formatted performance report
 */
export function generatePerformanceReport(metrics, config = {}) {
  const {
    includeGitTiming = true,
    includeTurboTiming = true,
    includePackageMetrics = true,
    includePhaseBreakdown = false,
    includeEfficiency = true,
  } = config;

  const efficiency = calculateEfficiency(metrics);
  const lines = [];

  lines.push('📊 Smart Turbo Execution Summary');
  lines.push(`   Total Duration: ${formatDuration(metrics.totalDuration)}`);

  if (includeGitTiming && metrics.gitDiffTime > 0) {
    lines.push(`   Git Analysis: ${formatDuration(metrics.gitDiffTime)}`);
  }

  if (includeTurboTiming && metrics.turboExecutionTime > 0) {
    lines.push(
      `   Turbo Execution: ${formatDuration(metrics.turboExecutionTime)}`
    );
  }

  if (includePackageMetrics && metrics.packageMetrics.totalPackages > 0) {
    const { packageMetrics } = metrics;
    lines.push(
      `   Packages: ${packageMetrics.selectedPackages}/${packageMetrics.totalPackages} selected`
    );

    if (packageMetrics.skippedPackages > 0) {
      lines.push(
        `   Efficiency: ${(packageMetrics.efficiencyRatio * 100).toFixed(1)}% selective execution`
      );
    }
  }

  if (
    includeEfficiency &&
    efficiency.estimatedSavings !== 'No packages skipped'
  ) {
    lines.push(`   Performance: ${efficiency.estimatedSavings}`);
  }

  if (includePhaseBreakdown && metrics.phases.length > 0) {
    lines.push('   Phase Breakdown:');
    metrics.phases.forEach(phase => {
      lines.push(`     ${phase.name}: ${formatDuration(phase.duration)}`);
    });
  }

  return lines.join('\n');
}

/**
 * Log execution information with enhanced metrics
 * @param {string} task - Task name
 * @param {Object} result - Execution result
 * @param {Object} metrics - Performance metrics
 * @param {Object} config - Logging configuration
 */
export function logExecutionSummary(task, result, metrics, config = {}) {
  console.log('');

  // Basic execution info
  console.log('📊 Smart Turbo Execution Summary');
  console.log(`   Task: ${task}`);
  console.log(`   Scope: ${result.scope}`);

  if (result.packages && Array.isArray(result.packages)) {
    console.log(`   Packages: ${result.packages.join(', ')}`);
  }

  // Performance metrics
  if (config.logPerformance) {
    const report = generatePerformanceReport(
      metrics,
      config.performanceLogging || {}
    );
    // Skip the header since we already printed it
    const reportLines = report.split('\n').slice(1);
    reportLines.forEach(line => console.log(line));
  }

  console.log('');
}

/**
 * Export performance data for analysis
 * @param {Object} metrics - Performance metrics
 * @param {Object} metadata - Additional metadata
 * @returns {Object} - Exportable performance data
 */
export function exportPerformanceData(metrics, metadata = {}) {
  return {
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    metadata,
    metrics: {
      ...metrics,
      efficiency: calculateEfficiency(metrics),
    },
  };
}

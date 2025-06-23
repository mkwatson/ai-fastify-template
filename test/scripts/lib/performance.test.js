import { describe, it, expect, beforeEach } from 'vitest';
import {
  PerformanceMetrics,
  generatePerformanceReport,
  exportPerformanceData,
} from '../../../scripts/lib/performance.js';

describe('performance.js', () => {
  let metrics;

  beforeEach(() => {
    metrics = new PerformanceMetrics();
  });

  describe('PerformanceMetrics', () => {
    it('should initialize with default values', () => {
      expect(metrics.startTime).toBeDefined();
      expect(metrics.metrics.totalDuration).toBe(0);
      expect(metrics.metrics.phases).toEqual([]);
      expect(metrics.currentPhase).toBeNull();
    });

    it('should track phases correctly', () => {
      metrics.startPhase('test-phase');
      expect(metrics.currentPhase).toBeDefined();
      expect(metrics.currentPhase.name).toBe('test-phase');
      expect(metrics.currentPhase.startTime).toBeDefined();

      // Simulate some work
      const delay = 10;
      const start = Date.now();
      while (Date.now() - start < delay) {
        // Wait
      }

      metrics.endPhase();
      expect(metrics.currentPhase).toBeNull();
      expect(metrics.metrics.phases).toHaveLength(1);
      expect(metrics.metrics.phases[0].name).toBe('test-phase');
      expect(metrics.metrics.phases[0].duration).toBeGreaterThan(0);
    });

    it('should handle overlapping phases', () => {
      metrics.startPhase('phase1');
      metrics.startPhase('phase2'); // Should end phase1 and start phase2
      metrics.endPhase();

      expect(metrics.metrics.phases).toHaveLength(2);
      expect(metrics.metrics.phases[0].name).toBe('phase1');
      expect(metrics.metrics.phases[1].name).toBe('phase2');
    });

    it('should record timing metrics', () => {
      metrics.recordGitTime(100);
      metrics.recordPackageAnalysisTime(50);
      metrics.recordTurboTime(200);

      expect(metrics.metrics.gitDiffTime).toBe(100);
      expect(metrics.metrics.packageAnalysisTime).toBe(50);
      expect(metrics.metrics.turboExecutionTime).toBe(200);
    });

    it('should record package metrics', () => {
      const packageData = {
        totalPackages: 10,
        selectedPackages: 3,
      };

      metrics.recordPackageMetrics(packageData);

      expect(metrics.metrics.packageMetrics.totalPackages).toBe(10);
      expect(metrics.metrics.packageMetrics.selectedPackages).toBe(3);
      expect(metrics.metrics.packageMetrics.skippedPackages).toBe(7);
      expect(metrics.metrics.packageMetrics.efficiencyRatio).toBe(0.3);
    });

    it('should finalize metrics correctly', () => {
      metrics.startPhase('final-phase');

      // Simulate some work
      const delay = 10;
      const start = Date.now();
      while (Date.now() - start < delay) {
        // Wait
      }

      const finalMetrics = metrics.finalize();

      expect(finalMetrics.totalDuration).toBeGreaterThan(0);
      expect(finalMetrics.phases).toHaveLength(1);
      expect(finalMetrics.phases[0].name).toBe('final-phase');
      expect(metrics.currentPhase).toBeNull();
    });

    it('should provide snapshots', () => {
      metrics.recordGitTime(50);
      const snapshot = metrics.getSnapshot();

      expect(snapshot.gitDiffTime).toBe(50);
      expect(snapshot.totalDuration).toBeGreaterThan(0);
    });
  });

  describe('generatePerformanceReport', () => {
    it('should generate basic performance report', () => {
      const testMetrics = {
        totalDuration: 1000,
        gitDiffTime: 100,
        turboExecutionTime: 800,
        packageMetrics: {
          totalPackages: 5,
          selectedPackages: 2,
          skippedPackages: 3,
          efficiencyRatio: 0.4,
        },
        phases: [],
      };

      const report = generatePerformanceReport(testMetrics);

      expect(report).toContain('Smart Turbo Execution Summary');
      expect(report).toContain('Total Duration: 1.0s');
      expect(report).toContain('Git Analysis: 100ms');
      expect(report).toContain('Turbo Execution: 800ms');
      expect(report).toContain('Packages: 2/5 selected');
      expect(report).toContain('40.0% selective execution');
    });

    it('should handle different time formats', () => {
      const testCases = [
        { duration: 500, expected: '500ms' },
        { duration: 1500, expected: '1.5s' },
        { duration: 65000, expected: '1.1m' },
      ];

      testCases.forEach(({ duration, expected }) => {
        const testMetrics = {
          totalDuration: duration,
          gitDiffTime: 0,
          turboExecutionTime: 0,
          packageMetrics: {
            totalPackages: 0,
            selectedPackages: 0,
            skippedPackages: 0,
            efficiencyRatio: 0,
          },
          phases: [],
        };

        const report = generatePerformanceReport(testMetrics);
        expect(report).toContain(expected);
      });
    });

    it('should include phase breakdown when requested', () => {
      const testMetrics = {
        totalDuration: 1000,
        gitDiffTime: 0,
        turboExecutionTime: 0,
        packageMetrics: {
          totalPackages: 0,
          selectedPackages: 0,
          skippedPackages: 0,
          efficiencyRatio: 0,
        },
        phases: [
          { name: 'git-analysis', duration: 100 },
          { name: 'package-selection', duration: 50 },
          { name: 'turbo-execution', duration: 850 },
        ],
      };

      const report = generatePerformanceReport(testMetrics, {
        includePhaseBreakdown: true,
      });

      expect(report).toContain('Phase Breakdown:');
      expect(report).toContain('git-analysis: 100ms');
      expect(report).toContain('package-selection: 50ms');
      expect(report).toContain('turbo-execution: 850ms');
    });

    it('should handle zero values gracefully', () => {
      const testMetrics = {
        totalDuration: 0,
        gitDiffTime: 0,
        turboExecutionTime: 0,
        packageMetrics: {
          totalPackages: 0,
          selectedPackages: 0,
          skippedPackages: 0,
          efficiencyRatio: 0,
        },
        phases: [],
      };

      const report = generatePerformanceReport(testMetrics);
      expect(report).toContain('Total Duration: 0ms');
    });
  });

  describe('exportPerformanceData', () => {
    it('should export complete performance data', () => {
      const testMetrics = {
        totalDuration: 1000,
        gitDiffTime: 100,
        turboExecutionTime: 800,
        packageMetrics: {
          totalPackages: 5,
          selectedPackages: 2,
          skippedPackages: 3,
          efficiencyRatio: 0.4,
        },
        phases: [],
      };

      const metadata = { task: 'lint', base: 'main' };
      const exported = exportPerformanceData(testMetrics, metadata);

      expect(exported.timestamp).toBeDefined();
      expect(exported.version).toBe('1.0.0');
      expect(exported.metadata).toEqual(metadata);
      expect(exported.metrics.totalDuration).toBe(1000);
      expect(exported.metrics.efficiency).toBeDefined();
      expect(exported.metrics.efficiency.packageEfficiency).toBe(0.4);
    });

    it('should calculate efficiency metrics correctly', () => {
      const testMetrics = {
        totalDuration: 1000,
        turboExecutionTime: 800,
        packageMetrics: {
          totalPackages: 10,
          selectedPackages: 3,
          skippedPackages: 7,
          efficiencyRatio: 0.3,
        },
      };

      const exported = exportPerformanceData(testMetrics);
      const efficiency = exported.metrics.efficiency;

      expect(efficiency.packageEfficiency).toBe(0.3);
      expect(efficiency.timeEfficiency).toBe(0.8); // 800/1000
      expect(efficiency.overheadRatio).toBe(0.2); // (1000-800)/1000
      expect(efficiency.estimatedSavings).toContain('30%');
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete workflow metrics', () => {
      // Simulate a complete smart-turbo execution
      metrics.startPhase('initialization');
      metrics.endPhase();

      metrics.startPhase('git-analysis');
      metrics.recordGitTime(150);
      metrics.endPhase();

      metrics.startPhase('package-selection');
      metrics.recordPackageMetrics({
        totalPackages: 8,
        selectedPackages: 2,
      });
      metrics.endPhase();

      metrics.startPhase('turbo-execution');
      metrics.recordTurboTime(600);
      metrics.endPhase();

      const finalMetrics = metrics.finalize();

      expect(finalMetrics.phases).toHaveLength(4);
      expect(finalMetrics.gitDiffTime).toBe(150);
      expect(finalMetrics.turboExecutionTime).toBe(600);
      expect(finalMetrics.packageMetrics.efficiencyRatio).toBe(0.25);
      expect(finalMetrics.totalDuration).toBeGreaterThan(0);

      const report = generatePerformanceReport(finalMetrics, {
        includePhaseBreakdown: true,
        includeEfficiency: true,
      });

      expect(report).toContain('initialization:');
      expect(report).toContain('git-analysis:');
      expect(report).toContain('package-selection:');
      expect(report).toContain('turbo-execution:');
      expect(report).toContain('25.0% selective execution');
    });
  });
});

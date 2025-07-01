# Claude Code Metrics Collection Plan

## Overview

This document outlines the metrics collection strategy for Claude Code hooks to improve AI-assisted development patterns over time.

## Metrics Architecture

### Collection Method

Metrics are collected as newline-delimited JSON (`.jsonl`) files stored alongside session transcripts:

```bash
$SESSION_TRANSCRIPT_PATH.metrics.jsonl
```

### Event Schema

```typescript
interface MetricEvent {
  event: 'validation' | 'format' | 'block' | 'error';
  tool: string;           // Tool that triggered the event
  timestamp: number;      // Unix timestamp
  duration?: number;      // Operation duration in ms
  file?: string;          // File being operated on
  result?: 'success' | 'failure' | 'timeout';
  details?: Record<string, any>;
}
```

## Metrics Categories

### 1. Validation Metrics

Track validation performance and common issues:

```json
{
  "event": "validation",
  "tool": "Edit",
  "timestamp": 1703001234,
  "duration": 1250,
  "file": "src/auth/auth.service.ts",
  "result": "failure",
  "details": {
    "errors": 3,
    "warnings": 1,
    "type": "typescript"
  }
}
```

### 2. Security Blocks

Monitor attempted violations:

```json
{
  "event": "block",
  "tool": "Write",
  "timestamp": 1703001234,
  "file": ".env",
  "details": {
    "reason": "env_protection",
    "pattern": "direct_env_access"
  }
}
```

### 3. Performance Metrics

Track hook execution times:

```json
{
  "event": "validation",
  "tool": "MultiEdit",
  "timestamp": 1703001234,
  "duration": 8500,
  "result": "timeout",
  "details": {
    "timeout_limit": 10000
  }
}
```

## Privacy & Security

### Data Collection Principles

1. **No Source Code**: Never log actual code content
2. **No Secrets**: Sanitize file paths and error messages
3. **Opt-in Only**: Metrics collection disabled by default
4. **Local Storage**: Metrics stay on developer machines

### Sanitization Rules

```javascript
function sanitizePath(path) {
  // Remove user-specific paths
  return path
    .replace(/\/Users\/[^/]+/, '/Users/***')
    .replace(/\/home\/[^/]+/, '/home/***')
    .replace(/[a-zA-Z]:\\Users\\[^\\]+/, 'C:\\Users\\***');
}

function sanitizeError(error) {
  // Remove potential secrets from error messages
  return error
    .replace(/[A-Za-z0-9+/]{40,}/, '[REDACTED]')
    .replace(/\b[A-F0-9]{64}\b/gi, '[HASH]')
    .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP]');
}
```

## Analysis & Insights

### Key Performance Indicators (KPIs)

1. **Validation Success Rate**
   ```sql
   SELECT 
     COUNT(CASE WHEN result = 'success' THEN 1 END) * 100.0 / COUNT(*) as success_rate
   FROM metrics 
   WHERE event = 'validation'
   ```

2. **Most Common Errors**
   ```sql
   SELECT 
     details->>'type' as error_type,
     COUNT(*) as frequency
   FROM metrics 
   WHERE event = 'validation' AND result = 'failure'
   GROUP BY error_type
   ORDER BY frequency DESC
   ```

3. **Performance Degradation**
   ```sql
   SELECT 
     AVG(duration) as avg_duration,
     DATE(timestamp, 'unixepoch') as date
   FROM metrics 
   WHERE event = 'validation'
   GROUP BY date
   ```

### Learning Patterns

1. **File Edit Patterns**: Which files are edited most frequently?
2. **Error Clusters**: Do certain files consistently fail validation?
3. **Time-of-Day Analysis**: When are developers most productive?
4. **Tool Usage**: Which Claude Code tools are used most?

## Implementation Phases

### Phase 1: Basic Collection (Current PR)
- Add metrics.jsonl to .gitignore ✅
- Document collection schema ✅
- Privacy-first design ✅

### Phase 2: Collection Hooks (Next PR)
- Add metrics collection to validation hooks
- Implement sanitization functions
- Create opt-in mechanism

### Phase 3: Analysis Tools (Future)
- Build analysis scripts
- Create dashboards
- Generate insights reports

### Phase 4: AI Improvements (Long-term)
- Feed insights back into prompts
- Improve hook patterns
- Reduce false positives

## Opt-in Mechanism

Metrics collection will be controlled via settings:

```json
{
  "features": {
    "metrics": false  // Disabled by default
  },
  "privacy": {
    "sanitize_paths": true,
    "sanitize_errors": true,
    "local_only": true
  }
}
```

## Data Retention

- Metrics files are gitignored
- Automatic cleanup after 30 days
- No cloud upload without explicit consent
- Can be deleted anytime via: `rm *.metrics.jsonl`

## Future Enhancements

1. **Aggregated Reports**: Weekly summaries of development patterns
2. **Team Insights**: Anonymized team-level metrics (opt-in)
3. **AI Coaching**: Personalized suggestions based on patterns
4. **Integration with Linear**: Link metrics to issue tracking

## Conclusion

This metrics plan balances valuable insights with developer privacy. By understanding how AI assistants interact with code, we can continuously improve the development experience while maintaining trust and transparency.
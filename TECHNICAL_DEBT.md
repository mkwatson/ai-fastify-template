# Technical Debt Log

This document tracks technical debt items that have been intentionally deferred for pragmatic reasons.

## Mutation Testing Exclusions

### env.ts Plugin Error Handling (Lines 84-106)

**Date**: December 2024
**Related Ticket**: MAR-17
**Decision**: Excluded complex error handling code from mutation testing

**Rationale**:
- The error handling code in env.ts involves complex Zod error formatting and logging
- Testing all error path mutations would require mocking internal Zod behavior
- This is framework-level initialization code, not business logic
- Time investment to achieve full coverage (4-6 hours) outweighs the risk mitigation benefit

**Excluded Code**:
```typescript
// Lines 84-106 in src/plugins/env.ts
} catch (error) {
  if (error instanceof z.ZodError) {
    const formattedErrors = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
      received: 'received' in err ? err.received : undefined,
    }));
    fastify.log.error(
      {
        validationErrors: formattedErrors,
      },
      'Environment validation failed'
    );
    throw new Error(
      `Environment validation failed: ${formattedErrors.map(e => `${e.field}: ${e.message}`).join(', ')}`
    );
  }
  fastify.log.error({ error }, 'Invalid environment configuration');
  throw error;
}
```

**Impact**:
- Mutation score reduced by approximately 10-15%
- Error messages might have minor formatting issues if refactored incorrectly
- Logging format changes would not be caught by tests

**Mitigation**:
- Happy path and basic validation are fully tested
- Integration tests verify the plugin works correctly
- Manual testing during development catches formatting issues

**Future Resolution**:
- Consider extracting error formatting logic to a separate, testable function
- Add integration tests that verify error message format
- Revisit when implementing structured error responses across the application

---

## How to Address Technical Debt

When addressing items in this log:

1. Create a new Linear ticket referencing the debt item
2. Include the original context and rationale
3. Update this document when the debt is resolved
4. Consider the cost/benefit of resolution vs. other priorities

## Review Schedule

This document should be reviewed:
- During sprint planning sessions
- When modifying related code
- Quarterly for priority reassessment
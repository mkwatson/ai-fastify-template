# Test Architecture

This document serves as the single source of truth for our testing strategy in the AI Fastify Template project.

## 🎯 Purpose

Our testing strategy is specifically designed to prevent common AI agent pitfalls:
- Tests that achieve high coverage but don't validate business logic
- Happy path bias that misses edge cases
- Framework testing instead of business workflow validation
- Brittle tests that break with minor refactoring

## 📊 Test Categories

### Unit Tests (70% of tests)
**Location**: `test/utils/`, `test/services/`
- Pure business logic, no I/O operations
- Test a single unit of functionality
- All dependencies mocked
- Fast execution (<1ms per test)

### Integration Tests (20% of tests)
**Location**: `test/routes/`, `test/plugins/`
- API contracts and workflows
- Real database connections (test database)
- External services mocked
- Medium execution time (<100ms per test)

### E2E Tests (10% of tests)
**Location**: `test/e2e/`
- Full user journeys
- Complete system including external services
- Production-like environment
- Slower execution (>100ms per test)

### Property-Based Tests
**Location**: Throughout, marked with `.property.test.ts`
- Edge case generation
- Invariant validation
- Comprehensive input coverage

### Mutation Tests
**Tool**: Stryker Mutator
- Validates test effectiveness
- 90% mutation score requirement
- Catches superficial tests

## 🚫 AI Agent Anti-Patterns

### ❌ Bad Test (Coverage-focused)
```typescript
it('should work', () => {
  const result = calculateTax(100);
  expect(result).toBeDefined();
  expect(typeof result).toBe('number');
});
```

### ✅ Good Test (Logic-focused)
```typescript
it('should calculate 10% tax on standard items', () => {
  const result = calculateTax(100, 'standard');
  expect(result).toBe(10);
});

it('should calculate 0% tax on exempt items', () => {
  const result = calculateTax(100, 'exempt');
  expect(result).toBe(0);
});

it('should throw error for negative amounts', () => {
  expect(() => calculateTax(-100, 'standard')).toThrow('Amount must be positive');
});
```

## 📏 Test Structure

### Arrange-Act-Assert Pattern
```typescript
describe('UserService', () => {
  it('should create user with hashed password', async () => {
    // Arrange
    const userData = { email: 'test@example.com', password: 'password123' };
    const mockHashedPassword = 'hashed_password_123';
    jest.spyOn(bcrypt, 'hash').mockResolvedValue(mockHashedPassword);
    
    // Act
    const user = await userService.createUser(userData);
    
    // Assert
    expect(user.password).toBe(mockHashedPassword);
    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
  });
});
```

### Given-When-Then Pattern (BDD)
```typescript
describe('Order Processing', () => {
  it('should apply discount when order exceeds threshold', () => {
    // Given
    const order = new OrderBuilder()
      .withItems([{ price: 100, quantity: 2 }])
      .build();
    
    // When
    const processedOrder = processOrder(order);
    
    // Then
    expect(processedOrder.discount).toBe(10);
    expect(processedOrder.total).toBe(180); // 200 - 10% discount
  });
});
```

## 🧪 Test Quality Metrics

### Coverage Requirements
- Line Coverage: ≥80%
- Branch Coverage: ≥75%
- Function Coverage: ≥80%
- Statement Coverage: ≥80%

### Mutation Score Requirements
- Overall: ≥90%
- Core Business Logic: ≥95%
- Utilities: ≥85%

### Performance Benchmarks
- Unit Test Suite: <5 seconds
- Integration Test Suite: <30 seconds
- Full Test Suite: <2 minutes

## 🛠️ Testing Tools

### Core Framework
- **Vitest**: Fast, ESM-native test runner
- **@vitest/coverage-v8**: Coverage reporting

### Assertion & Mocking
- **Vitest built-in**: Assertions and spies
- **msw**: API mocking for integration tests

### Quality Tools
- **Stryker**: Mutation testing
- **fast-check**: Property-based testing
- **Pact**: Contract testing

### Utilities
- **Test Data Builders**: Reduce test brittleness
- **Custom Matchers**: Domain-specific assertions

## 📝 Test Naming Conventions

### Unit Tests
```typescript
// Format: should [action] when [condition]
it('should calculate total when items array is provided')
it('should return zero when items array is empty')
it('should throw error when items contain negative price')
```

### Integration Tests
```typescript
// Format: [HTTP Method] [endpoint] should [behavior]
it('POST /users should create user with valid data')
it('GET /users/:id should return 404 when user not found')
```

## 🚀 Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run with coverage
pnpm test:coverage

# Run mutation tests
pnpm test:mutation

# Run specific test file
pnpm test user.test.ts

# Run tests matching pattern
pnpm test -- --grep "should calculate"
```

## 📚 Additional Resources

- [Test Patterns Library](./docs/TEST_PATTERNS.md)
- [Testing Cookbook](./docs/TESTING_COOKBOOK.md)
- [AI Testing Guidelines](../../../AGENTS_TEST.md)
- [Troubleshooting Guide](./docs/TEST_TROUBLESHOOTING.md)

## 🎯 Remember

**The goal is not coverage, it's confidence.** A test that doesn't fail when the logic is broken is worse than no test at all.
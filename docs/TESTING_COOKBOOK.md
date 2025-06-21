# Testing Cookbook

> Practical recipes for common testing scenarios in the AI Fastify Template

## Table of Contents

1. [Testing Async Operations](#testing-async-operations)
2. [Testing SSE Streams](#testing-sse-streams)
3. [Testing with Time](#testing-with-time)
4. [Testing File Operations](#testing-file-operations)
5. [Testing External APIs](#testing-external-apis)
6. [Testing Database Operations](#testing-database-operations)
7. [Testing Error Scenarios](#testing-error-scenarios)
8. [Testing Authentication](#testing-authentication)
9. [Testing Rate Limiting](#testing-rate-limiting)
10. [Testing WebSockets](#testing-websockets)

## Testing Async Operations

### Recipe: Testing Promises

```typescript
describe('Async Operations', () => {
  // Method 1: Using async/await
  it('should resolve with data', async () => {
    const result = await fetchUserData('123');
    expect(result).toMatchObject({ id: '123', name: 'John' });
  });

  // Method 2: Using expect().resolves
  it('should resolve with data (alternative)', () => {
    return expect(fetchUserData('123')).resolves.toMatchObject({
      id: '123',
      name: 'John',
    });
  });

  // Method 3: Testing rejections
  it('should reject on error', async () => {
    await expect(fetchUserData('invalid')).rejects.toThrow('User not found');
  });
});
```

### Recipe: Testing Concurrent Operations

```typescript
describe('Concurrent Operations', () => {
  it('should handle multiple requests in parallel', async () => {
    const userIds = ['1', '2', '3', '4', '5'];

    // Start all requests at once
    const promises = userIds.map(id => fetchUser(id));

    // Wait for all to complete
    const users = await Promise.all(promises);

    expect(users).toHaveLength(5);
    expect(users.every(user => user !== null)).toBe(true);
  });

  it('should handle race conditions', async () => {
    const operation1 = updateCounter('counter-1');
    const operation2 = updateCounter('counter-1');

    // Both operations try to update the same counter
    const [result1, result2] = await Promise.all([operation1, operation2]);

    // One should succeed, one should fail with conflict
    const success = [result1, result2].filter(r => r.success).length;
    expect(success).toBe(1);
  });
});
```

## Testing SSE Streams

### Recipe: Basic SSE Testing

```typescript
describe('SSE Endpoints', () => {
  it('should stream events', async () => {
    const events: any[] = [];

    const response = await app.inject({
      method: 'GET',
      url: '/stream/notifications',
      headers: { Accept: 'text/event-stream' },
      simulate: {
        split: true, // Split response into individual events
        close: true, // Simulate client disconnect after response
      },
    });

    // Parse SSE events
    const lines = response.payload.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('data: ')) {
        events.push(JSON.parse(lines[i].slice(6)));
      }
    }

    expect(events).toHaveLength(3);
    expect(events[0]).toMatchObject({ type: 'start' });
    expect(events[2]).toMatchObject({ type: 'end' });
  });
});
```

### Recipe: Testing SSE with Timeouts

```typescript
describe('SSE with Timing', () => {
  it('should handle client disconnect gracefully', async () => {
    vi.useFakeTimers();

    let connectionClosed = false;

    const responsePromise = app.inject({
      method: 'GET',
      url: '/stream/live-data',
      simulate: {
        close: true,
        onClose: () => {
          connectionClosed = true;
        },
      },
    });

    // Advance time to trigger some events
    vi.advanceTimersByTime(5000);

    // Simulate client disconnect
    responsePromise.connection?.destroy();

    await vi.runAllTimersAsync();

    expect(connectionClosed).toBe(true);
    vi.useRealTimers();
  });
});
```

## Testing with Time

### Recipe: Using Fake Timers

```typescript
import { vi } from 'vitest';

describe('Time-based Operations', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should expire cache after TTL', () => {
    const cache = new TTLCache({ ttl: 60000 }); // 1 minute

    cache.set('key', 'value');
    expect(cache.get('key')).toBe('value');

    // Advance time by 30 seconds
    vi.advanceTimersByTime(30000);
    expect(cache.get('key')).toBe('value'); // Still valid

    // Advance time by another 31 seconds
    vi.advanceTimersByTime(31000);
    expect(cache.get('key')).toBeUndefined(); // Expired
  });

  it('should retry with exponential backoff', async () => {
    let attempts = 0;
    const operation = vi.fn().mockImplementation(() => {
      attempts++;
      if (attempts < 3) throw new Error('Failed');
      return 'success';
    });

    const promise = retryWithBackoff(operation, { maxAttempts: 3 });

    // First attempt - immediate
    expect(attempts).toBe(1);

    // Second attempt - after 1 second
    await vi.advanceTimersByTimeAsync(1000);
    expect(attempts).toBe(2);

    // Third attempt - after 2 seconds
    await vi.advanceTimersByTimeAsync(2000);
    expect(attempts).toBe(3);

    const result = await promise;
    expect(result).toBe('success');
  });
});
```

### Recipe: Testing Scheduled Jobs

```typescript
describe('Scheduled Jobs', () => {
  it('should run cleanup job at midnight', () => {
    const mockDate = new Date('2024-01-01T23:59:58.000Z');
    vi.setSystemTime(mockDate);

    const cleanupSpy = vi.spyOn(jobRunner, 'runCleanup');

    startScheduler();

    // Advance to midnight
    vi.advanceTimersByTime(2000);

    expect(cleanupSpy).toHaveBeenCalledTimes(1);
    expect(cleanupSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        scheduledAt: new Date('2024-01-02T00:00:00.000Z'),
      })
    );
  });
});
```

## Testing File Operations

### Recipe: Testing File Uploads

```typescript
import { createReadStream } from 'fs';
import FormData from 'form-data';

describe('File Upload', () => {
  it('should accept valid image upload', async () => {
    const form = new FormData();
    form.append('image', createReadStream('./test/fixtures/test-image.jpg'), {
      filename: 'test-image.jpg',
      contentType: 'image/jpeg',
    });
    form.append('title', 'Test Image');

    const response = await app.inject({
      method: 'POST',
      url: '/upload/image',
      headers: form.getHeaders(),
      payload: form,
    });

    expect(response.statusCode).toBe(201);
    const result = JSON.parse(response.payload);
    expect(result).toMatchObject({
      id: expect.any(String),
      filename: 'test-image.jpg',
      size: expect.any(Number),
      url: expect.stringMatching(/^\/uploads\//),
    });
  });

  it('should reject files over size limit', async () => {
    const largeBuffer = Buffer.alloc(10 * 1024 * 1024); // 10MB
    const form = new FormData();
    form.append('file', largeBuffer, {
      filename: 'large-file.bin',
      contentType: 'application/octet-stream',
    });

    const response = await app.inject({
      method: 'POST',
      url: '/upload/file',
      headers: form.getHeaders(),
      payload: form,
    });

    expect(response.statusCode).toBe(413);
    expect(JSON.parse(response.payload)).toMatchObject({
      error: 'File too large',
      maxSize: '5MB',
    });
  });
});
```

### Recipe: Testing File System Operations

```typescript
import { vol } from 'memfs';
import { fs } from 'memfs/lib/promises';

// Mock fs module
vi.mock('fs/promises', () => fs);

describe('File System Operations', () => {
  beforeEach(() => {
    // Reset in-memory file system
    vol.reset();
  });

  it('should save processed data to file', async () => {
    // Setup initial files
    vol.fromJSON({
      '/data/input.json': JSON.stringify({ value: 42 }),
    });

    await processAndSaveData('/data/input.json', '/data/output.json');

    // Verify output file
    const output = await fs.readFile('/data/output.json', 'utf-8');
    const data = JSON.parse(output);

    expect(data).toMatchObject({
      original: 42,
      processed: 84,
      timestamp: expect.any(String),
    });
  });
});
```

## Testing External APIs

### Recipe: Mocking HTTP Requests

```typescript
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('https://api.example.com/users/:id', (req, res, ctx) => {
    const { id } = req.params;
    return res(
      ctx.json({
        id,
        name: 'John Doe',
        email: 'john@example.com',
      })
    );
  })
);

describe('External API Integration', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should fetch user from external API', async () => {
    const user = await userService.fetchExternalUser('123');

    expect(user).toMatchObject({
      id: '123',
      name: 'John Doe',
      email: 'john@example.com',
    });
  });

  it('should handle API errors gracefully', async () => {
    server.use(
      rest.get('https://api.example.com/users/:id', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Server error' }));
      })
    );

    await expect(userService.fetchExternalUser('123')).rejects.toThrow(
      'Failed to fetch user'
    );
  });
});
```

### Recipe: Testing API Rate Limiting

```typescript
describe('API Rate Limiting', () => {
  it('should respect rate limits', async () => {
    const requests = Array(10)
      .fill(null)
      .map((_, i) => makeApiRequest(`/resource/${i}`));

    const startTime = Date.now();
    const results = await Promise.allSettled(requests);
    const duration = Date.now() - startTime;

    // With rate limiting of 5 req/sec, 10 requests should take ~2 seconds
    expect(duration).toBeGreaterThan(1900);
    expect(duration).toBeLessThan(2100);

    // All requests should succeed
    const successful = results.filter(r => r.status === 'fulfilled');
    expect(successful).toHaveLength(10);
  });
});
```

## Testing Database Operations

### Recipe: Testing Transactions

```typescript
describe('Database Transactions', () => {
  it('should rollback on error', async () => {
    const orderId = crypto.randomUUID();

    try {
      await db.transaction(async trx => {
        // Create order
        await trx('orders').insert({
          id: orderId,
          userId: 'user-123',
          total: 100,
        });

        // Deduct inventory (this will fail)
        await trx('inventory').decrement('quantity', 10).where({
          productId: 'non-existent',
        });
      });
    } catch (error) {
      // Transaction rolled back
    }

    // Verify order was not created
    const order = await db('orders').where({ id: orderId }).first();
    expect(order).toBeUndefined();
  });
});
```

### Recipe: Testing Database Migrations

```typescript
describe('Database Migrations', () => {
  it('should migrate schema correctly', async () => {
    // Start with empty database
    await db.migrate.rollback();

    // Run migrations up to specific version
    await db.migrate.up();

    // Verify schema
    const tables = await db.raw(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    expect(tables.rows.map(r => r.table_name)).toContain('users');
    expect(tables.rows.map(r => r.table_name)).toContain('orders');

    // Verify indexes
    const indexes = await db.raw(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'users'
    `);

    expect(indexes.rows.map(r => r.indexname)).toContain('users_email_unique');
  });
});
```

## Testing Error Scenarios

### Recipe: Testing Error Boundaries

```typescript
describe('Error Handling', () => {
  it('should handle and log unexpected errors', async () => {
    const logSpy = vi.spyOn(logger, 'error');

    // Force an error
    vi.spyOn(database, 'query').mockRejectedValueOnce(
      new Error('Connection lost')
    );

    const response = await app.inject({
      method: 'GET',
      url: '/users',
    });

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.payload)).toMatchObject({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
      requestId: expect.any(String),
    });

    // Verify error was logged
    expect(logSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          message: 'Connection lost',
        }),
        requestId: expect.any(String),
      }),
      'Unhandled error in request'
    );
  });
});
```

### Recipe: Testing Circuit Breakers

```typescript
describe('Circuit Breaker', () => {
  it('should open circuit after failures', async () => {
    const service = new ServiceWithCircuitBreaker({
      failureThreshold: 3,
      resetTimeout: 1000,
    });

    // Simulate failures
    for (let i = 0; i < 3; i++) {
      vi.spyOn(httpClient, 'get').mockRejectedValueOnce(new Error('Timeout'));
      await expect(service.fetchData()).rejects.toThrow();
    }

    // Circuit should now be open
    await expect(service.fetchData()).rejects.toThrow(
      'Circuit breaker is OPEN'
    );

    // Should not make actual HTTP call
    expect(httpClient.get).toHaveBeenCalledTimes(3);
  });
});
```

## Testing Authentication

### Recipe: Testing JWT Authentication

```typescript
describe('JWT Authentication', () => {
  let validToken: string;
  let expiredToken: string;

  beforeAll(() => {
    validToken = generateToken({ userId: '123', role: 'user' });
    expiredToken = generateToken(
      { userId: '456' },
      { expiresIn: '-1h' } // Already expired
    );
  });

  it('should allow access with valid token', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/profile',
      headers: { Authorization: `Bearer ${validToken}` },
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.payload)).toMatchObject({
      userId: '123',
      role: 'user',
    });
  });

  it('should reject expired token', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/profile',
      headers: { Authorization: `Bearer ${expiredToken}` },
    });

    expect(response.statusCode).toBe(401);
    expect(JSON.parse(response.payload)).toMatchObject({
      error: 'Token expired',
    });
  });
});
```

### Recipe: Testing OAuth Flow

```typescript
describe('OAuth Flow', () => {
  it('should complete OAuth authorization', async () => {
    // Step 1: Initiate OAuth
    const initResponse = await app.inject({
      method: 'GET',
      url: '/auth/github',
    });

    expect(initResponse.statusCode).toBe(302);
    const redirectUrl = new URL(initResponse.headers.location);
    expect(redirectUrl.hostname).toBe('github.com');

    const state = redirectUrl.searchParams.get('state');
    expect(state).toBeTruthy();

    // Step 2: Simulate callback from GitHub
    const callbackResponse = await app.inject({
      method: 'GET',
      url: `/auth/github/callback?code=test-code&state=${state}`,
    });

    expect(callbackResponse.statusCode).toBe(302);
    expect(callbackResponse.headers.location).toBe('/dashboard');

    // Verify session cookie
    const cookies = callbackResponse.cookies;
    expect(cookies).toContainEqual(
      expect.objectContaining({
        name: 'session',
        httpOnly: true,
        secure: true,
      })
    );
  });
});
```

## Testing Rate Limiting

### Recipe: Testing Rate Limit Enforcement

```typescript
describe('Rate Limiting', () => {
  it('should enforce rate limits per user', async () => {
    const token = generateToken({ userId: 'rate-test-user' });
    const requests = [];

    // Make 10 rapid requests
    for (let i = 0; i < 10; i++) {
      requests.push(
        app.inject({
          method: 'GET',
          url: '/api/data',
          headers: { Authorization: `Bearer ${token}` },
        })
      );
    }

    const responses = await Promise.all(requests);

    // First 5 should succeed (assuming 5 req/min limit)
    const successful = responses.filter(r => r.statusCode === 200);
    expect(successful).toHaveLength(5);

    // Rest should be rate limited
    const rateLimited = responses.filter(r => r.statusCode === 429);
    expect(rateLimited).toHaveLength(5);

    // Check rate limit headers
    const limitedResponse = rateLimited[0];
    expect(limitedResponse.headers).toMatchObject({
      'x-ratelimit-limit': '5',
      'x-ratelimit-remaining': '0',
      'x-ratelimit-reset': expect.any(String),
    });
  });
});
```

## Testing WebSockets

### Recipe: Testing WebSocket Connections

```typescript
import WebSocket from 'ws';

describe('WebSocket Communication', () => {
  let ws: WebSocket;
  let messages: any[] = [];

  beforeEach(done => {
    ws = new WebSocket('ws://localhost:3000/ws');

    ws.on('open', done);
    ws.on('message', data => {
      messages.push(JSON.parse(data.toString()));
    });
  });

  afterEach(() => {
    ws.close();
    messages = [];
  });

  it('should receive real-time updates', done => {
    // Subscribe to updates
    ws.send(
      JSON.stringify({
        type: 'subscribe',
        channel: 'orders',
      })
    );

    // Trigger an update through API
    app
      .inject({
        method: 'POST',
        url: '/orders',
        payload: { item: 'Widget', quantity: 5 },
      })
      .then(() => {
        // Wait for WebSocket message
        setTimeout(() => {
          expect(messages).toContainEqual(
            expect.objectContaining({
              type: 'order_created',
              data: expect.objectContaining({
                item: 'Widget',
                quantity: 5,
              }),
            })
          );
          done();
        }, 100);
      });
  });
});
```

## Summary

These recipes provide practical patterns for testing complex scenarios. Key takeaways:

1. **Use appropriate tools** - Fake timers for time, MSW for HTTP, etc.
2. **Test the full flow** - Don't just test happy paths
3. **Isolate external dependencies** - Mock them appropriately
4. **Verify side effects** - Check logs, database state, etc.
5. **Handle async properly** - Use proper async/await patterns

Remember: Good tests give you confidence to refactor and deploy.

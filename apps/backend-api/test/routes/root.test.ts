import { afterAll, describe, expect, it } from 'vitest';

import { build } from '../helper.js';

describe('Root route', () => {
  it('should return Hello World message', async () => {
    const app = await build({ after: afterAll });

    const res = await app.inject({
      url: '/',
    });

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.payload)).toEqual({ message: 'Hello World!' });
  });
});

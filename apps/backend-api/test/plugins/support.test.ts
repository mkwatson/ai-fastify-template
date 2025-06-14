import { describe, it, expect } from 'vitest'
import Fastify from 'fastify'
import Support from '../../src/plugins/support.js'

describe('Support plugin', () => {
  it('should work standalone', async () => {
    const fastify = Fastify()
    void fastify.register(Support)
    await fastify.ready()

    expect(fastify.someSupport()).toBe('hugs')
  })
})

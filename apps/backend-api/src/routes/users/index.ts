import { type FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

// In-memory storage for demonstration (use database in production)
const users: Array<{ id: string; name: string; email: string }> = [];
let nextId = 1;

// Zod schemas for validation
const CreateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email format'),
});

interface UserResponse {
  id: string;
  name: string;
  email: string;
}

interface UsersResponse {
  users: UserResponse[];
}

const users_routes: FastifyPluginAsync = async (fastify): Promise<void> => {
  // GET /users - List all users
  fastify.get(
    '/',
    {
      schema: {
        response: {
          200: {
            type: 'object',
            properties: {
              users: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    email: { type: 'string' },
                  },
                  required: ['id', 'name', 'email'],
                },
              },
            },
            required: ['users'],
          },
        },
      },
    },
    (request, reply) => {
      const response: UsersResponse = { users };
      return reply.code(200).send(response);
    }
  );

  // POST /users - Create a new user
  fastify.post(
    '/',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 1, maxLength: 100 },
            email: { type: 'string', format: 'email' },
          },
          required: ['name', 'email'],
        },
        response: {
          201: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              email: { type: 'string' },
            },
            required: ['id', 'name', 'email'],
          },
          400: {
            type: 'object',
            properties: {
              statusCode: { type: 'number' },
              error: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    (request, reply) => {
      try {
        const userData = CreateUserSchema.parse(request.body);

        // Check for duplicate email
        const existingUser = users.find(user => user.email === userData.email);
        if (existingUser) {
          return reply.code(400).send({
            statusCode: 400,
            error: 'Bad Request',
            message: 'Email already exists',
          });
        }

        const newUser: UserResponse = {
          id: nextId.toString(),
          name: userData.name,
          email: userData.email,
        };

        users.push(newUser);
        nextId++;

        return reply.code(201).send(newUser);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.code(400).send({
            statusCode: 400,
            error: 'Bad Request',
            message: error.errors.map(e => e.message).join(', '),
          });
        }
        throw error;
      }
    }
  );

  // GET /users/:id - Get a specific user
  fastify.get(
    '/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              email: { type: 'string' },
            },
            required: ['id', 'name', 'email'],
          },
          404: {
            type: 'object',
            properties: {
              statusCode: { type: 'number' },
              error: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    (request, reply) => {
      const { id } = request.params as { id: string };

      const user = users.find(u => u.id === id);
      if (!user) {
        return reply.code(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'User not found',
        });
      }

      return reply.code(200).send(user);
    }
  );

  // DELETE /users/:id - Delete a specific user
  fastify.delete(
    '/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        response: {
          204: { type: 'null' },
          404: {
            type: 'object',
            properties: {
              statusCode: { type: 'number' },
              error: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    (request, reply) => {
      const { id } = request.params as { id: string };

      const userIndex = users.findIndex(u => u.id === id);
      if (userIndex === -1) {
        return reply.code(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'User not found',
        });
      }

      users.splice(userIndex, 1);
      return reply.code(204).send();
    }
  );

  // Helper route to reset state (for testing purposes)
  fastify.delete(
    '/test/reset',
    {
      schema: {
        response: {
          204: { type: 'null' },
        },
      },
    },
    (request, reply) => {
      users.length = 0; // Clear all users
      nextId = 1; // Reset ID counter
      return reply.code(204).send();
    }
  );

  // Plugin registration complete
  await Promise.resolve();
};

export default users_routes;

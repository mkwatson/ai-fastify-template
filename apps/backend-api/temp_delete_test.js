import { build } from './test/helper.js';

async function testDelete() {
  const app = await build();
  
  // Create a user first
  const createResponse = await app.inject({
    method: 'POST',
    url: '/users',
    payload: { name: 'Test User', email: 'test@example.com' }
  });
  
  console.log('Create response:', createResponse.statusCode, createResponse.payload);
  const user = JSON.parse(createResponse.payload);
  
  // Now delete it
  const deleteResponse = await app.inject({
    method: 'DELETE',
    url: `/users/${user.id}`
  });
  
  console.log('Delete response:', deleteResponse.statusCode, deleteResponse.payload);
  console.log('Delete payload length:', deleteResponse.payload.length);
  
  await app.close();
}

testDelete().catch(console.error);

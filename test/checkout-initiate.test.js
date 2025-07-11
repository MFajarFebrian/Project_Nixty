import { describe, it, before, after } from 'node:test';
import { strict as assert } from 'node:assert';
import { createServer } from 'http';

// Mock the Midtrans client to avoid real API calls during testing
const mockMidtransClient = {
  Snap: class {
    constructor(config) {
      this.config = config;
    }
    
    async createTransactionToken(params) {
      // Mock response - verify that enabled_payments contains only QRIS
      assert.deepEqual(params.enabled_payments, ['qris'], 'enabled_payments should only contain QRIS');
      
      // Verify gross_amount uses quantity
      const expectedAmount = params.item_details[0].price * params.item_details[0].quantity;
      assert.equal(params.transaction_details.gross_amount, expectedAmount, 'gross_amount should use quantity');
      
      return { token: 'mock_token_123' };
    }
  }
};

// Mock the database
const mockDb = {
  execute: async (query, params) => {
    // Mock successful database insert
    return [{ insertId: 1 }];
  }
};

// Mock the config
const mockConfig = {
  midtransConfig: {
    isProduction: false,
    serverKey: 'mock_server_key',
    clientKey: 'mock_client_key'
  }
};

// Mock the Nuxt utilities
global.defineEventHandler = (handler) => handler;
global.readBody = async (event) => event.body;
global.createError = (error) => {
  const err = new Error(error.statusMessage || error.message);
  err.statusCode = error.statusCode;
  return err;
};

describe('Checkout Initiate Endpoint', () => {
  let server;
  let port;

  before(async () => {
    // Create a test server
    server = createServer(async (req, res) => {
      if (req.method === 'POST' && req.url === '/api/checkout/initiate') {
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        req.on('end', async () => {
          try {
            const parsedBody = JSON.parse(body);
            const event = { body: parsedBody, node: { req } };
            
            // Mock the imports for our endpoint
            const originalRequire = require;
            require = (id) => {
              if (id === 'midtrans-client') return mockMidtransClient;
              if (id === '~/server/utils/config') return mockConfig;
              if (id === '~/server/utils/db') return mockDb;
              return originalRequire(id);
            };
            
            // Import our endpoint handler
            const { default: handler } = await import('../server/api/checkout/initiate.post.js');
            
            // Call the handler
            const result = await handler(event);
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));
          } catch (error) {
            res.writeHead(error.statusCode || 500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
              error: error.message,
              statusCode: error.statusCode || 500
            }));
          }
        });
      } else {
        res.writeHead(404);
        res.end();
      }
    });

    await new Promise((resolve) => {
      server.listen(0, resolve);
    });
    
    port = server.address().port;
  });

  after(() => {
    server.close();
  });

  it('should return QRIS as the only enabled payment method', async () => {
    const testData = {
      product: {
        id: 1,
        name: 'Test Product',
        version: '1.0',
        price: 100000,
        category: { name: 'Software' }
      },
      customer: {
        name: 'John Doe',
        email: 'john@example.com'
      },
      quantity: 2
    };

    const response = await fetch(`http://localhost:${port}/api/checkout/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    // The test will pass if the mocked Midtrans client doesn't throw an error
    // This means enabled_payments was correctly set to ['qris']
    assert.equal(response.status, 200, 'Response should be successful');
    assert.ok(result.token, 'Response should contain a token');
    assert.ok(result.order_id, 'Response should contain an order_id');
  });

  it('should reject payment method override attempts', async () => {
    const testData = {
      product: {
        id: 1,
        name: 'Test Product',
        version: '1.0',
        price: 100000,
        category: { name: 'Software' }
      },
      customer: {
        name: 'John Doe',
        email: 'john@example.com'
      },
      payment_method: 'credit_card' // This should be rejected
    };

    const response = await fetch(`http://localhost:${port}/api/checkout/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    assert.equal(response.status, 400, 'Response should be a bad request');
    assert.ok(result.error.includes('Payment method cannot be overridden'), 'Error should mention payment method override rejection');
  });

  it('should reject enabled_payments override attempts', async () => {
    const testData = {
      product: {
        id: 1,
        name: 'Test Product',
        version: '1.0',
        price: 100000,
        category: { name: 'Software' }
      },
      customer: {
        name: 'John Doe',
        email: 'john@example.com'
      },
      enabled_payments: ['credit_card', 'bca_va'] // This should be rejected
    };

    const response = await fetch(`http://localhost:${port}/api/checkout/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    assert.equal(response.status, 400, 'Response should be a bad request');
    assert.ok(result.error.includes('Payment method cannot be overridden'), 'Error should mention payment method override rejection');
  });

  it('should calculate gross_amount using quantity', async () => {
    const testData = {
      product: {
        id: 1,
        name: 'Test Product',
        version: '1.0',
        price: 50000,
        category: { name: 'Software' }
      },
      customer: {
        name: 'John Doe',
        email: 'john@example.com'
      },
      quantity: 3
    };

    const response = await fetch(`http://localhost:${port}/api/checkout/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    // The test will pass if the mocked Midtrans client doesn't throw an error
    // This means gross_amount was correctly calculated as price * quantity
    assert.equal(response.status, 200, 'Response should be successful');
    assert.ok(result.token, 'Response should contain a token');
    assert.ok(result.order_id, 'Response should contain an order_id');
  });
});

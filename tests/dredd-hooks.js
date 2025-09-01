const hooks = require('hooks');

let authToken = '';
let testOrderId = null;

// Setup test environment - create a test user at startup
hooks.beforeAll(async (transactions, done) => {
  try {
    console.log('Setting up test environment...');
    authToken = 'test-token-placeholder'; // We'll get a real token later
    console.log('Setup complete');
  } catch (error) {
    console.error('Setup failed:', error);
  }
  done();
});

// Handle 500 error for products
hooks.before('/api/products > Get all products > 500', (transaction, done) => {
  transaction.request.uri = '/api/products?simulate=500';
  done();
});

// Handle 404 error for products
hooks.before('/api/products/{id} > Get product by ID > 404', (transaction, done) => {
  transaction.request.uri = '/api/products/999999';
  done();
});

// Handle register success - use unique email
hooks.before('/auth/register > User registration > 201 > application/json', (transaction, done) => {
  const uniqueEmail = 'user' + Date.now() + '@example.com';
  transaction.request.body = JSON.stringify({
    email: uniqueEmail,
    password: 'testpassword123',
    first_name: 'New',
    last_name: 'User'
  });
  done();
});

// Handle register invalid data
hooks.before('/auth/register > User registration > 400', (transaction, done) => {
  transaction.request.body = JSON.stringify({
    email: 'invalid-email',
    password: '123',
    first_name: '',
    last_name: ''
  });
  done();
});

// Handle register conflict - use existing email
hooks.before('/auth/register > User registration > 409', (transaction, done) => {
  transaction.request.body = JSON.stringify({
    email: 'dredd.test@example.com', // This should already exist
    password: 'testpassword123',
    first_name: 'Test',
    last_name: 'User'
  });
  done();
});

// Handle login success - use existing user
hooks.before('/auth/login > User login > 200 > application/json', (transaction, done) => {
  transaction.request.body = JSON.stringify({
    email: 'dredd.test@example.com',
    password: 'testpassword123'
  });
  done();
});

// Get real auth token from successful login
hooks.after('/auth/login > User login > 200 > application/json', (transaction, done) => {
  if (transaction.real && transaction.real.body) {
    try {
      const response = JSON.parse(transaction.real.body);
      if (response.token) {
        authToken = response.token;
        console.log('Got auth token:', authToken.substring(0, 20) + '...');
      }
    } catch (e) {
      console.log('Failed to parse login response:', e);
    }
  }
  done();
});

// After creating an order, store its ID for delete tests
hooks.after('/api/orders > Create new order > 201 > application/json', (transaction, done) => {
  if (transaction.real && transaction.real.body) {
    try {
      const response = JSON.parse(transaction.real.body);
      if (response.id) {
        testOrderId = response.id;
        console.log('Stored test order ID:', testOrderId);
      }
    } catch (e) {
      console.log('Failed to parse order creation response:', e);
    }
  }
  done();
});

// Handle login invalid
hooks.before('/auth/login > User login > 401', (transaction, done) => {
  transaction.request.body = JSON.stringify({
    email: 'invalid@example.com',
    password: 'wrongpassword'
  });
  done();
});

// Handle profile endpoints with auth
hooks.before('/api/profile > Get user profile > 200 > application/json', (transaction, done) => {
  console.log('Setting auth header for profile GET, token:', authToken ? 'present' : 'missing');
  if (authToken && authToken !== 'test-token-placeholder') {
    transaction.request.headers['Authorization'] = 'Bearer ' + authToken;
  }
  done();
});

hooks.before('/api/profile > Get user profile > 404', (transaction, done) => {
  if (authToken && authToken !== 'test-token-placeholder') {
    transaction.request.headers['Authorization'] = 'Bearer ' + authToken;
  }
  transaction.request.uri = '/api/profile?simulate=404';
  done();
});

hooks.before('/api/profile > Update user profile > 200 > application/json', (transaction, done) => {
  if (authToken && authToken !== 'test-token-placeholder') {
    transaction.request.headers['Authorization'] = 'Bearer ' + authToken;
  }
  transaction.request.body = JSON.stringify({
    first_name: 'Updated',
    last_name: 'User'
  });
  done();
});

hooks.before('/api/profile > Update user profile > 400', (transaction, done) => {
  if (authToken && authToken !== 'test-token-placeholder') {
    transaction.request.headers['Authorization'] = 'Bearer ' + authToken;
  }
  transaction.request.body = JSON.stringify({
    first_name: '',
    last_name: ''
  });
  done();
});

// Handle orders endpoints with auth
hooks.before('/api/orders > Get user orders > 200 > application/json', (transaction, done) => {
  if (authToken && authToken !== 'test-token-placeholder') {
    transaction.request.headers['Authorization'] = 'Bearer ' + authToken;
  }
  done();
});

hooks.before('/api/orders > Create new order > 201 > application/json', (transaction, done) => {
  if (authToken && authToken !== 'test-token-placeholder') {
    transaction.request.headers['Authorization'] = 'Bearer ' + authToken;
  }
  transaction.request.body = JSON.stringify({
    total: 99.99
  });
  done();
});

hooks.before('/api/orders > Create new order > 400', (transaction, done) => {
  if (authToken && authToken !== 'test-token-placeholder') {
    transaction.request.headers['Authorization'] = 'Bearer ' + authToken;
  }
  transaction.request.body = JSON.stringify({
    total: -1
  });
  done();
});

hooks.before('/api/orders/{id} > Cancel order > 200 > application/json', (transaction, done) => {
  if (authToken && authToken !== 'test-token-placeholder') {
    transaction.request.headers['Authorization'] = 'Bearer ' + authToken;
  }
  // Use the test order ID we created, or fallback to first order we can find
  const orderId = testOrderId || '22'; // 22 was the last order created in previous test
  transaction.request.uri = `/api/orders/${orderId}`;
  done();
});

hooks.before('/api/orders/{id} > Cancel order > 400', (transaction, done) => {
  if (authToken && authToken !== 'test-token-placeholder') {
    transaction.request.headers['Authorization'] = 'Bearer ' + authToken;
  }
  // Use the test order ID we created, or fallback to first order we can find
  const orderId = testOrderId || '22'; // 22 was the last order created in previous test
  transaction.request.uri = `/api/orders/${orderId}?simulate=400`;
  done();
});

hooks.before('/api/orders/{id} > Cancel order > 404', (transaction, done) => {
  if (authToken && authToken !== 'test-token-placeholder') {
    transaction.request.headers['Authorization'] = 'Bearer ' + authToken;
  }
  transaction.request.uri = '/api/orders/999999';
  done();
});

hooks.afterAll((transactions, done) => {
  console.log('Cleaning up test environment...');
  done();
});

module.exports = hooks;

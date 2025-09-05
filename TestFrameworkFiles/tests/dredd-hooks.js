const hooks = require('hooks');
const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Configuration from environment variables
const CONFIG = {
  API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3000',
  OPENAPI_SCHEMA_PATH: process.env.OPENAPI_SCHEMA_PATH || 'schemas/api-schema.yaml',
  SERVER_PORT: process.env.SERVER_PORT || '3000',
  UNIQUE_EMAIL_SUFFIX: process.env.UNIQUE_EMAIL_SUFFIX || '@example.com',
  
  // Authentication Configuration
  AUTH_TYPE: process.env.AUTH_TYPE || 'bearer', // bearer, apikey, basic, oauth2, custom
  AUTH_HEADER_NAME: process.env.AUTH_HEADER_NAME || 'Authorization',
  AUTH_TOKEN_PREFIX: process.env.AUTH_TOKEN_PREFIX || 'Bearer ',
  AUTH_REGISTER_ENDPOINT: process.env.AUTH_REGISTER_ENDPOINT || '/auth/register',
  AUTH_LOGIN_ENDPOINT: process.env.AUTH_LOGIN_ENDPOINT || '/auth/login',
  AUTH_TOKEN_FIELD: process.env.AUTH_TOKEN_FIELD || 'token',
  
  // API Response Patterns
  SUCCESS_STATUS_CODES: (process.env.SUCCESS_STATUS_CODES || '200,201,202,204').split(','),
  ERROR_STATUS_CODES: (process.env.ERROR_STATUS_CODES || '400,401,403,404,409,422,500').split(','),
  
  // Auto-Discovery Configuration
  ENABLE_AUTO_DISCOVERY: process.env.ENABLE_AUTO_DISCOVERY === 'true',
  AUTO_DETECT_TOKEN_FIELDS: process.env.AUTO_DETECT_TOKEN_FIELDS !== 'false',
  AUTO_DETECT_ID_FIELDS: process.env.AUTO_DETECT_ID_FIELDS !== 'false',
  
  // Field Pattern Configuration
  TOKEN_FIELD_PATTERNS: (process.env.TOKEN_FIELD_PATTERNS || 'token,access_token,accessToken,authToken,jwt,auth.token,data.token,result.token').split(','),
  ID_FIELD_PATTERNS: (process.env.ID_FIELD_PATTERNS || 'id,_id,uuid,identifier,pk,objectId').split(','),
  EMAIL_FIELD_PATTERNS: (process.env.EMAIL_FIELD_PATTERNS || 'email,emailAddress,userEmail,mail').split(','),
  PASSWORD_FIELD_PATTERNS: (process.env.PASSWORD_FIELD_PATTERNS || 'password,passwd,pwd,pass').split(','),
  
  ENABLE_DEBUG_LOGGING: process.env.ENABLE_DEBUG_LOGGING === 'true',
  ENABLE_DYNAMIC_DATA_GENERATION: process.env.ENABLE_DYNAMIC_DATA_GENERATION !== 'false',
  ENABLE_ERROR_SIMULATION: process.env.ENABLE_ERROR_SIMULATION !== 'false',
  AUTO_SKIP_TESTS: process.env.AUTO_SKIP_TESTS === 'true'
};

console.log('Framework Configuration:', {
  API_BASE_URL: CONFIG.API_BASE_URL,
  SCHEMA_PATH: CONFIG.OPENAPI_SCHEMA_PATH,
  DEBUG_LOGGING: CONFIG.ENABLE_DEBUG_LOGGING
});

let authToken = '';
let testOrderId = null;
let registeredUser = null; // Store registered user credentials for login tests
let protectedEndpoints = new Set();
let allEndpoints = new Map();
let parsedSchema = null; // Store parsed schema for $ref resolution

// Parse OpenAPI schema and extract all endpoint information
function parseSchema() {
  try {
    const schemaPath = path.join(__dirname, '..', CONFIG.OPENAPI_SCHEMA_PATH);
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    parsedSchema = yaml.load(schemaContent);
    const schema = parsedSchema;
    
    if (schema.paths) {
      Object.entries(schema.paths).forEach(([pathKey, pathObject]) => {
        Object.entries(pathObject).forEach(([method, operation]) => {
          const endpointKey = `${method.toUpperCase()} ${pathKey}`;
          
          // Detect if endpoint requires authentication (flexible security scheme detection)
          const requiresAuth = operation.security && operation.security.length > 0 && 
            operation.security.some(sec => Object.keys(sec).length > 0);
          
          // Store all endpoint information
          allEndpoints.set(endpointKey, {
            path: pathKey,
            method: method.toUpperCase(),
            operation,
            requiresAuth: requiresAuth,
            requestBody: operation.requestBody,
            responses: operation.responses,
            securitySchemes: operation.security || []
          });
          
          // Auto-discover authentication endpoints if enabled
          if (CONFIG.ENABLE_AUTO_DISCOVERY) {
            autoDiscoverAuthEndpoints(pathKey, method, operation);
          }
          
          // Track protected endpoints (any security scheme)
          if (requiresAuth) {
            protectedEndpoints.add(endpointKey);
          }
        });
      });
    }
    
    console.log('All endpoints loaded:', allEndpoints.size);
    console.log('Protected endpoints:', Array.from(protectedEndpoints));
    
    // Log auto-discovered configurations
    if (CONFIG.ENABLE_AUTO_DISCOVERY) {
      console.log('Auto-discovery enabled - framework will adapt to API patterns');
    }
  } catch (error) {
    console.error('Error parsing schema:', error);
  }
}

// Auto-discover authentication endpoints based on common patterns
function autoDiscoverAuthEndpoints(pathKey, method, operation) {
  if (method.toLowerCase() !== 'post') return;
  
  const path = pathKey.toLowerCase();
  const summary = (operation.summary || '').toLowerCase();
  const description = (operation.description || '').toLowerCase();
  
  // Common authentication endpoint patterns
  const loginPatterns = ['login', 'signin', 'auth', 'authenticate', 'session'];
  const registerPatterns = ['register', 'signup', 'create', 'account'];
  
  // Auto-discover login endpoint
  if (loginPatterns.some(pattern => 
    path.includes(pattern) || summary.includes(pattern) || description.includes(pattern)
  )) {
    if (CONFIG.ENABLE_DEBUG_LOGGING) {
      console.log(`Auto-discovered login endpoint: ${pathKey}`);
    }
    // Update CONFIG if not manually set
    if (CONFIG.AUTH_LOGIN_ENDPOINT === '/auth/login') {
      CONFIG.AUTH_LOGIN_ENDPOINT = pathKey;
    }
  }
  
  // Auto-discover register endpoint  
  if (registerPatterns.some(pattern => 
    path.includes(pattern) || summary.includes(pattern) || description.includes(pattern)
  )) {
    if (CONFIG.ENABLE_DEBUG_LOGGING) {
      console.log(`Auto-discovered register endpoint: ${pathKey}`);
    }
    // Update CONFIG if not manually set
    if (CONFIG.AUTH_REGISTER_ENDPOINT === '/auth/register') {
      CONFIG.AUTH_REGISTER_ENDPOINT = pathKey;
    }
  }
}

// Smart field detection based on patterns
function detectFieldType(fieldName) {
  const name = fieldName.toLowerCase();
  
  if (CONFIG.EMAIL_FIELD_PATTERNS.some(pattern => name.includes(pattern))) {
    return 'email';
  }
  if (CONFIG.PASSWORD_FIELD_PATTERNS.some(pattern => name.includes(pattern))) {
    return 'password';
  }
  if (CONFIG.ID_FIELD_PATTERNS.some(pattern => name.includes(pattern))) {
    return 'id';
  }
  
  return 'unknown';
}

// Enhanced token capture with pattern matching
function captureTokenFromResponse(response, uri) {
  if (!CONFIG.AUTO_DETECT_TOKEN_FIELDS) {
    // Use only configured field
    return getNestedValue(response, CONFIG.AUTH_TOKEN_FIELD);
  }
  
  // Try all configured patterns
  for (const pattern of CONFIG.TOKEN_FIELD_PATTERNS) {
    const token = getNestedValue(response, pattern);
    if (token) {
      if (CONFIG.ENABLE_DEBUG_LOGGING) {
        console.log(`Token found using pattern "${pattern}" from ${uri}`);
      }
      return token;
    }
  }
  
  return null;
}

// Helper function to get nested values from objects (e.g., "data.token" -> obj.data.token)
function getNestedValue(obj, path) {
  if (!obj || !path) return null;
  
  // Handle simple field names
  if (!path.includes('.')) {
    return obj[path];
  }
  
  // Handle nested paths like "data.token" or "result.auth.token"
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null;
  }, obj);
}

// Check if endpoint requires authentication
function isProtectedEndpoint(method, uri) {
  // Normalize path for path params like /api/orders/1 -> /api/orders/{id}
  const normalizedPath = uri.replace(/\/\d+$/, '/{id}');
  return protectedEndpoints.has(`${method} ${uri}`) || protectedEndpoints.has(`${method} ${normalizedPath}`);
}

// Get endpoint information dynamically
function getEndpointInfo(method, uri) {
  const normalizedPath = uri.replace(/\/\d+$/, '/{id}');
  const key1 = `${method} ${uri}`;
  const key2 = `${method} ${normalizedPath}`;
  
  return allEndpoints.get(key1) || allEndpoints.get(key2);
}

// Generate dynamic test data based on endpoint and response code
function generateTestData(method, uri, statusCode, transactionName) {
  // Get endpoint info from schema
  const endpointInfo = getEndpointInfo(method, uri);
  if (!endpointInfo || !endpointInfo.operation.requestBody) {
    return null;
  }

  try {
    const requestBody = endpointInfo.operation.requestBody;
    const contentType = requestBody.content && requestBody.content['application/json'];
    if (!contentType || !contentType.schema) {
      return null;
    }

    const schema = contentType.schema;
    
    // Resolve $ref if present
    let resolvedSchema = schema;
    if (schema.$ref) {
      const refPath = schema.$ref.replace('#/components/schemas/', '');
      resolvedSchema = parsedSchema.components?.schemas?.[refPath];
    }
    
    if (!resolvedSchema || !resolvedSchema.properties) {
      return null;
    }
    const properties = resolvedSchema.properties || {};
    
    // Generate test data based on status code and schema properties
    const testData = {};
    
    Object.entries(properties).forEach(([fieldName, fieldSchema]) => {
      const fieldType = fieldSchema.type;
      const fieldFormat = fieldSchema.format;
      
      if (statusCode === '400' || (transactionName && transactionName.includes('400'))) {
        // Generate invalid data for 400 tests
        testData[fieldName] = generateInvalidValue(fieldType, fieldFormat, fieldName);
      } else if (statusCode === '409' || (transactionName && transactionName.includes('409'))) {
        // Generate conflict data for 409 tests (existing records)
        testData[fieldName] = generateConflictValue(fieldType, fieldFormat, fieldName);
      } else if (statusCode === '401' || (transactionName && transactionName.includes('401'))) {
        // Generate data for unauthorized tests
        testData[fieldName] = generateValidValue(fieldType, fieldFormat, fieldName);
      } else {
        // Generate valid data for success tests
        testData[fieldName] = generateValidValue(fieldType, fieldFormat, fieldName);
      }
    });
    
    return Object.keys(testData).length > 0 ? testData : null;
  } catch (error) {
    console.log('Error generating test data:', error);
    return null;
  }
}

// Generate valid values based on field type and format with smart detection
function generateValidValue(type, format, fieldName) {
  // Use smart field detection if enabled
  if (CONFIG.AUTO_DETECT_TOKEN_FIELDS || CONFIG.AUTO_DETECT_ID_FIELDS) {
    const detectedType = detectFieldType(fieldName);
    
    if (detectedType === 'email') {
      return `test${Date.now()}${Math.floor(Math.random() * 1000)}${CONFIG.UNIQUE_EMAIL_SUFFIX}`;
    }
    if (detectedType === 'password') {
      return 'testpassword123';
    }
    if (detectedType === 'id' && (type === 'number' || type === 'integer')) {
      return 1;
    }
  }
  
  if (type === 'string') {
    if (format === 'email' || fieldName.toLowerCase().includes('email')) {
      // Generate unique email for each test to avoid conflicts
      return `test${Date.now()}${Math.floor(Math.random() * 1000)}${CONFIG.UNIQUE_EMAIL_SUFFIX}`;
    }
    if (fieldName.toLowerCase().includes('password')) {
      return 'testpassword123';
    }
    if (fieldName.toLowerCase().includes('name')) {
      return fieldName.includes('first') ? 'Test' : 'User';
    }
    return `test-${fieldName}-value`;
  }
  
  if (type === 'number' || type === 'integer') {
    if (fieldName.toLowerCase().includes('total')) {
      // Generate dynamic order total (between 50-500)
      return Math.round((Math.random() * 450 + 50) * 100) / 100;
    }
    if (fieldName.toLowerCase().includes('price')) {
      // Generate dynamic product price (between 10-200)
      return Math.round((Math.random() * 190 + 10) * 100) / 100;
    }
    if (fieldName.toLowerCase().includes('id')) {
      return 1;
    }
    return 42;
  }
  
  if (type === 'boolean') {
    return true;
  }
  
  return `test-${fieldName}`;
}

// Generate invalid values for 400 tests
function generateInvalidValue(type, format, fieldName) {
  if (type === 'string') {
    if (format === 'email' || fieldName.toLowerCase().includes('email')) {
      return ''; // Empty email for required field validation
    }
    if (fieldName.toLowerCase().includes('password')) {
      return ''; // Empty password for required field validation
    }
    return ''; // Empty string for required fields
  }
  
  if (type === 'number' || type === 'integer') {
    if (fieldName.toLowerCase().includes('total') || fieldName.toLowerCase().includes('price')) {
      return -1; // Negative value
    }
    return -999;
  }
  
  return '';
}

// Generate conflict values for 409 tests
function generateConflictValue(type, format, fieldName) {
  if (type === 'string' && (format === 'email' || fieldName.toLowerCase().includes('email'))) {
    // For 409 test, use the registered user's email if available
    return registeredUser ? registeredUser.email : 'conflict@example.com';
  }
  
  if (fieldName.toLowerCase().includes('password')) {
    return registeredUser ? registeredUser.password : 'conflictpassword';
  }
  
  if (fieldName.toLowerCase().includes('name')) {
    const firstName = registeredUser ? registeredUser.first_name : 'Conflict';
    const lastName = registeredUser ? registeredUser.last_name : 'User';
    return fieldName.includes('first') ? firstName : lastName;
  }
  
  return generateValidValue(type, format, fieldName);
}

// Special handling for login endpoints - use registered user credentials
function generateLoginCredentials(statusCode) {
  if (statusCode === '200') {
    // Use registered user credentials for successful login
    if (registeredUser) {
      return {
        email: registeredUser.email,
        password: registeredUser.password
      };
    } else {
      // Fallback - this should not happen if register test runs first
      console.warn('No registered user available for login test');
      return {
        email: 'fallback@example.com',
        password: 'fallbackpassword'
      };
    }
  } else if (statusCode === '401') {
    // Use invalid credentials for 401 test
    return {
      email: 'nonexistent@example.com',
      password: 'wrongpassword'
    };
  }
  return null;
}

// Initialize
hooks.beforeAll((transactions, done) => {
  parseSchema();
  console.log('Framework initialized - user credentials will be captured from register tests');
  done();
});

// Universal test skip handler - runs before each transaction
hooks.beforeEach((transaction, done) => {
  // Dynamic skip logic based on configuration
  if (CONFIG.AUTO_SKIP_TESTS) {
    transaction.skip = true;
    if (CONFIG.ENABLE_DEBUG_LOGGING) {
      console.log(`Dynamically skipping test: ${transaction.name}`);
    }
  }
  done();
});

// Universal authentication handler - runs for every transaction
hooks.beforeEach((transaction, done) => {
  const method = transaction.request.method;
  const uri = transaction.request.uri.split('?')[0]; // Remove query params
  
  // Check if this endpoint requires authentication
  if (isProtectedEndpoint(method, uri)) {
    // Check if this is a 401 test (unauthorized test)
    const is401Test = transaction.name && transaction.name.includes('401');
    
    if (is401Test) {
      // For 401 tests, use invalid token
      transaction.request.headers[CONFIG.AUTH_HEADER_NAME] = CONFIG.AUTH_TOKEN_PREFIX + 'invalid-token';
      console.log(`Using invalid token for 401 test: ${method} ${uri}`);
    } else {
      // For valid tests, use real token if available
      if (authToken && authToken !== 'test-token-placeholder') {
        transaction.request.headers[CONFIG.AUTH_HEADER_NAME] = CONFIG.AUTH_TOKEN_PREFIX + authToken;
        console.log(`Adding auth token for: ${method} ${uri}`);
      } else {
        console.log(`Warning: No auth token available for: ${method} ${uri}`);
      }
    }
  }
  
  done();
});

// Universal test data handler - runs for every transaction
hooks.beforeEach((transaction, done) => {
  const method = transaction.request.method;
  const uri = transaction.request.uri.split('?')[0];
  
  console.log(`HOOK DEBUG: Processing ${method} ${uri}`);
  
  // Extract status code from transaction name if available
  const statusCodeMatch = transaction.name && transaction.name.match(/(\d{3})/);
  const statusCode = statusCodeMatch ? statusCodeMatch[1] : null;
  

  // Generate dynamic test data for all endpoints
  const testData = generateTestData(method, uri, statusCode, transaction.name);
  if (testData) {
    transaction.request.body = JSON.stringify(testData);
    console.log(`Generated test data for ${method} ${uri} (${statusCode}):`, testData);
  }

  // Special handling for login endpoints - override generated data with proper credentials
  if (uri === '/auth/login') {
    const loginData = generateLoginCredentials(statusCode);
    if (loginData) {
      transaction.request.body = JSON.stringify(loginData);
      console.log(`Using login credentials for ${method} ${uri} (${statusCode}):`, loginData);
    }
  }

  // Special handling for 404 tests - modify URIs to cause 404 responses
  if (statusCode === '404' || (transaction.name && transaction.name.includes('404'))) {
    if (uri.startsWith('/api/products/')) {
      // Use non-existent product ID for 404 test
      transaction.request.uri = '/api/products/999999';
      transaction.fullPath = '/api/products/999999';
      console.log(`Using non-existent product for 404 test: /api/products/999999`);
    } else if (uri.startsWith('/api/profile')) {
      // Use simulate parameter for profile 404 test
      const separator = uri.includes('?') ? '&' : '?';
      transaction.request.uri = uri + separator + 'simulate=404';
      transaction.fullPath = transaction.request.uri;
      console.log(`Adding simulate=404 parameter for profile 404 test: ${transaction.request.uri}`);
    }
  }

  // Special handling for 500 tests - these might need server-side simulation
  if (statusCode === '500' || (transaction.name && transaction.name.includes('500'))) {
    if (uri.startsWith('/api/products')) {
      // Add a special parameter that could trigger a 500 error
      const separator = uri.includes('?') ? '&' : '?';
      transaction.request.uri = uri + separator + 'simulate=500';
      transaction.fullPath = transaction.request.uri;
      console.log(`Adding simulate=500 parameter for 500 test: ${transaction.request.uri}`);
    }
  }

  // Handle order deletion endpoints with path parameters dynamically
  if (uri.startsWith('/api/orders/') && method === 'DELETE') {
    console.log(`DELETE order transaction processing: statusCode=${statusCode}, transactionName=${transaction.name}, testOrderId=${testOrderId}`);
    
    if (statusCode === '404' || (transaction.name && transaction.name.includes('404'))) {
      transaction.request.uri = '/api/orders/999999';
      transaction.fullPath = '/api/orders/999999';
      console.log(`Using non-existent order for 404 test: /api/orders/999999`);
    } else if (statusCode === '401' || (transaction.name && transaction.name.includes('401'))) {
      transaction.request.uri = '/api/orders/43';
      transaction.fullPath = '/api/orders/43';
      console.log(`Using order 43 for 401 test: /api/orders/43`);
    } else if (statusCode === '400' || (transaction.name && transaction.name.includes('400'))) {
      // For 400 error, use the most recently created order with simulate parameter
      if (testOrderId) {
        transaction.request.uri = `/api/orders/${testOrderId}?simulate=400`;
        transaction.fullPath = `/api/orders/${testOrderId}?simulate=400`;
        console.log(`Using recent order ${testOrderId} with simulate=400 for 400 test: /api/orders/${testOrderId}?simulate=400`);
      } else {
        // Fallback to a known existing order
        transaction.request.uri = `/api/orders/65?simulate=400`;
        transaction.fullPath = `/api/orders/65?simulate=400`;
        console.log(`Using fallback order 65 with simulate=400 for 400 test: /api/orders/65?simulate=400`);
      }
    } else if (statusCode === '200') {
      // For 200 test, use the most recently created order (captured during this test run)
      if (testOrderId) {
        transaction.request.uri = `/api/orders/${testOrderId}`;
        transaction.fullPath = `/api/orders/${testOrderId}`;
        console.log(`Using most recent order ${testOrderId} for 200 test: /api/orders/${testOrderId}`);
      } else {
        // Fallback to a known existing order
        transaction.request.uri = `/api/orders/65`;
        transaction.fullPath = `/api/orders/65`;
        console.log(`Using fallback order 65 for 200 test: /api/orders/65`);
      }
    } else {
      // Fallback: use the original URI but it might fail
      console.log(`Warning: No specific handling for DELETE ${uri} with status ${statusCode}, using original URI`);
    }
  }
  
  done();
});

// Dynamic after hooks - capture tokens and IDs automatically
hooks.afterEach((transaction, done) => {
  if (transaction.real && transaction.real.body) {
    try {
      const response = JSON.parse(transaction.real.body);
      const method = transaction.request.method;
      const uri = transaction.request.uri.split('?')[0];
      
      // Enhanced token capture from authentication endpoints
      if (method === 'POST' && CONFIG.SUCCESS_STATUS_CODES.includes(transaction.real.statusCode.toString())) {
        // Check if this is an authentication endpoint (login or register)
        if (uri.includes(CONFIG.AUTH_LOGIN_ENDPOINT) || uri.includes(CONFIG.AUTH_REGISTER_ENDPOINT) || uri === '/auth/login') {
          if (CONFIG.ENABLE_DEBUG_LOGGING) {
            console.log(`Attempting token capture from ${uri}, response:`, JSON.stringify(response).substring(0, 200));
          }
          const capturedToken = captureTokenFromResponse(response, uri);
          if (capturedToken) {
            authToken = capturedToken;
            console.log(`Dynamically captured auth token from ${uri}:`, authToken.substring(0, 20) + '...');
          } else if (CONFIG.ENABLE_DEBUG_LOGGING) {
            console.log(`No token found in response from ${uri}`);
          }
        }
      }
      
      // Generic ID capture from any successful creation endpoint (201 status)
      if (method === 'POST' && transaction.real.statusCode === 201) {
        // Capture registered user credentials for future login tests
        if (uri.includes('/auth/register') && transaction.request.body) {
          try {
            const requestBody = JSON.parse(transaction.request.body);
            registeredUser = {
              email: requestBody.email,
              password: requestBody.password,
              first_name: requestBody.first_name,
              last_name: requestBody.last_name
            };
            console.log(`Captured registered user for login tests:`, registeredUser.email);
          } catch (e) {
            // Silent fail for invalid JSON
          }
        }
        
        // Look for common ID field names
        const idFields = ['id', '_id', 'uuid', 'identifier'];
        for (const field of idFields) {
          if (response[field]) {
            // Store ID with endpoint context for later use
            const endpointType = extractEndpointType(uri);
            if (endpointType) {
              if (endpointType.includes('order')) {
                testOrderId = response[field];
                console.log(`Dynamically captured order ID from ${uri}:`, testOrderId);
              }
              // Can be extended for other resource types
              // testProductId = response[field];
              // testUserId = response[field];
            }
            break;
          }
        }
      }
    } catch (e) {
      // Silent fail for non-JSON responses
    }
  }
  done();
});

// Extract endpoint type from URI for generic ID storage
function extractEndpointType(uri) {
  const segments = uri.split('/').filter(segment => segment && !segment.match(/^\d+$/));
  return segments[segments.length - 1]; // Last segment (e.g., 'orders', 'users', 'products')
}

// Cleanup
hooks.afterAll((transactions, done) => {
  console.log('Cleaning up test environment...');
  done();
});

module.exports = hooks; 

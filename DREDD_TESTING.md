# Dredd API Testing

This project includes comprehensive dynamic Dredd testing that automatically reads your OpenAPI schema and tests all endpoints without manual configuration.

## Features

- **Dynamic Test Discovery**: Automatically discovers all endpoints from `schemas/api-schema.yaml`
- **Authentication Handling**: Automatically handles JWT authentication for protected endpoints
- **Test Data Management**: Uses predefined test data for creating users, orders, etc.
- **Resource Cleanup**: Tracks created resources during testing
- **Integrated Testing**: Runs as Go tests with server lifecycle management

## Setup

1. **Install Node.js dependencies** (required for Dredd hooks):
   ```bash
   npm install
   ```

2. **Install Dredd globally** (optional, for standalone use):
   ```bash
   npm install -g dredd
   ```

## Running Tests

### Method 1: Go-Integrated Tests (Recommended)

Run comprehensive tests that manage the server lifecycle automatically:

```bash
# Run all Dredd tests with endpoint discovery
make test-dredd-all

# Run only the main Dredd validation test
make test-go-dredd

# Run all tests (including Dredd)
make test-all
```

Or directly with Go:

```bash
cd tests
go test -v                    # Run all tests
go test -v -run TestDredd     # Run only Dredd tests
go test -v -run TestEndpoint  # Run only endpoint discovery
```

### Method 2: Standalone Dredd

If you prefer to run Dredd directly (server must be running):

```bash
# Start your server first
make run

# In another terminal, run Dredd
make test-dredd
# or
dredd
```

## Test Configuration

### OpenAPI Schema
Tests are automatically generated from `schemas/api-schema.yaml`. The test system:
- Discovers all endpoints and HTTP methods
- Identifies protected vs public endpoints
- Generates appropriate test data for each endpoint
- Handles path parameters automatically

### Authentication
The test system automatically:
1. Creates a test user account
2. Logs in to get a JWT token
3. Applies the token to protected endpoints
4. Handles different authentication requirements per endpoint

### Test Data
Predefined test data is used for:
- User registration: `dredd.test@example.com`
- User login credentials
- Order creation data
- Profile update data

### Dynamic Hooks
The system generates JavaScript hook files (`dredd-hooks.js`) that:
- Set up authentication headers
- Provide request bodies for POST/PUT endpoints
- Handle path parameters (e.g., `/api/products/{id}`)
- Track created resources for cleanup
- Manage test state across requests

## Test Structure

```
tests/
├── dredd_test.go           # Main test file with Go integration
└── dredd-hooks.js          # Generated JavaScript hooks (auto-created)

schemas/
└── api-schema.yaml         # OpenAPI specification (source of truth)

dredd.yml                   # Dredd configuration
package.json               # Node.js dependencies for hooks
```

## Customization

### Adding New Endpoints
1. Add the endpoint to `schemas/api-schema.yaml`
2. Run tests - they will automatically include the new endpoint
3. If the endpoint needs special test data, add it to the `testData` map in `dredd_test.go`

### Modifying Test Data
Update the `testData` variable in `dredd_test.go`:

```go
var testData = map[string]interface{}{
    "user_register": map[string]interface{}{
        "email":      "your.test@example.com",
        "password":   "newpassword123",
        "first_name": "Test",
        "last_name":  "User",
    },
    // Add new test data here
}
```

### Custom Hooks
The hook generation in `generateDreddHooks()` can be extended to handle new endpoint patterns or authentication schemes.

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure port 3000 is available
2. **Database connection**: Ensure your database is running and configured
3. **Node.js dependencies**: Run `npm install` if hooks fail
4. **Dredd not found**: Install globally with `npm install -g dredd`

### Debug Mode

Run with verbose output:
```bash
# Go tests with verbose output
go test -v

# Dredd with debug logging
dredd --level=debug
```

### Hook File Issues

If the generated hooks file has issues:
1. Check `tests/dredd-hooks.js` for syntax errors
2. Verify the OpenAPI schema is valid YAML
3. Run endpoint discovery test: `go test -v -run TestEndpointDiscovery`

## Benefits

- **No Manual Maintenance**: Tests automatically stay in sync with your API schema
- **Comprehensive Coverage**: Every endpoint defined in your schema is tested
- **Real Authentication**: Uses actual JWT tokens, not mocked authentication
- **Integration Ready**: Runs as part of your normal test suite
- **CI/CD Friendly**: Single command runs all API validation tests

# Go Fiber API

[![Go Version](https://img.shields.io/badge/Go-1.18+-blue.svg)5. **Setup d6. **Generate configuration and run**
   ```bash
   npm run config  # Generate Dredd config from environment variables
   swag init
   go run .
   ```se** (PostgreSQL)
   ```bash
   # Create database: ecommerce_api
   # Copy .env.example to .env and configure your settings
   cp .env.example .env
   # Edit .env file with your database credentials and API configuration
   ```ps://golang.org)
[![Fiber Version](https://img.shields.io/badge/Fiber-v2.32.0-green.svg)](https://gofiber.io)
[![Swagger UI](https://img.shields.io/badge/Swagger-UI%20Enabled-brightgreen.svg)](http://localhost:3000/swagger/)
[![API Tests](https://img.shields.io/badge/API%20Tests-25%2F25%20Passing-success.svg)](#testing-status)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue.svg)](https://postgresql.org)

A high-performance RESTful API built with Go Fiber framework featuring JWT authentication, PostgreSQL database integration, **interactive Swagger UI documentation**, and fully automated API testing with Dredd framework. This project implements a complete generic testing solution with zero manual intervention.

## Features

- 🚀 **High Performance**: Built with Go Fiber v2.32.0 for fast HTTP performance
- 🔐 **JWT Authentication**: Secure user authentication and authorization
- 🗄️ **PostgreSQL Database**: GORM ORM with PostgreSQL for robust data persistence
- 📝 **OpenAPI 3.0**: Complete API documentation with schema validation
- 🎨 **Swagger UI**: Interactive API documentation and testing interface
- 🧪 **Fully Automated Testing**: Zero-manual-intervention testing with Dredd framework
- 🤖 **Schema-Driven Tests**: Automatic test generation from OpenAPI specification
- 🎯 **Generic Test Framework**: Reusable testing solution for any REST API
- 🛡️ **Comprehensive Middleware**: CORS, authentication, and error handling
- 📊 **Smart Data Seeding**: Automatic test data generation and management
- ⚡ **Error Simulation**: Built-in API error simulation for comprehensive testing
- 🔧 **100% Test Coverage**: All 25 API scenarios tested and passing

## API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login

### Products (Public)
- `GET /api/products` - Get all products
- `GET /api/products/{id}` - Get product by ID

### Categories (Public)
- `GET /api/categories` - Get all categories

### User Profile (Protected)
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

### Orders (Protected)
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order
- `DELETE /api/orders/{id}` - Cancel order

## Tech Stack

- **Backend**: Go 1.18+
- **Framework**: Fiber v2.32.0
- **Database**: PostgreSQL (GORM v1.24.1)
- **ORM**: GORM v1.24.1
- **Authentication**: JWT (golang-jwt/jwt v4.5.2)
- **Password Hashing**: bcrypt
- **API Documentation**: Swagger UI with swaggo/swag
- **API Testing**: Dredd 14.1.0 with automated hooks
- **Documentation**: OpenAPI 3.0 with schema validation
- **Testing Framework**: Generic, schema-driven test automation

## Prerequisites

- Go 1.18 or higher
- PostgreSQL 12+
- Node.js 18+ (for Dredd testing)

## Quick Start

1. **Clone and setup**
   ```bash
   git clone https://github.com/itu-itis22-cetinkayah20/go-fiber-api.git
   cd go-fiber-api
   go mod download
   ```

2. **Install Swagger CLI**
   ```bash
   go install github.com/swaggo/swag/cmd/swag@latest
   ```

3. **Setup database** (PostgreSQL)
   ```bash
   # Create database: ecommerce_api
   # Default connection: host=localhost user=postgres password=1234 dbname=ecommerce_api port=5432
   ```

4. **Generate docs and run**
   ```bash
   swag init
   go run .
   ```

5. **Access Swagger UI**: Open `http://localhost:3000/swagger/`

## Prerequisites

- Go 1.18 or higher
- PostgreSQL 12+
- Node.js 18+ (for Dredd testing)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/itu-itis22-cetinkayah20/go-fiber-api.git
   cd go-fiber-api
   ```

2. **Install Go dependencies**
   ```bash
   go mod download
   ```

3. **Install Dredd globally**
   ```bash
   npm install -g dredd
   ```

4. **Install Node.js dependencies for testing**
   ```bash
   npm install
   ```

5. **Set up PostgreSQL database**
   - Create a PostgreSQL database named `ecommerce_api`
   - Update database credentials in `config/database.go` if needed
   - Default connection: `host=localhost user=postgres password=1234 dbname=ecommerce_api port=5432`

6. **Install Swagger documentation generator**
   ```bash
   go install github.com/swaggo/swag/cmd/swag@latest
   ```

7. **Generate Swagger documentation**
   ```bash
   swag init
   ```

8. **Build the application**
   ```bash
   go build -o go-fiber-api.exe
   ```

## Configuration

### Environment Variables
The application supports comprehensive configuration through environment variables. Copy `.env.example` to `.env` and customize for your environment:

```bash
# Core API Configuration
API_BASE_URL=http://localhost:3000          # API base URL
API_NAME=Your API Name                      # API name for documentation
SERVER_PORT=3000                           # Server port

# Schema and Testing
OPENAPI_SCHEMA_PATH=schemas/api-schema.yaml # OpenAPI schema file path
DREDD_HOOKS_PATH=tests/dredd-hooks.js      # Test hooks file path
SERVER_START_COMMAND=go run main.go        # Command to start your API server

# Database Configuration
DATABASE_URL=host=localhost user=postgres password=1234 dbname=ecommerce_api port=5432 sslmode=disable
JWT_SECRET=your-super-secret-jwt-key       # JWT signing secret

# Test Configuration
TEST_USER_EMAIL=test@example.com           # Test user credentials
EXISTING_USER_EMAIL=existing@example.com   # Existing user for login tests
ENABLE_DEBUG_LOGGING=true                  # Enable detailed logging
```

### Database Configuration
The application uses PostgreSQL database. Update the connection settings in `config/database.go`:

```go
dsn := "host=localhost user=postgres password=1234 dbname=ecommerce_api port=5432 sslmode=disable"
```

### Environment Variables
The application uses the following environment variables:
- `DATABASE_URL` - Complete PostgreSQL connection string (optional, uses default if not set)
- `JWT_SECRET` - JWT signing secret (defaults to a secure fallback secret)
- `PORT` - Server port (defaults to 3000)

## Running the Application

1. **Start the server**
   ```bash
   ./go-fiber-api.exe
   ```
   
   The server will start on `http://localhost:3000`

2. **Access Swagger UI**
   
   Open your browser and navigate to `http://localhost:3000/swagger/` to access the interactive API documentation and testing interface.

## Swagger UI Integration

This project includes a comprehensive Swagger UI integration that provides:

### 🎨 **Interactive API Documentation**
- **Complete API Explorer**: Browse all endpoints with detailed descriptions
- **Request/Response Examples**: See actual JSON examples for all operations
- **Model Schemas**: Explore data structures with field descriptions and validation rules
- **Authentication Testing**: Built-in JWT token management for protected endpoints

### 📋 **API Testing Interface**
- **Try It Out**: Execute API requests directly from the browser
- **Authentication Flow**: Login to get JWT token and test protected endpoints
- **Parameter Testing**: Test different query parameters and request bodies
- **Response Validation**: See actual API responses with status codes

### 🔧 **Technical Features**
- **Auto-Generated Documentation**: Swagger docs are automatically generated from code annotations
- **Real-time Updates**: Documentation updates automatically when you modify code annotations
- **JWT Security Integration**: Swagger UI supports Bearer token authentication
- **Standardized Responses**: Uses consistent response models (ErrorResponse, MessageResponse, TokenResponse)

### 🚀 **How to Use Swagger UI**

1. **Start the application**: `./go-fiber-api.exe`
2. **Open Swagger UI**: Navigate to `http://localhost:3000/swagger/`
3. **Authentication**: 
   - Use `/auth/login` endpoint to get JWT token
   - Click "Authorize" button and enter `Bearer <your-token>`
   - Test protected endpoints with authentication
4. **API Testing**: Click "Try it out" on any endpoint to test it

### 📚 **Swagger Annotations**
The API documentation is generated from comprehensive annotations in the code:
- **Controller Functions**: Detailed endpoint descriptions with parameters and responses
- **Model Structs**: Complete data structure documentation with examples
- **Security Requirements**: JWT authentication specifications for protected routes


## API Testing

This project features a **revolutionary fully automated testing system** that requires zero manual intervention. The testing framework is generic and can be adapted to any REST API.

### 🎯 **Zero Manual Testing Philosophy**

- **No hardcoded test data** - Everything is dynamically generated
- **Schema-driven automation** - Tests are automatically created from OpenAPI spec
- **Authentication auto-detection** - Protected endpoints are automatically identified
- **Error scenario simulation** - Built-in API simulation for 404, 500, 400 errors
- **100% automation** - No skipped tests, all scenarios covered

### Running Tests

1. **Quick Test Run**
   ```bash
   go test -v ./tests/ -timeout 120s
   ```

2. **Run Dredd directly**
   ```bash
   npm run test:dredd
   ```

3. **Verbose Dredd output**
   ```bash
   npm run test:dredd-verbose
   ```
### Test Configuration

- **API Schema**: `schemas/api-schema.yaml`
- **Dredd Config**: `dredd.yml`
- **Test Hooks**: `tests/dredd-hooks.js`

### Test Coverage

The test suite covers **ALL** API scenarios with **100% automation**:

- ✅ **Authentication Flow**: Registration, login, JWT token management
- ✅ **Protected Endpoints**: Automatic auth token injection
- ✅ **Public Endpoints**: Products, categories without authentication
- ✅ **CRUD Operations**: Complete user profile and order management
- ✅ **Error Scenarios**: 400, 401, 404, 409, 500 error simulation
- ✅ **Data Validation**: Invalid input handling and edge cases
- ✅ **Authorization**: Protected resource access control

### 🚀 **Generic Test Framework Features**

This testing system can be reused for **any REST API** by simply:

1. **Updating the OpenAPI schema** (`schemas/api-schema.yaml`)
2. **Configuring the API endpoint** in `dredd.yml`
3. **Running the tests** - everything else is automatic!

**Key Generic Features:**
- **Schema-driven test generation**
- **Dynamic authentication detection**
- **Automatic test data creation**
- **Error scenario simulation**
- **Universal field type handling**
- **Language and framework agnostic**

## Project Structure

```
go-fiber-api/
├── config/
│   ├── database.go       # Database configuration and connection
│   └── seed.go          # Test data seeding
├── controllers/
│   ├── api.go           # API endpoint handlers with Swagger annotations
│   └── auth.go          # Authentication handlers with Swagger annotations
├── docs/                # Auto-generated Swagger documentation
│   ├── docs.go          # Generated Go documentation
│   └── swagger.json     # Generated OpenAPI specification
├── middleware/
│   └── auth.go          # JWT authentication middleware
├── models/
│   ├── user.go          # Database models with Swagger documentation
│   └── response.go      # Standardized response models for API
├── routes/
│   └── routes.go        # Route definitions
├── schemas/
│   └── api-schema.yaml  # OpenAPI 3.0 specification for testing
├── tests/
│   ├── dredd-hooks.js   # Fully automated generic test framework
│   └── dredd_test.go    # Go test integration
├── dredd.yml            # Dredd configuration
├── package.json         # Node.js dependencies for testing
├── go.mod               # Go module dependencies
├── go.sum               # Go module checksums
├── main.go              # Application entry point
├── seed.go              # Automatic database seeding
├── Makefile             # Build automation
└── README.md            # This file
```

## API Documentation

### Swagger UI Interface
The API features a comprehensive **Swagger UI** interface accessible at `http://localhost:3000/swagger/` when the server is running. This interactive documentation provides:

- **Complete API Explorer**: All endpoints with detailed descriptions and parameters
- **Live API Testing**: Execute requests directly from the browser interface
- **Authentication Integration**: JWT token management for testing protected endpoints
- **Model Documentation**: Detailed schemas for all request/response models
- **Example Data**: Real JSON examples for all API operations

### OpenAPI Specification
The API is also documented using OpenAPI 3.0 specification in `schemas/api-schema.yaml` for automated testing. The documentation includes:

- **Complete endpoint specifications** with all HTTP methods
- **Request/response schemas** with validation rules  
- **Authentication requirements** automatically detected by tests
- **Error response formats** for all status codes
- **Example requests and responses** for all scenarios
- **Simulation parameters** for error testing (simulate=404, simulate=500, etc.)

The Swagger UI serves as the **primary documentation interface** for developers, while the OpenAPI schema serves as the **single source of truth** for automated test generation.

## Development

### Adding New Endpoints

1. Define the model in `models/user.go` with Swagger annotations
2. Create handler functions in `controllers/` with comprehensive Swagger comments
3. Add routes in `routes/routes.go`
4. Generate updated Swagger docs with `swag init`
5. Update the OpenAPI schema in `schemas/api-schema.yaml` for testing
6. Add test hooks in `tests/dredd-hooks.js`

### Database Migrations

The application automatically creates tables using GORM auto-migration with PostgreSQL. To add new fields:

1. Update the model struct in `models/user.go`
2. Restart the application to trigger auto-migration
3. Database changes are automatically applied to PostgreSQL

### Test Data

Test data is **automatically generated and managed** by the generic testing framework:
- **Dynamic user creation** with unique emails for each test
- **Automatic product and category seeding** 
- **Smart order generation** with proper user relationships
- **Conflict simulation** for duplicate data testing
- **No manual test data required**

## 🌟 Generic Testing Framework

This project implements a **revolutionary generic testing framework** that can be adapted to test **any REST API**. Here's what makes it special:

### Universal Features
- 📋 **Schema-Driven**: Automatically generates tests from OpenAPI specification
- 🔐 **Auth Auto-Detection**: Identifies protected endpoints automatically
- 🎯 **Zero Manual Data**: Dynamic test data generation for all scenarios
- ⚡ **Error Simulation**: Built-in support for testing error scenarios
- 🔄 **Framework Agnostic**: Works with any backend technology
- 🛠️ **Plug & Play**: Just provide schema and endpoint URL

### How to Adapt for Your API

1. **Replace the OpenAPI schema** in `schemas/api-schema.yaml`
2. **Update API endpoint** in `dredd.yml` server configuration
3. **Run tests** - everything else is automatic!

### Framework Benefits
- **Reduces testing time** from days to minutes
- **Eliminates manual test maintenance**
- **Ensures 100% API coverage**
- **Catches edge cases automatically**
- **Provides consistent testing across projects**

## Testing Status

**🎉 PERFECT TEST COVERAGE: 25/25 tests passing (100%)**

### Test Results ✅
```
complete: 25 passing, 0 failing, 0 errors, 0 skipped, 25 total
```

### All Scenarios Covered ✅
- **Authentication Flow**: Registration, login with all error cases
- **Protected Endpoints**: All secured resources with token validation  
- **Public Endpoints**: Products and categories retrieval
- **Profile Management**: Get/update user profile with validation
- **Order Management**: Complete CRUD operations
- **Error Simulation**: 404, 500, 400 scenarios using API simulation
- **Authorization Testing**: Valid/invalid token scenarios

### Recent Achievements ✅
- **Zero manual test data** - Fully automated test generation
- **Schema-driven testing** - Tests auto-generated from OpenAPI spec
- **Generic framework** - Reusable for any REST API
- **Perfect automation** - No skipped tests, 100% coverage
- **Error simulation** - Built-in API simulation parameters
- **Authentication auto-detection** - Dynamic JWT token management

### Framework Highlights �
- **Language Agnostic**: Works with any backend (Go, Node.js, Python, Java, etc.)
- **Database Independent**: PostgreSQL, SQLite, MySQL, MongoDB, etc.
- **Zero Configuration**: Just provide OpenAPI schema and run
- **Production Ready**: Comprehensive error handling and edge cases

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**Hakan Çetinkaya**
- GitHub: [@itu-itis22-cetinkayah20](https://github.com/itu-itis22-cetinkayah20)
- Email: cetinkayah20@itu.edu.tr

## Acknowledgments

- [Fiber](https://gofiber.io/) - Express inspired web framework for Go
- [GORM](https://gorm.io/) - The fantastic ORM library for Golang
- [Dredd](https://dredd.org/) - HTTP API Testing Framework
- [PostgreSQL](https://www.postgresql.org/) - The World's Most Advanced Open Source Relational Database
# Go Fiber API

A RESTful API built with Go Fiber framework featuring JWT authentication, PostgreSQL database integration, and comprehensive API testing with Dredd.

## Features

- 🚀 **High Performance**: Built with Go Fiber v2.30.0 for fast HTTP performance
- 🔐 **JWT Authentication**: Secure user authentication and authorization
- 🗄️ **PostgreSQL Database**: GORM ORM with PostgreSQL for data persistence
- 📝 **API Documentation**: OpenAPI 3.0 specification
- 🧪 **API Testing**: Comprehensive testing with Dredd framework
- 🛡️ **Middleware**: CORS, authentication, and error handling
- 📊 **Data Seeding**: Automatic test data seeding for development

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

- **Backend**: Go 1.21+
- **Framework**: Fiber v2.30.0
- **Database**: PostgreSQL
- **ORM**: GORM v1.24.1
- **Authentication**: JWT (golang-jwt/jwt)
- **Password Hashing**: bcrypt
- **API Testing**: Dredd 14.1.0
- **Documentation**: OpenAPI 3.0

## Prerequisites

- Go 1.21 or higher
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

3. **Install Node.js dependencies for testing**
   ```bash
   npm install -g dredd
   ```

4. **Set up PostgreSQL database**
   - Create a PostgreSQL database
   - Update database configuration in `config/database.go`

5. **Build the application**
   ```bash
   go build -o go-fiber-api.exe
   ```

## Configuration

### Database Configuration
Update the database connection settings in `config/database.go`:

```go
dsn := "host=localhost user=yourusername password=yourpassword dbname=yourdbname port=5432 sslmode=disable"
```

### Environment Variables
The application uses the following environment variables:
- `JWT_SECRET` - JWT signing secret (defaults to a fallback secret)
- `DB_HOST` - Database host
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name
- `DB_PORT` - Database port

## Running the Application

1. **Start the server**
   ```bash
   ./go-fiber-api.exe
   ```
   
   The server will start on `http://localhost:3000`

2. **Verify the server is running**
   ```bash
   curl http://localhost:3000/api/categories
   ```

## API Testing

The project includes comprehensive API testing using Dredd framework.

### Running Tests

1. **Start the server** (in one terminal)
   ```bash
   ./go-fiber-api.exe
   ```

2. **Run Dredd tests** (in another terminal)
   ```bash
   dredd
   ```
3. **Alternative to run tests**
```bash
  go test -v ./tests/ -timeout 120s
   ```
### Test Configuration

- **API Schema**: `schemas/api-schema.yaml`
- **Dredd Config**: `dredd.yml`
- **Test Hooks**: `tests/dredd-hooks.js`

### Test Coverage

The test suite covers:
- ✅ User registration (success, validation errors, conflicts)
- ✅ User authentication (success, invalid credentials)
- ✅ Protected endpoints with JWT authorization
- ✅ Product and category retrieval
- ✅ User profile management
- ✅ Order creation and management
- ✅ Error simulation for testing edge cases

## Project Structure

```
go-fiber-api/
├── config/
│   ├── database.go       # Database configuration and connection
│   └── seed.go          # Test data seeding
├── controllers/
│   ├── api.go           # API endpoint handlers
│   └── auth.go          # Authentication handlers
├── middleware/
│   └── auth.go          # JWT authentication middleware
├── models/
│   └── user.go          # Database models (User, Product, Category, Order)
├── routes/
│   └── routes.go        # Route definitions
├── schemas/
│   └── api-schema.yaml  # OpenAPI 3.0 specification
├── tests/
│   ├── dredd-hooks.js   # Dredd test hooks
│   └── dredd_test.go    # Go test file
├── dredd.yml            # Dredd configuration
├── go.mod               # Go module dependencies
├── go.sum               # Go module checksums
├── main.go              # Application entry point
├── Makefile             # Build automation
└── README.md            # This file
```

## API Documentation

The API is documented using OpenAPI 3.0 specification in `schemas/api-schema.yaml`. The documentation includes:

- Complete endpoint specifications
- Request/response schemas
- Authentication requirements
- Error response formats
- Example requests and responses

## Development

### Adding New Endpoints

1. Define the model in `models/user.go`
2. Create handler functions in `controllers/`
3. Add routes in `routes/routes.go`
4. Update the OpenAPI schema in `schemas/api-schema.yaml`
5. Add test hooks in `tests/dredd-hooks.js`

### Database Migrations

The application automatically creates tables using GORM auto-migration. To add new fields:

1. Update the model struct in `models/user.go`
2. Restart the application to trigger auto-migration

### Test Data

Test data is automatically seeded when the application starts. The seeding includes:
- Test categories (Electronics, Books, Clothing)
- Test products (Test Laptop, Test Phone)
- Test user (dredd.test@example.com)
- Test orders for API testing

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Testing Status

Current test status: **20/25 tests passing** (Major improvement from initial 9/25!)

### Passing Tests ✅
- User registration (all scenarios)
- User authentication
- Protected endpoint authorization
- Product and category retrieval
- User profile management
- Order creation and management
- Error handling for unauthorized access

### Recent Fixes ✅
- Fixed JSON parsing issues with separate RegisterRequest/LoginRequest structs
- Resolved authentication token flow
- Fixed test user password synchronization
- Improved simulate parameter handling
- Enhanced order management testing

### Known Issues 🔧
- Some simulate parameters for error testing
- Edge cases with non-existent resource IDs

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
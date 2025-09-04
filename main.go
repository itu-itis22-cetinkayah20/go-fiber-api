package main

import (
	"go-fiber-api/config"
	"go-fiber-api/routes"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	fiberSwagger "github.com/swaggo/fiber-swagger"

	_ "go-fiber-api/docs" // Generated swagger docs
)

// @title           Go Fiber API
// @version         1.0
// @description     A high-performance RESTful API built with Go Fiber framework featuring JWT authentication and automated testing
// @termsOfService  http://swagger.io/terms/

// @contact.name   Hakan Çetinkaya
// @contact.url    https://github.com/itu-itis22-cetinkayah20
// @contact.email  cetinkayah20@itu.edu.tr

// @license.name  MIT
// @license.url   https://opensource.org/licenses/MIT

// @host      localhost:3000
// @BasePath  /

// @securityDefinitions.apikey Bearer
// @in header
// @name Authorization
// @description Type "Bearer" followed by a space and JWT token.

func main() {
	app := fiber.New()

	// Enable CORS
	app.Use(cors.New())

	config.ConnectDatabase()

	// Seed test data for API testing
	config.SeedTestData()

	// Setup API routes
	routes.SetupRoutes(app)

	// Swagger endpoint
	app.Get("/swagger/*", fiberSwagger.WrapHandler)

	app.Listen(":3000")
}

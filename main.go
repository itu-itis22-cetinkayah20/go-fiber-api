package main

import (
	"go-fiber-api/config"
	"go-fiber-api/routes"

	"github.com/gofiber/fiber/v2"
)

func main() {
	app := fiber.New()

	config.ConnectDatabase()

	// Seed test data for API testing
	config.SeedTestData()

	routes.SetupRoutes(app)

	app.Listen(":3000")
}

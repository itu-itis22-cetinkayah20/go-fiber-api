package routes

import (
	"go-fiber-api/controllers"
	"go-fiber-api/middleware"

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App) {
	// Public endpoints (no authentication required)
	app.Get("/api/products", controllers.GetProducts)     // 1. List all products
	app.Get("/api/products/:id", controllers.GetProduct)  // 2. Get product by ID
	app.Get("/api/categories", controllers.GetCategories) // 3. List categories
	app.Post("/auth/register", controllers.Register)      // 4. User registration
	app.Post("/auth/login", controllers.Login)            // 5. User login

	// Protected endpoints (authentication required)
	protected := app.Group("/api", middleware.AuthMiddleware())
	protected.Get("/profile", controllers.GetProfile)        // 6. Get user profile
	protected.Put("/profile", controllers.UpdateProfile)     // 7. Update user profile
	protected.Post("/orders", controllers.CreateOrder)       // 8. Create new order
	protected.Get("/orders", controllers.GetOrders)          // 9. Get user's orders
	protected.Delete("/orders/:id", controllers.DeleteOrder) // 10. Cancel order
}

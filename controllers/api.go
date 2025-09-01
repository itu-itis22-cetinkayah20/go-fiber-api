package controllers

import (
	"go-fiber-api/config"
	"go-fiber-api/models"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

// GetProducts - Public endpoint to get all products
func GetProducts(c *fiber.Ctx) error {
	// Support simulating server error for testing
	if c.Query("simulate") == "500" {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Simulated server error for testing",
		})
	}

	var products []models.Product
	if err := config.DB.Preload("Category").Find(&products).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch products",
		})
	}
	return c.JSON(products)
}

// GetProduct - Public endpoint to get product by ID
func GetProduct(c *fiber.Ctx) error {
	id := c.Params("id")

	// Convert id to integer to check if it's valid
	productID, err := strconv.Atoi(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid product ID",
		})
	}

	var product models.Product
	if err := config.DB.Preload("Category").Where("id = ?", productID).First(&product).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Product not found",
		})
	}
	return c.JSON(product)
} // GetCategories - Public endpoint to get all categories
func GetCategories(c *fiber.Ctx) error {
	var categories []models.Category
	if err := config.DB.Find(&categories).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch categories",
		})
	}
	return c.JSON(categories)
}

// GetProfile - Protected endpoint to get user profile
func GetProfile(c *fiber.Ctx) error {
	// Support simulating 404 error for testing
	if c.Query("simulate") == "404" {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "User profile not found for testing",
		})
	}

	userID := c.Locals("userID").(uint)
	var user models.User

	if err := config.DB.First(&user, userID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "User not found",
		})
	}
	return c.JSON(user)
}

// UpdateProfile - Protected endpoint to update user profile
func UpdateProfile(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uint)
	var user models.User

	if err := config.DB.First(&user, userID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "User not found",
		})
	}

	var updateData models.User
	if err := c.BodyParser(&updateData); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid input",
		})
	}

	// Validate required fields for 400 error test
	if updateData.FirstName == "" || updateData.LastName == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "First name and last name are required",
		})
	}

	user.FirstName = updateData.FirstName
	user.LastName = updateData.LastName

	if err := config.DB.Save(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update profile",
		})
	}

	return c.JSON(user)
}

// CreateOrder - Protected endpoint to create new order
func CreateOrder(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uint)
	var order models.Order

	if err := c.BodyParser(&order); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid input",
		})
	}

	// Validate order total (should be positive)
	if order.Total <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Order total must be greater than 0",
		})
	}

	order.UserID = userID
	order.Status = "pending"

	if err := config.DB.Create(&order).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create order",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(order)
}

// GetOrders - Protected endpoint to get user's orders
func GetOrders(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uint)
	var orders []models.Order

	if err := config.DB.Where("user_id = ?", userID).Find(&orders).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch orders",
		})
	}

	return c.JSON(orders)
}

// DeleteOrder - Protected endpoint to cancel order
func DeleteOrder(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uint)
	orderID := c.Params("id")

	// Support simulating 400 error for testing
	if c.Query("simulate") == "400" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request for testing",
		})
	}

	orderIDInt, err := strconv.Atoi(orderID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid order ID",
		})
	}

	var order models.Order
	if err := config.DB.Where("id = ? AND user_id = ?", orderIDInt, userID).First(&order).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Order not found",
		})
	}

	if err := config.DB.Delete(&order).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to cancel order",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Order cancelled successfully",
	})
}

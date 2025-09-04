package controllers

import (
	"go-fiber-api/config"
	"go-fiber-api/models"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

// GetProducts - Public endpoint to get all products
// @Summary      Get all products
// @Description  Retrieve a list of all products with their categories
// @Tags         Products
// @Accept       json
// @Produce      json
// @Param        simulate query string false "Simulate error (500 for server error)"
// @Success      200  {array}   models.Product "List of products"
// @Failure      500  {object}  models.ErrorResponse      "Internal server error"
// @Router       /api/products [get]
func GetProducts(c *fiber.Ctx) error {
	// Support simulating server error for testing
	if c.Query("simulate") == "500" {
		return c.Status(fiber.StatusInternalServerError).JSON(models.ErrorResponse{
			Error: "Simulated server error for testing",
		})
	}

	var products []models.Product
	if err := config.DB.Preload("Category").Find(&products).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.ErrorResponse{
			Error: "Failed to fetch products",
		})
	}
	return c.JSON(products)
}

// GetProduct - Public endpoint to get product by ID
// @Summary      Get product by ID
// @Description  Retrieve a specific product by its ID
// @Tags         Products
// @Accept       json
// @Produce      json
// @Param        id   path      int  true  "Product ID"
// @Success      200  {object}  models.Product "Product details"
// @Failure      400  {object}  models.ErrorResponse      "Invalid product ID"
// @Failure      404  {object}  models.ErrorResponse      "Product not found"
// @Router       /api/products/{id} [get]
func GetProduct(c *fiber.Ctx) error {
	id := c.Params("id")

	// Convert id to integer to check if it's valid
	productID, err := strconv.Atoi(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{
			Error: "Invalid product ID",
		})
	}

	var product models.Product
	if err := config.DB.Preload("Category").Where("id = ?", productID).First(&product).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(models.ErrorResponse{
			Error: "Product not found",
		})
	}
	return c.JSON(product)
} 

// GetCategories - Public endpoint to get all categories
// @Summary      Get all categories
// @Description  Retrieve a list of all product categories
// @Tags         Categories
// @Accept       json
// @Produce      json
// @Success      200  {array}   models.Category "List of categories"
// @Failure      500  {object}  models.ErrorResponse       "Internal server error"
// @Router       /api/categories [get]
func GetCategories(c *fiber.Ctx) error {
	var categories []models.Category
	if err := config.DB.Find(&categories).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.ErrorResponse{
			Error: "Failed to fetch categories",
		})
	}
	return c.JSON(categories)
}

// GetProfile - Protected endpoint to get user profile
// @Summary      Get user profile
// @Description  Retrieve the authenticated user's profile information
// @Tags         Profile
// @Accept       json
// @Produce      json
// @Param        simulate query string false "Simulate error (404 for not found)"
// @Success      200  {object}  models.User "User profile"
// @Failure      401  {object}  models.ErrorResponse   "Unauthorized"
// @Failure      404  {object}  models.ErrorResponse   "User not found"
// @Security     Bearer
// @Router       /api/profile [get]
func GetProfile(c *fiber.Ctx) error {
	// Support simulating 404 error for testing
	if c.Query("simulate") == "404" {
		return c.Status(fiber.StatusNotFound).JSON(models.ErrorResponse{
			Error: "User profile not found for testing",
		})
	}

	userID := c.Locals("userID").(uint)
	var user models.User

	if err := config.DB.First(&user, userID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(models.ErrorResponse{
			Error: "User not found",
		})
	}
	return c.JSON(user)
}

// UpdateProfile - Protected endpoint to update user profile
// @Summary      Update user profile
// @Description  Update the authenticated user's profile information
// @Tags         Profile
// @Accept       json
// @Produce      json
// @Param        request body models.User true "Updated profile data"
// @Success      200  {object}  models.User "Updated user profile"
// @Failure      400  {object}  models.ErrorResponse   "Invalid input"
// @Failure      401  {object}  models.ErrorResponse   "Unauthorized"
// @Failure      404  {object}  models.ErrorResponse   "User not found"
// @Failure      500  {object}  models.ErrorResponse   "Internal server error"
// @Security     Bearer
// @Router       /api/profile [put]
func UpdateProfile(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uint)
	var user models.User

	if err := config.DB.First(&user, userID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(models.ErrorResponse{
			Error: "User not found",
		})
	}

	var updateData models.User
	if err := c.BodyParser(&updateData); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{
			Error: "Invalid input",
		})
	}

	// Validate required fields for 400 error test
	if updateData.FirstName == "" || updateData.LastName == "" {
		return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{
			Error: "First name and last name are required",
		})
	}

	user.FirstName = updateData.FirstName
	user.LastName = updateData.LastName

	if err := config.DB.Save(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.ErrorResponse{
			Error: "Failed to update profile",
		})
	}

	return c.JSON(user)
}

// CreateOrder - Protected endpoint to create new order
// @Summary      Create new order
// @Description  Create a new order for the authenticated user
// @Tags         Orders
// @Accept       json
// @Produce      json
// @Param        request body models.Order true "Order data"
// @Success      201  {object}  models.Order "Created order"
// @Failure      400  {object}  models.ErrorResponse    "Invalid input"
// @Failure      401  {object}  models.ErrorResponse    "Unauthorized"
// @Failure      500  {object}  models.ErrorResponse    "Internal server error"
// @Security     Bearer
// @Router       /api/orders [post]
func CreateOrder(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uint)
	var order models.Order

	if err := c.BodyParser(&order); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{
			Error: "Invalid input",
		})
	}

	// Validate order total (should be positive)
	if order.Total <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{
			Error: "Order total must be greater than 0",
		})
	}

	order.UserID = userID
	order.Status = "pending"

	if err := config.DB.Create(&order).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.ErrorResponse{
			Error: "Failed to create order",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(order)
}

// GetOrders - Protected endpoint to get user's orders
// @Summary      Get user orders
// @Description  Retrieve all orders for the authenticated user
// @Tags         Orders
// @Accept       json
// @Produce      json
// @Success      200  {array}   models.Order "List of user orders"
// @Failure      401  {object}  models.ErrorResponse    "Unauthorized"
// @Failure      500  {object}  models.ErrorResponse    "Internal server error"
// @Security     Bearer
// @Router       /api/orders [get]
func GetOrders(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uint)
	var orders []models.Order

	if err := config.DB.Where("user_id = ?", userID).Find(&orders).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.ErrorResponse{
			Error: "Failed to fetch orders",
		})
	}

	return c.JSON(orders)
}

// DeleteOrder - Protected endpoint to cancel order
// @Summary      Cancel order
// @Description  Cancel/delete a specific order for the authenticated user
// @Tags         Orders
// @Accept       json
// @Produce      json
// @Param        id       path      int     true  "Order ID"
// @Param        simulate query     string  false "Simulate error (400 for bad request)"
// @Success      200  {object}  models.ErrorResponse "Order cancelled successfully"
// @Failure      400  {object}  models.ErrorResponse "Invalid order ID"
// @Failure      401  {object}  models.ErrorResponse "Unauthorized"
// @Failure      404  {object}  models.ErrorResponse "Order not found"
// @Failure      500  {object}  models.ErrorResponse "Internal server error"
// @Security     Bearer
// @Router       /api/orders/{id} [delete]
func DeleteOrder(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uint)
	orderID := c.Params("id")

	// Support simulating 400 error for testing
	if c.Query("simulate") == "400" {
		return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{
			Error: "Invalid request for testing",
		})
	}

	orderIDInt, err := strconv.Atoi(orderID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{
			Error: "Invalid order ID",
		})
	}

	var order models.Order
	if err := config.DB.Where("id = ? AND user_id = ?", orderIDInt, userID).First(&order).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(models.ErrorResponse{
			Error: "Order not found",
		})
	}

	if err := config.DB.Delete(&order).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.ErrorResponse{
			Error: "Failed to cancel order",
		})
	}

	return c.JSON(models.MessageResponse{
		Message: "Order cancelled successfully",
	})
}


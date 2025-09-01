package config

import (
	"go-fiber-api/models"
	"log"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func SeedTestData() {
	db := DB

	// Create test categories
	categories := []models.Category{
		{Name: "Electronics"},
		{Name: "Books"},
		{Name: "Clothing"},
	}

	for _, category := range categories {
		var existingCategory models.Category
		result := db.Where("name = ?", category.Name).First(&existingCategory)
		if result.Error == gorm.ErrRecordNotFound {
			db.Create(&category)
		}
	}

	// Create test products
	var electronics models.Category
	db.Where("name = ?", "Electronics").First(&electronics)

	products := []models.Product{
		{
			Name:        "Test Laptop",
			Description: "A test laptop for API testing",
			Price:       999.99,
			Stock:       10,
			CategoryID:  electronics.ID,
		},
		{
			Name:        "Test Phone",
			Description: "A test phone for API testing",
			Price:       699.99,
			Stock:       25,
			CategoryID:  electronics.ID,
		},
	}

	for _, product := range products {
		var existingProduct models.Product
		result := db.Where("name = ?", product.Name).First(&existingProduct)
		if result.Error == gorm.ErrRecordNotFound {
			db.Create(&product)
		}
	}

	// Create test user for authentication testing - ensure fresh password
	var testUser models.User
	// Check for both active and soft-deleted users
	result := db.Unscoped().Where("email = ?", "dredd.test@example.com").First(&testUser)
	if result.Error == gorm.ErrRecordNotFound {
		// Create new test user
		testUser = models.User{
			Email:     "dredd.test@example.com",
			FirstName: "Test",
			LastName:  "User",
			Role:      "user",
		}

		// Use bcrypt to hash the password like in auth controller
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte("testpassword123"), bcrypt.DefaultCost)
		if err != nil {
			log.Printf("Failed to hash test user password: %v", err)
			return
		}
		testUser.Password = string(hashedPassword)

		if err := db.Create(&testUser).Error; err != nil {
			log.Printf("Failed to create test user: %v", err)
		} else {
			log.Printf("Test user created successfully with ID: %d", testUser.ID)
		}
	} else {
		// Update existing user's password and restore if soft-deleted
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte("testpassword123"), bcrypt.DefaultCost)
		if err != nil {
			log.Printf("Failed to hash test user password: %v", err)
			return
		}
		testUser.Password = string(hashedPassword)
		testUser.DeletedAt = gorm.DeletedAt{} // Restore if soft-deleted

		if err := db.Unscoped().Save(&testUser).Error; err != nil {
			log.Printf("Failed to update test user password: %v", err)
		} else {
			log.Printf("Test user password updated successfully for ID: %d", testUser.ID)
		}
	}

	// Create test orders for the test user
	testOrders := []models.Order{
		{
			UserID: testUser.ID,
			Total:  99.99,
			Status: "pending",
		},
		{
			UserID: testUser.ID,
			Total:  149.99,
			Status: "pending",
		},
	}

	for _, order := range testOrders {
		var existingOrder models.Order
		result := db.Where("user_id = ? AND total = ?", order.UserID, order.Total).First(&existingOrder)
		if result.Error == gorm.ErrRecordNotFound {
			if err := db.Create(&order).Error; err != nil {
				log.Printf("Failed to create test order: %v", err)
			} else {
				log.Printf("Test order created with ID: %d", order.ID)
			}
		}
	}

	log.Println("Test data seeded successfully")
}

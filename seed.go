package main

import (
	"go-fiber-api/config"
	"go-fiber-api/models"
	"log"

	"gorm.io/gorm"
)

func SeedTestData() {
	db := config.DB

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

	log.Println("Test data seeded successfully")
}

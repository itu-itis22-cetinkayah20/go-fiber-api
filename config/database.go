package config

import (
	"go-fiber-api/models"
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDatabase() {
	var err error

	// Default connection string for local development
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "host=localhost user=postgres password=1234 dbname=ecommerce_api port=5432 sslmode=disable"
	}

	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database: ", err)
	}

	// Auto migrate the schema
	err = DB.AutoMigrate(&models.User{}, &models.Product{}, &models.Category{}, &models.Order{})
	if err != nil {
		log.Fatal("Failed to migrate database: ", err)
	}

	log.Println("Database connected successfully")
}

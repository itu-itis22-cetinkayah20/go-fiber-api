package models

import (
	"time"

	"gorm.io/gorm"
)

// User represents a user in the system
// @Description User account information
type User struct {
	ID        uint           `json:"id" gorm:"primaryKey" example:"1"`
	Email     string         `json:"email" gorm:"unique;not null" example:"user@example.com"`
	Password  string         `json:"-" gorm:"not null"`
	FirstName string         `json:"first_name" example:"John"`
	LastName  string         `json:"last_name" example:"Doe"`
	Role      string         `json:"role" gorm:"default:user" example:"user"`
	CreatedAt time.Time      `json:"created_at" example:"2023-01-01T00:00:00Z"`
	UpdatedAt time.Time      `json:"updated_at" example:"2023-01-01T00:00:00Z"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
	Orders    []Order        `json:"orders,omitempty" gorm:"foreignKey:UserID"`
}

// Product represents a product in the system
// @Description Product information
type Product struct {
	ID          uint           `json:"id" gorm:"primaryKey" example:"1"`
	Name        string         `json:"name" gorm:"not null" example:"Laptop"`
	Description string         `json:"description" example:"High-performance laptop"`
	Price       float64        `json:"price" gorm:"not null" example:"999.99"`
	Stock       int            `json:"stock" gorm:"default:0" example:"10"`
	CategoryID  uint           `json:"category_id" example:"1"`
	Category    Category       `json:"category,omitempty" gorm:"foreignKey:CategoryID"`
	CreatedAt   time.Time      `json:"created_at" example:"2023-01-01T00:00:00Z"`
	UpdatedAt   time.Time      `json:"updated_at" example:"2023-01-01T00:00:00Z"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

// Category represents a product category
// @Description Product category information
type Category struct {
	ID        uint           `json:"id" gorm:"primaryKey" example:"1"`
	Name      string         `json:"name" gorm:"unique;not null" example:"Electronics"`
	CreatedAt time.Time      `json:"created_at" example:"2023-01-01T00:00:00Z"`
	UpdatedAt time.Time      `json:"updated_at" example:"2023-01-01T00:00:00Z"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
	Products  []Product      `json:"products,omitempty" gorm:"foreignKey:CategoryID"`
}

// Order represents a user order
// @Description Order information
type Order struct {
	ID        uint           `json:"id" gorm:"primaryKey" example:"1"`
	UserID    uint           `json:"user_id" gorm:"not null" example:"1"`
	User      User           `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Total     float64        `json:"total" gorm:"not null" example:"99.99"`
	Status    string         `json:"status" gorm:"default:pending" example:"pending"`
	CreatedAt time.Time      `json:"created_at" example:"2023-01-01T00:00:00Z"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

// LoginRequest represents login request payload
type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

// RegisterRequest represents registration request payload
type RegisterRequest struct {
	Email     string `json:"email" validate:"required,email"`
	Password  string `json:"password" validate:"required,min=6"`
	FirstName string `json:"first_name" validate:"required"`
	LastName  string `json:"last_name" validate:"required"`
}

func (u *User) CreateUser(db *gorm.DB) error {
	return db.Create(u).Error
}

func GetUserByID(db *gorm.DB, id uint) (*User, error) {
	var user User
	err := db.First(&user, id).Error
	return &user, err
}

func GetUserByUsername(db *gorm.DB, username string) (*User, error) {
	var user User
	err := db.Where("username = ?", username).First(&user).Error
	return &user, err
}

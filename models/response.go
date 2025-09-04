package models

// ErrorResponse represents a standard error response
// @Description Standard error response format
type ErrorResponse struct {
	Error string `json:"error" example:"Error message"`
}

// MessageResponse represents a standard success message response
// @Description Standard success message response format
type MessageResponse struct {
	Message string `json:"message" example:"Success message"`
}

// TokenResponse represents a login response with JWT token
// @Description Login response with JWT token
type TokenResponse struct {
	Token string `json:"token" example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`
}

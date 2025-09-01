# Go Fiber E-Commerce API Makefile

.PHONY: build run test clean tidy install-dredd test-dredd setup-dredd test-go-dredd

# Build the application
build:
	go build -o bin/api main.go

# Run the application
run:
	go run main.go

# Run Go tests
test:
	go test ./...

# Run custom API tests
test-api:
	cd tests && go run dredd_test.go

# Clean build artifacts
clean:
	rm -rf bin/
	rm -f tests/dredd-hooks.js

# Tidy up dependencies
tidy:
	go mod tidy

# Install Dredd globally (requires npm)
install-dredd:
	npm install -g dredd

# Setup Dredd dependencies
setup-dredd:
	npm install

# Run Dredd tests standalone (make sure server is running first)
test-dredd:
	dredd

# Run comprehensive Go-integrated Dredd tests
test-go-dredd:
	cd tests && go test -v -run TestDredd

# Run all Dredd tests (discovery + validation)
test-dredd-all:
	cd tests && go test -v

# Setup development environment
setup: tidy
	@echo "Creating .env file from .env.example..."
	@if not exist .env copy .env.example .env
	@echo "Please update .env with your database credentials"
	@echo "Run 'make run' to start the server"

# Build and run
dev: build run

# Full test suite (includes Dredd tests with integrated server)
test-all: test test-dredd-all

# Help
help:
	@echo "Available commands:"
	@echo "  build           - Build the application"
	@echo "  run             - Run the application" 
	@echo "  test            - Run Go tests"
	@echo "  test-api        - Run custom API tests"
	@echo "  test-dredd      - Run Dredd tests (server must be running)"
	@echo "  test-go-dredd   - Run Go-integrated Dredd tests"
	@echo "  test-dredd-all  - Run all Dredd tests with discovery"
	@echo "  test-all        - Run all tests"
	@echo "  setup-dredd     - Setup Dredd dependencies"
	@echo "  install-dredd   - Install Dredd globally"
	@echo "  clean           - Clean build artifacts"
	@echo "  tidy            - Tidy up dependencies"
	@echo "  setup           - Setup development environment"
	@echo "  dev             - Build and run"
	@echo "  help            - Show this help"

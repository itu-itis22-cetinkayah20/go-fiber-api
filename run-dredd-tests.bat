@echo off
echo Starting Go Fiber API Dredd Tests...
echo.

echo Step 1: Installing Node.js dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Failed to install npm dependencies
    exit /b 1
)

echo.
echo Step 2: Updating Go dependencies...
go mod tidy
if %errorlevel% neq 0 (
    echo Failed to update Go dependencies
    exit /b 1
)

echo.
echo Step 3: Running comprehensive Dredd tests...
cd tests
go test -v
if %errorlevel% neq 0 (
    echo Dredd tests failed
    exit /b 1
)

echo.
echo ✅ All Dredd tests completed successfully!
echo.
echo To run tests individually:
echo   make test-dredd-all     - Run all Dredd tests
echo   make test-go-dredd      - Run main Dredd validation
echo   go test -v -run TestEndpointDiscovery - Test endpoint discovery
echo.

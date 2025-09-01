#!/bin/bash

echo "Starting Go Fiber API Dredd Tests..."
echo

echo "Step 1: Installing Node.js dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "Failed to install npm dependencies"
    exit 1
fi

echo
echo "Step 2: Updating Go dependencies..."
go mod tidy
if [ $? -ne 0 ]; then
    echo "Failed to update Go dependencies"
    exit 1
fi

echo
echo "Step 3: Running comprehensive Dredd tests..."
cd tests
go test -v
if [ $? -ne 0 ]; then
    echo "Dredd tests failed"
    exit 1
fi

echo
echo "✅ All Dredd tests completed successfully!"
echo
echo "To run tests individually:"
echo "  make test-dredd-all     - Run all Dredd tests"
echo "  make test-go-dredd      - Run main Dredd validation"
echo "  go test -v -run TestEndpointDiscovery - Test endpoint discovery"
echo

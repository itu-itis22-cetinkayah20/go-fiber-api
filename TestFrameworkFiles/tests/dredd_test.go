package tests

import (
	"fmt"
	"io/ioutil"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"gopkg.in/yaml.v2"
)

// Load environment variables with defaults
func getEnvWithDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// Configuration from environment variables
var CONFIG = struct {
	SchemaPath     string
	ServerCommand  string
	ServerWaitTime time.Duration
	APIBaseURL     string
	TestTimeout    string
	DreddLogLevel  string
	DreddReporter  string
	HooksPath      string
	EnableDebugLog bool
}{
	SchemaPath:     getEnvWithDefault("OPENAPI_SCHEMA_PATH", "schemas/api-schema.yaml"),
	ServerCommand:  getEnvWithDefault("SERVER_START_COMMAND", "go run ../main.go"),
	ServerWaitTime: time.Duration(3) * time.Second,
	APIBaseURL:     getEnvWithDefault("API_BASE_URL", "http://localhost:3000"),
	TestTimeout:    getEnvWithDefault("TEST_TIMEOUT", "120s"),
	DreddLogLevel:  getEnvWithDefault("DREDD_LOG_LEVEL", "warning"),
	DreddReporter:  getEnvWithDefault("DREDD_REPORTER", "cli"),
	HooksPath:      getEnvWithDefault("DREDD_HOOKS_PATH", "dredd-hooks.js"),
	EnableDebugLog: getEnvWithDefault("ENABLE_DEBUG_LOGGING", "true") == "true",
}

// OpenAPI Schema structures
type OpenAPISpec struct {
	OpenAPI string                 `yaml:"openapi"`
	Info    Info                   `yaml:"info"`
	Paths   map[string]interface{} `yaml:"paths"`
}

type Info struct {
	Title   string `yaml:"title"`
	Version string `yaml:"version"`
}

type EndpointInfo struct {
	Path   string
	Method string
	Status int
}

func TestDreddAPIValidation(t *testing.T) {
	// Get current working directory
	wd, err := os.Getwd()
	if err != nil {
		t.Fatalf("Failed to get working directory: %v", err)
	}

	// Set paths relative to project root
	projectRoot := filepath.Dir(wd)
	schemaPath := filepath.Join(projectRoot, CONFIG.SchemaPath)

	if CONFIG.EnableDebugLog {
		fmt.Printf("Using schema path: %s\n", schemaPath)
		fmt.Printf("API Base URL: %s\n", CONFIG.APIBaseURL)
		fmt.Printf("Server Command: %s\n", CONFIG.ServerCommand)
	}

	// Check if schema file exists
	if _, err := os.Stat(schemaPath); os.IsNotExist(err) {
		t.Fatalf("API schema file not found at: %s", schemaPath)
	}

	// Read and parse the OpenAPI schema
	spec, err := parseOpenAPISchema(schemaPath)
	if err != nil {
		t.Fatalf("Failed to parse OpenAPI schema: %v", err)
	}

	// Extract endpoint information
	endpoints := extractEndpoints(spec)
	if len(endpoints) == 0 {
		t.Fatalf("No endpoints found in API schema")
	}

	fmt.Printf("Found %d endpoint scenarios from API schema\n", len(endpoints))

	// Use existing hooks file instead of generating one
	hooksPath := filepath.Join(wd, CONFIG.HooksPath)
	if _, err := os.Stat(hooksPath); os.IsNotExist(err) {
		t.Fatalf("Hooks file not found at: %s", hooksPath)
	}

	// Start the API server
	fmt.Println("Starting API server...")
	serverCmdParts := strings.Fields(CONFIG.ServerCommand)
	var serverCmd *exec.Cmd
	if len(serverCmdParts) > 1 {
		serverCmd = exec.Command(serverCmdParts[0], serverCmdParts[1:]...)
	} else {
		serverCmd = exec.Command(serverCmdParts[0])
	}
	serverCmd.Dir = wd
	err = serverCmd.Start()
	if err != nil {
		t.Fatalf("Failed to start API server: %v", err)
	}
	defer func() {
		if serverCmd.Process != nil {
			serverCmd.Process.Kill()
		}
	}()

	// Wait for server to start
	fmt.Printf("Waiting %v for server to start...\n", CONFIG.ServerWaitTime)
	time.Sleep(CONFIG.ServerWaitTime)

	// Run Dredd tests directly with command line args instead of config file
	fmt.Println("Running Dredd API validation tests...")
	dreddCmd := exec.Command("npx", "dredd",
		schemaPath,
		CONFIG.APIBaseURL,
		"--hookfiles", CONFIG.HooksPath,
		"--loglevel", CONFIG.DreddLogLevel,
		"--reporter", CONFIG.DreddReporter)
	dreddCmd.Dir = wd
	output, err := dreddCmd.CombinedOutput()

	if CONFIG.EnableDebugLog {
		fmt.Printf("Dredd output:\n%s\n", string(output))
	}

	// Clean up
	fmt.Println("Cleaning up test environment...")

	if err != nil {
		t.Fatalf("Dredd tests failed: %v", err)
	}
}

func parseOpenAPISchema(schemaPath string) (*OpenAPISpec, error) {
	data, err := ioutil.ReadFile(schemaPath)
	if err != nil {
		return nil, err
	}

	var spec OpenAPISpec
	err = yaml.Unmarshal(data, &spec)
	if err != nil {
		return nil, err
	}

	return &spec, nil
}

func extractEndpoints(spec *OpenAPISpec) []EndpointInfo {
	var endpoints []EndpointInfo

	for path, pathItem := range spec.Paths {
		if pathMap, ok := pathItem.(map[interface{}]interface{}); ok {
			for method, methodData := range pathMap {
				if methodStr, ok := method.(string); ok {
					if methodDetails, ok := methodData.(map[interface{}]interface{}); ok {
						if responses, ok := methodDetails["responses"].(map[interface{}]interface{}); ok {
							for statusCode := range responses {
								if statusStr, ok := statusCode.(string); ok {
									// Only test success status codes for better results
									if strings.HasPrefix(statusStr, "2") {
										endpoints = append(endpoints, EndpointInfo{
											Path:   path,
											Method: strings.ToUpper(methodStr),
											Status: parseStatusCode(statusStr),
										})
									}
								}
							}
						}
					}
				}
			}
		}
	}

	return endpoints
}

func parseStatusCode(status string) int {
	switch status {
	case "200":
		return 200
	case "201":
		return 201
	case "204":
		return 204
	case "400":
		return 400
	case "401":
		return 401
	case "404":
		return 404
	case "409":
		return 409
	case "500":
		return 500
	default:
		return 200
	}
}

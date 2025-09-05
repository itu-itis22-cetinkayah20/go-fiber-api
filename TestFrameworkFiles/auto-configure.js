#!/usr/bin/env node

/**
 * Auto-Configuration Generator for Generic API Test Framework
 * Analyzes OpenAPI schema and generates optimized .env configuration
 */

const fs = require('fs');
const yaml = require('yaml');
const path = require('path');

class APIAnalyzer {
  constructor(schemaPath) {
    this.schemaPath = schemaPath;
    this.schema = null;
    this.config = {
      authEndpoints: [],
      protectedEndpoints: [],
      authStrategies: [],
      commonFields: {
        email: [],
        password: [],
        token: [],
        id: []
      }
    };
  }

  async analyze() {
    try {
      console.log('🔍 Analyzing OpenAPI schema...');
      
      // Load schema
      const schemaContent = fs.readFileSync(this.schemaPath, 'utf8');
      this.schema = yaml.parse(schemaContent);
      
      // Analyze endpoints
      this.analyzeEndpoints();
      
      // Analyze security schemes
      this.analyzeSecuritySchemes();
      
      // Generate configuration
      this.generateConfiguration();
      
      console.log('✅ Analysis complete!');
      
    } catch (error) {
      console.error('❌ Error analyzing schema:', error.message);
      process.exit(1);
    }
  }

  analyzeEndpoints() {
    if (!this.schema.paths) return;

    Object.entries(this.schema.paths).forEach(([pathKey, pathObject]) => {
      Object.entries(pathObject).forEach(([method, operation]) => {
        const endpoint = `${method.toUpperCase()} ${pathKey}`;
        
        // Detect authentication endpoints
        if (method.toLowerCase() === 'post') {
          const path = pathKey.toLowerCase();
          const summary = (operation.summary || '').toLowerCase();
          
          if (this.isAuthEndpoint(path, summary, 'login')) {
            this.config.authEndpoints.push({
              type: 'login',
              path: pathKey,
              method: method.toUpperCase()
            });
          }
          
          if (this.isAuthEndpoint(path, summary, 'register')) {
            this.config.authEndpoints.push({
              type: 'register', 
              path: pathKey,
              method: method.toUpperCase()
            });
          }
        }

        // Detect protected endpoints
        if (operation.security && operation.security.length > 0) {
          this.config.protectedEndpoints.push(endpoint);
        }

        // Analyze request body fields
        if (operation.requestBody) {
          this.analyzeRequestBody(operation.requestBody);
        }

        // Analyze response fields
        if (operation.responses) {
          this.analyzeResponses(operation.responses);
        }
      });
    });
  }

  isAuthEndpoint(path, summary, type) {
    const patterns = {
      login: ['login', 'signin', 'auth', 'authenticate', 'session'],
      register: ['register', 'signup', 'create', 'account']
    };
    
    return patterns[type].some(pattern => 
      path.includes(pattern) || summary.includes(pattern)
    );
  }

  analyzeSecuritySchemes() {
    if (!this.schema.components || !this.schema.components.securitySchemes) return;

    Object.entries(this.schema.components.securitySchemes).forEach(([name, scheme]) => {
      this.config.authStrategies.push({
        name,
        type: scheme.type,
        scheme: scheme.scheme,
        bearerFormat: scheme.bearerFormat,
        in: scheme.in,
        headerName: scheme.name
      });
    });
  }

  analyzeRequestBody(requestBody) {
    try {
      const content = requestBody.content && requestBody.content['application/json'];
      if (!content || !content.schema || !content.schema.properties) return;

      Object.entries(content.schema.properties).forEach(([fieldName, fieldSchema]) => {
        this.categorizeField(fieldName, fieldSchema);
      });
    } catch (error) {
      // Silent fail for complex schemas
    }
  }

  analyzeResponses(responses) {
    try {
      Object.entries(responses).forEach(([statusCode, response]) => {
        if (statusCode.startsWith('2') && response.content && response.content['application/json']) {
          const schema = response.content['application/json'].schema;
          if (schema && schema.properties) {
            Object.entries(schema.properties).forEach(([fieldName, fieldSchema]) => {
              this.categorizeField(fieldName, fieldSchema);
            });
          }
        }
      });
    } catch (error) {
      // Silent fail for complex schemas
    }
  }

  categorizeField(fieldName, fieldSchema) {
    const name = fieldName.toLowerCase();
    const type = fieldSchema.type;
    const format = fieldSchema.format;

    if (format === 'email' || name.includes('email') || name.includes('mail')) {
      this.config.commonFields.email.push(fieldName);
    }
    
    if (name.includes('password') || name.includes('passwd') || name.includes('pwd')) {
      this.config.commonFields.password.push(fieldName);
    }
    
    if (name.includes('token') || name.includes('jwt') || name.includes('auth')) {
      this.config.commonFields.token.push(fieldName);
    }
    
    if ((name.includes('id') || name === 'id' || name === '_id') && 
        (type === 'number' || type === 'integer' || type === 'string')) {
      this.config.commonFields.id.push(fieldName);
    }
  }

  generateConfiguration() {
    console.log('\n📋 Analysis Results:');
    console.log('===================');
    
    // Auth endpoints
    const loginEndpoint = this.config.authEndpoints.find(ep => ep.type === 'login');
    const registerEndpoint = this.config.authEndpoints.find(ep => ep.type === 'register');
    
    console.log(`🔐 Auth Endpoints Found: ${this.config.authEndpoints.length}`);
    if (loginEndpoint) console.log(`   Login: ${loginEndpoint.path}`);
    if (registerEndpoint) console.log(`   Register: ${registerEndpoint.path}`);
    
    // Protected endpoints
    console.log(`🛡️  Protected Endpoints: ${this.config.protectedEndpoints.length}`);
    
    // Security schemes
    console.log(`🔑 Security Schemes: ${this.config.authStrategies.length}`);
    this.config.authStrategies.forEach(strategy => {
      console.log(`   ${strategy.name}: ${strategy.type} (${strategy.scheme || strategy.in})`);
    });

    // Generate .env recommendations
    this.generateEnvRecommendations();
  }

  generateEnvRecommendations() {
    console.log('\n🎯 Recommended .env Configuration:');
    console.log('===================================');

    const recommendations = [];
    
    // Auth endpoints
    const loginEndpoint = this.config.authEndpoints.find(ep => ep.type === 'login');
    const registerEndpoint = this.config.authEndpoints.find(ep => ep.type === 'register');
    
    if (loginEndpoint) {
      recommendations.push(`AUTH_LOGIN_ENDPOINT=${loginEndpoint.path}`);
    }
    if (registerEndpoint) {
      recommendations.push(`AUTH_REGISTER_ENDPOINT=${registerEndpoint.path}`);
    }

    // Auth strategy
    const primaryAuth = this.config.authStrategies[0];
    if (primaryAuth) {
      if (primaryAuth.type === 'http' && primaryAuth.scheme === 'bearer') {
        recommendations.push('AUTH_TYPE=bearer');
        recommendations.push('AUTH_HEADER_NAME=Authorization');
        recommendations.push('AUTH_TOKEN_PREFIX=Bearer ');
      } else if (primaryAuth.type === 'apiKey') {
        recommendations.push('AUTH_TYPE=apikey');
        recommendations.push(`AUTH_HEADER_NAME=${primaryAuth.headerName || primaryAuth.name}`);
        recommendations.push('AUTH_TOKEN_PREFIX=');
      }
    }

    // Token field detection
    const tokenFields = [...new Set(this.config.commonFields.token)];
    if (tokenFields.length > 0) {
      recommendations.push(`AUTH_TOKEN_FIELD=${tokenFields[0]}`);
      if (tokenFields.length > 1) {
        recommendations.push(`TOKEN_FIELD_PATTERNS=${tokenFields.join(',')}`);
      }
    }

    // Field patterns
    const emailFields = [...new Set(this.config.commonFields.email)];
    const passwordFields = [...new Set(this.config.commonFields.password)]; 
    const idFields = [...new Set(this.config.commonFields.id)];

    if (emailFields.length > 1) {
      recommendations.push(`EMAIL_FIELD_PATTERNS=${emailFields.join(',')}`);
    }
    if (passwordFields.length > 1) {
      recommendations.push(`PASSWORD_FIELD_PATTERNS=${passwordFields.join(',')}`);
    }
    if (idFields.length > 1) {
      recommendations.push(`ID_FIELD_PATTERNS=${idFields.join(',')}`);
    }

    // Auto-discovery recommendations
    recommendations.push('ENABLE_AUTO_DISCOVERY=true');
    recommendations.push('AUTO_DISCOVER_AUTH_ENDPOINTS=true');
    recommendations.push('AUTO_DETECT_TOKEN_FIELDS=true');

    console.log(recommendations.join('\n'));

    // Save to file
    const configPath = path.join(process.cwd(), '.env.generated');
    fs.writeFileSync(configPath, recommendations.join('\n') + '\n');
    console.log(`\n💾 Configuration saved to: ${configPath}`);
    console.log('📝 Copy relevant settings to your .env file');
  }
}

// CLI Usage
async function main() {
  const schemaPath = process.argv[2] || 'schemas/api-schema.yaml';
  
  console.log('🚀 Generic API Test Framework - Auto Configurator');
  console.log('=================================================');
  
  if (!fs.existsSync(schemaPath)) {
    console.error(`❌ Schema file not found: ${schemaPath}`);
    console.log('Usage: node auto-configure.js [path-to-schema.yaml]');
    process.exit(1);
  }

  const analyzer = new APIAnalyzer(schemaPath);
  await analyzer.analyze();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = APIAnalyzer;

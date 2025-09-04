# Generic API Test Framework - Setup Guide

Bu generic test framework'ü başka bir API projesine uyarlamak için aşağıdaki dosyaları kopyalayın ve yapılandırın.

## Kopyalanması Gereken Dosyalar

### 1. Core Test Framework Files
```
tests/
├── dredd-hooks.js          # Ana test framework logic'i
└── dredd_test.go          # Go test integration (Go projeleri için)
```

### 2. Configuration Files
```
.env.example               # Environment variables template
generate-dredd-config.js   # Dynamic Dredd configuration generator
package.json               # Node.js dependencies ve scripts
```

### 3. Schema and Config Files (Templates)
```
schemas/api-schema.yaml    # OpenAPI specification template
dredd.yml                  # Dredd configuration (auto-generated)
```

## Kurulum Adımları

### 1. Dosyaları Kopyalayın
```bash
# Test framework dosyalarını yeni projenize kopyalayın
cp -r tests/ /yeni/proje/klasoru/
cp .env.example /yeni/proje/klasoru/
cp generate-dredd-config.js /yeni/proje/klasoru/
cp package.json /yeni/proje/klasoru/
```

### 2. Environment Variables Konfigürasyonu
```bash
# .env.example dosyasını .env olarak kopyalayın
cp .env.example .env

# .env dosyasını düzenleyin:
nano .env
```

### 3. .env Dosyasında Değiştirilmesi Gereken Değerler

```bash
# API Configuration - ZORUNLU DEĞIŞIKLIKLER
API_BASE_URL=http://localhost:YENI_PORT           # Yeni API'nizin URL'i
API_NAME=Yeni API Ismi                           # API ismi
SERVER_START_COMMAND=your-start-command          # Örnek: npm start, python app.py
SERVER_PORT=YENI_PORT                            # API port numarası

# Schema Configuration - ZORUNLU
OPENAPI_SCHEMA_PATH=schemas/yeni-api-schema.yaml # Yeni OpenAPI schema dosyanız

# Database Configuration - İhtiyaç halinde değiştirin
DATABASE_URL=your-database-connection-string     # Kendi DB connection string'iniz
JWT_SECRET=your-jwt-secret                       # JWT secret key'iniz

# Test User Credentials - API'nize uygun değerler
TEST_USER_EMAIL=test@yourdomain.com
EXISTING_USER_EMAIL=existing@yourdomain.com
TEST_USER_PASSWORD=yourpassword
```

### 4. OpenAPI Schema Oluşturun
```yaml
# schemas/yeni-api-schema.yaml dosyasını oluşturun
# Mevcut api-schema.yaml dosyasını template olarak kullanın
# Endpoint'lerinizi, model'lerinizi bu dosyada tanımlayın
```

### 5. Dependencies'i Kurun
```bash
# Node.js dependencies
npm install

# Go dependencies (Go projeleri için)
go mod download
```

### 6. Framework'ü Test Edin
```bash
# Configuration generate edin
npm run config

# API'nizi başlatın (başka bir terminalde)
your-start-command  # Örnek: npm start, go run main.go

# Test'leri çalıştırın
npm run test:dredd

# Veya Go test integration ile (Go projeleri için)
go test -v ./tests/ -timeout 120s
```

## Özelleştirme Seçenekleri

### Framework Behavior
```bash
# .env dosyasında bu değerleri ayarlayabilirsiniz:
ENABLE_DEBUG_LOGGING=true              # Debug logları
ENABLE_DYNAMIC_DATA_GENERATION=true    # Otomatik test data üretimi
ENABLE_ERROR_SIMULATION=true           # Error scenario testleri
AUTO_SKIP_TESTS=false                  # Otomatik test atlama
```

### Test Data Configuration
```bash
# Test verilerini özelleştirin:
UNIQUE_EMAIL_SUFFIX=@yourdomain.com     # Email suffix'i
TEST_PRODUCT_PRICE=199.99               # Test ürün fiyatı
TEST_ORDER_TOTAL=299.99                 # Test sipariş tutarı

# Test Framework Configuration
DREDD_LOG_LEVEL=warning                 # Supported: silent, error, warning, debug
DREDD_REPORTER=cli                      # Test output format
```

## Framework'ün Çalışma Prensibi

1. **Environment Variables**: Tüm konfigürasyon .env dosyasından okunur
2. **Dynamic Schema Parsing**: OpenAPI schema otomatik parse edilir
3. **Automatic Endpoint Discovery**: Protected/public endpoint'ler otomatik tespit edilir
4. **Dynamic Test Data Generation**: Schema'ya göre test data'sı otomatik üretilir
5. **Universal Authentication**: JWT token'lar otomatik yakalanır ve inject edilir
6. **Error Scenario Testing**: 400, 401, 404, 500 senaryoları otomatik test edilir

## Hangi Programming Language/Framework'ler Desteklenir?

- **Go**: Fiber, Gin, Echo, Gorilla Mux
- **Node.js**: Express, Fastify, Koa, NestJS
- **Python**: FastAPI, Flask, Django REST Framework
- **Java**: Spring Boot, Quarkus
- **C#**: ASP.NET Core
- **PHP**: Laravel, Symfony
- **Ruby**: Rails API, Sinatra

## Troubleshooting

### Common Issues

1. **Schema Parse Hatası**
   - OpenAPI schema syntax'ını kontrol edin
   - YAML format'ını validate edin

2. **Server Connection Hatası**
   - API_BASE_URL'in doğru olduğundan emin olun
   - SERVER_WAIT_TIME'ı artırın

3. **Authentication Hatası**
   - Test user credentials'ları kontrol edin
   - JWT secret'ın doğru olduğundan emin olun

4. **Dependency Hatası**
   ```bash
   npm install  # Node.js dependencies
   npm install -g dredd  # Global Dredd installation
   ```

## Support

Framework hakkında sorularınız için:
- GitHub Issues açabilirsiniz
- Documentation'ı inceleyebilirsiniz
- Existing test examples'ları referans alabilirsiniz

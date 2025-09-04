# Fix JSON syntax in api.go
$content = Get-Content "controllers\api.go" -Raw

# Replace error messages
$content = $content -replace '"error":\s*"([^"]+)"', 'Error: "$1"'

# Replace success messages  
$content = $content -replace '"message":\s*"([^"]+)"', 'Message: "$1"'

# Replace token responses
$content = $content -replace '"token":\s*"([^"]+)"', 'Token: "$1"'

# Save the updated content
$content | Set-Content "controllers\api.go"

Write-Host "Fixed JSON syntax in api.go"

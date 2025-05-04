# Script de vérification des prérequis pour le projet StudenTodo

Write-Host "Vérification des prérequis pour StudenTodo..." -ForegroundColor Cyan

# Vérification de .NET SDK
Write-Host "Vérification de .NET SDK..." -ForegroundColor Yellow
try {
    $dotnetVersion = dotnet --version
    if ($dotnetVersion -match "^8\.") {
        Write-Host "✅ .NET SDK $dotnetVersion trouvé" -ForegroundColor Green
    } else {
        Write-Host "⚠️ .NET SDK version 8.0 ou supérieure requise. Version actuelle: $dotnetVersion" -ForegroundColor Red
        Write-Host "   Télécharger le SDK .NET 8.0: https://dotnet.microsoft.com/download/dotnet/8.0" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ .NET SDK introuvable. Veuillez installer le SDK .NET 8.0" -ForegroundColor Red
    Write-Host "   Télécharger le SDK .NET 8.0: https://dotnet.microsoft.com/download/dotnet/8.0" -ForegroundColor Yellow
}

# Vérification de la restauration des packages
Write-Host "Vérification de la restauration des packages..." -ForegroundColor Yellow
try {
    $output = dotnet restore
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Packages restaurés avec succès" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Problème lors de la restauration des packages. Consultez les messages d'erreur ci-dessus." -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur lors de la restauration des packages" -ForegroundColor Red
}

# Vérification des ports
$ports = @(5000, 5001)
Write-Host "Vérification des ports disponibles..." -ForegroundColor Yellow
foreach ($port in $ports) {
    try {
        $tcpConnection = New-Object System.Net.Sockets.TcpClient
        $portOpen = $tcpConnection.ConnectAsync("127.0.0.1", $port).Wait(100)
        if ($portOpen) {
            Write-Host "⚠️ Le port $port est déjà utilisé. L'application pourrait rencontrer des problèmes." -ForegroundColor Red
        } else {
            Write-Host "✅ Le port $port est disponible" -ForegroundColor Green
        }
        $tcpConnection.Close()
    } catch {
        Write-Host "✅ Le port $port est disponible" -ForegroundColor Green
    }
}

Write-Host "`nPour lancer l'application:" -ForegroundColor Cyan
Write-Host "dotnet run --project StudenTodo/StudenTodo/StudenTodo.csproj" -ForegroundColor White

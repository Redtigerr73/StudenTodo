#!/bin/bash
# Script de vérification des prérequis pour le projet StudenTodo sur Linux/macOS

echo -e "\033[36mVérification des prérequis pour StudenTodo...\033[0m"

# Vérification de .NET SDK
echo -e "\033[33mVérification de .NET SDK...\033[0m"
if command -v dotnet &> /dev/null; then
    DOTNET_VERSION=$(dotnet --version)
    if [[ $DOTNET_VERSION == 8.* ]]; then
        echo -e "\033[32m✅ .NET SDK $DOTNET_VERSION trouvé\033[0m"
    else
        echo -e "\033[31m⚠️ .NET SDK version 8.0 ou supérieure requise. Version actuelle: $DOTNET_VERSION\033[0m"
        echo -e "\033[33m   Télécharger le SDK .NET 8.0: https://dotnet.microsoft.com/download/dotnet/8.0\033[0m"
    fi
else
    echo -e "\033[31m❌ .NET SDK introuvable. Veuillez installer le SDK .NET 8.0\033[0m"
    echo -e "\033[33m   Télécharger le SDK .NET 8.0: https://dotnet.microsoft.com/download/dotnet/8.0\033[0m"
fi

# Vérification de la restauration des packages
echo -e "\033[33mVérification de la restauration des packages...\033[0m"
if dotnet restore; then
    echo -e "\033[32m✅ Packages restaurés avec succès\033[0m"
else
    echo -e "\033[31m⚠️ Problème lors de la restauration des packages. Consultez les messages d'erreur ci-dessus.\033[0m"
fi

# Vérification des ports
PORTS=(5000 5001)
echo -e "\033[33mVérification des ports disponibles...\033[0m"
for PORT in "${PORTS[@]}"; do
    if nc -z localhost $PORT 2>/dev/null; then
        echo -e "\033[31m⚠️ Le port $PORT est déjà utilisé. L'application pourrait rencontrer des problèmes.\033[0m"
    else
        echo -e "\033[32m✅ Le port $PORT est disponible\033[0m"
    fi
done

echo -e "\n\033[36mPour lancer l'application:\033[0m"
echo -e "dotnet run --project StudenTodo/StudenTodo/StudenTodo.csproj"

# Rendre le script exécutable
chmod +x check-prereqs.sh

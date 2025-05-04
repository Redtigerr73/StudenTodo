# StudenTodo - Application Blazor PWA

## Introduction

StudenTodo est une application web progressive (PWA) moderne développée avec Blazor WebAssembly et .NET 8. Cette application de gestion de tâches permet aux étudiants d'organiser leurs projets, devoirs et engagements académiques de manière efficace, tout en fonctionnant même hors ligne grâce à ses capacités PWA.

### Objectifs pédagogiques

Ce projet démontre plusieurs concepts avancés de développement web moderne :

- **Architecture Blazor .NET 8** : Utilisation du modèle hybride avec rendu interactif côté serveur et client
- **Progressive Web App (PWA)** : Implémentation complète avec manifest, service worker et fonctionnement hors ligne
- **Interopérabilité JS/C#** : Communication fluide entre JavaScript et C# via JSInterop
- **Authentification et autorisation** : Gestion des utilisateurs avec ASP.NET Core Identity
- **Conception réactive** : Interface utilisateur adaptée à tous les appareils

### Fonctionnalités principales

- **Installation sur l'appareil** : Possibilité d'installer l'application comme une application native
- **Fonctionnement hors ligne** : Utilisation complète même sans connexion Internet
- **Synchronisation automatique** : Synchronisation des données lorsque la connexion est restaurée
- **Notifications** : Alertes pour les tâches à échéance proche
- **Interface intuitive** : Conception axée sur l'expérience utilisateur pour une productivité maximale

## Prérequis

- [.NET SDK 8.0](https://dotnet.microsoft.com/download/dotnet/8.0) (version minimale 8.0.13)
- Un éditeur de code comme [Visual Studio 2022](https://visualstudio.microsoft.com/vs/) ou [VS Code](https://code.visualstudio.com/)

## Configuration et exécution

1. Clonez ce dépôt
   ```
   git clone https://github.com/Redtigerr73/StudenTodo.git
   cd StudenTodo
   ```

2. Restaurez les dépendances NuGet
   ```
   dotnet restore
   ```

3. Compilez le projet
   ```
   dotnet build
   ```

4. Exécutez l'application
   ```
   dotnet run --project StudenTodo/StudenTodo/StudenTodo.csproj
   ```

5. Accédez à l'application dans votre navigateur
   ```
   https://localhost:5001 ou http://localhost:5000
   ```

## Architecture et structure du projet

Le projet StudenTodo est conçu selon une architecture Blazor WebAssembly Hosted moderne utilisant .NET 8, avec une implémentation PWA complète. Cette architecture permet à l'application de fonctionner à la fois en mode connecté et hors ligne.

### Vue d'ensemble de l'architecture

```
StudenTodo (Solution)
├── StudenTodo (Projet serveur ASP.NET Core)
│   ├── Components/        # Composants Blazor côté serveur
│   │   ├── Account/       # Gestion de l'authentification
│   │   ├── Layout/        # Disposition de l'interface
│   │   ├── Pages/         # Pages de l'application
│   │   └── PWA/           # Composants spécifiques à la PWA
│   ├── Data/             # Accès aux données et modèles
│   ├── wwwroot/          # Ressources statiques
│       ├── icons/         # Icônes PWA
│       ├── js/            # Scripts JavaScript
│       └── manifest.json  # Manifeste PWA
└── StudenTodo.Client (Projet Blazor WebAssembly)
    ├── Components/        # Composants Blazor côté client
    ├── Pages/             # Pages spécifiques au client
    └── wwwroot/          # Ressources statiques client
```

### Caractéristiques principales

#### Architecture Blazor hybride

Le projet utilise le modèle d'architecture hybride de Blazor .NET 8, permettant :

- **Rendu serveur interactif** (`@rendermode InteractiveServer`) : Exécution des composants sur le serveur avec communication via SignalR
- **Rendu WebAssembly interactif** (`@rendermode InteractiveWebAssembly`) : Exécution des composants directement dans le navigateur
- **Composition mixte** : Utilisation des deux modes dans la même application selon les besoins

Extrait du Program.cs illustrant cette configuration :
```csharp
builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents()
    .AddInteractiveWebAssemblyComponents();
```

#### Implémentation PWA complète

L'implémentation PWA est centrée dans le projet serveur pour une meilleure cohérence et facilité d'accès aux ressources.

**Composants PWA spécialisés** :
- `NetworkStatusComponent` : Détection de l'état de connexion
- `PWAUpdater` : Gestion des mises à jour du service worker
- `PWAInstaller` : Interface d'installation de l'application

**Fichiers clés** :
- `manifest.json` : Définition des métadonnées de l'application
- `service-worker.js` : Script de mise en cache et fonctionnement hors ligne
- Scripts JavaScript spécialisés pour la gestion des fonctionnalités PWA

#### Gestion de l'authentification

Le projet intègre le système d'authentification ASP.NET Core Identity :
- Authentification par cookie
- Support des comptes externes (configurable)
- Gestion des rôles et politiques d'autorisation

#### Architecture de données

- Utilisation d'Entity Framework Core pour l'accès aux données
- Migration de base de données pour les mises à jour schéma
- Couche d'abstraction via services et référentiels

## Documentation PWA

Consultez le fichier `StudenTodo/StudenTodo/wwwroot/PWA-README.md` pour des détails sur l'implémentation PWA de ce projet.

## Détails techniques des composants

### Composants Blazor : Modèle et cycle de vie

#### Modèles de rendu

L'application utilise plusieurs modes de rendu disponibles dans Blazor .NET 8 :

```csharp
// Rendu interactif côté serveur
@attribute [RenderModeInteractiveServer]

// Rendu interactif côté client
@rendermode InteractiveServer
```

#### Cycle de vie des composants

Les composants de l'application utilisent les phases du cycle de vie de manière optimale :

```csharp
// Initialisation avant le premier rendu
protected override void OnInitialized() 
{ 
    // Code d'initialisation 
}

// Actions après le rendu avec détection du premier rendu
protected override async Task OnAfterRenderAsync(bool firstRender)
{
    if (firstRender)
    {
        // Code exécuté uniquement au premier rendu
        await InitializeJsInterop();
    }
}

// Nettoyage des ressources
public void Dispose()
{
    // Libération des ressources
}
```

#### Liaison de données (Data Binding)

L'application utilise différentes techniques de liaison de données :

```csharp
// Liaison bidirectionnelle standard
<input @bind="TaskName" />

// Liaison en temps réel pendant la saisie
<input @bind="TaskName" @bind:event="oninput" />
```

#### Gestion d'état et performances

Les bonnes pratiques de gestion d'état sont appliquées :

```csharp
// Forçage du rafraîchissement du composant
StateHasChanged();

// Exécution sur le thread UI depuis un thread secondaire
await InvokeAsync(() => {
    // Mise à jour de l'état
    StateHasChanged();
});
```

### Interopérabilité JavaScript

La communication entre Blazor et JavaScript est implémentée de manière robuste :

```csharp
// Dans le composant Blazor
private IJSObjectReference _jsModule;

// Import dynamique du module JavaScript
_jsModule = await JSRuntime.InvokeAsync<IJSObjectReference>("import", "./js/pwa-force-install.js");

// Appel d'une fonction JavaScript
await _jsModule.InvokeVoidAsync("triggerInstall");

// Méthode invocable depuis JavaScript
[JSInvokable]
public void UpdateInstallButtonVisibility(bool canInstall)
{
    ShowButton = canInstall;
    StateHasChanged();
}
```

### Composants spécialisés

Plusieurs composants personnalisés ont été développés pour enrichir l'expérience utilisateur :

- **TimeDisplay.razor** : Affichage dynamique de l'heure avec actualisation par minuteur
- **NameDisplay.razor** : Champ de saisie avec liaison bidirectionnelle
- **TodoComponent.razor** : Gestion complète des tâches avec persistance localStorage via JSInterop
- **NetworkStatusComponent.razor** : Détection et affichage de l'état de connexion réseau
- **PWAUpdater.razor** : Gestion des mises à jour de l'application
- **PWAInstaller.razor** : Interface d'installation sur l'appareil

## Vérification des prérequis

Pour vous assurer que votre environnement est correctement configuré, vous pouvez utiliser les scripts de vérification inclus dans le projet :

### Windows (PowerShell)
```
.\check-prereqs.ps1
```

### Linux/macOS (Bash)
```
./check-prereqs.sh
```

Ces scripts vérifieront :
- La version du SDK .NET installée
- La restauration des packages NuGet
- La disponibilité des ports nécessaires

## Résolution des problèmes courants

### Erreur de SDK .NET

Si vous obtenez une erreur indiquant que le SDK .NET est introuvable ou d'une version incorrecte :
1. Installez le SDK .NET 8.0 depuis [le site officiel](https://dotnet.microsoft.com/download/dotnet/8.0)
2. Vérifiez que la variable d'environnement PATH inclut le chemin vers le SDK
3. Redémarrez votre terminal/IDE après l'installation

### Erreur de restauration des packages

Si vous rencontrez des erreurs lors de la restauration des packages NuGet :
1. Assurez-vous d'être connecté à Internet
2. Essayez de supprimer le dossier `obj` de chaque projet puis lancez `dotnet restore`
3. Vérifiez que votre pare-feu n'empêche pas l'accès aux sources NuGet

### Erreur de port déjà utilisé

Si le port 5000/5001 est déjà utilisé, vous pouvez spécifier un port différent :
```
dotnet run --project StudenTodo/StudenTodo/StudenTodo.csproj --urls="http://localhost:5003"
```

### Erreur de compilation liée aux fichiers PWA

Si vous rencontrez des erreurs de compilation liées aux fichiers PWA :
1. Assurez-vous que tous les fichiers statiques (service-worker.js, manifest.json) sont présents dans le dossier wwwroot du projet serveur
2. Vérifiez que les icônes référencées dans le manifest.json sont présentes dans le dossier wwwroot/icons

## Conseils pour les étudiants

### Comprendre les concepts clés

1. **Architecture Blazor WebAssembly Hosted** : Comprendre la distinction entre les composants serveur et client est crucial. Identifiez quand utiliser chaque mode de rendu selon les besoins de performance et d'accessibilité.

2. **Progressive Web App** : Maîtrisez les trois piliers des PWA : le manifeste (pour l'installation), le service worker (pour le fonctionnement hors ligne) et l'interopérabilité JavaScript (pour les fonctionnalités avancées).

3. **Débogage** : Utilisez les outils de développement du navigateur, notamment l'onglet "Application" pour inspecter le service worker, le stockage et le manifeste.


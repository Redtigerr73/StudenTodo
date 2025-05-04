# Script pour générer des icônes PWA basiques
# Ce script utilise System.Drawing pour créer des icônes de base

Add-Type -AssemblyName System.Drawing

$iconSizes = @(72, 96, 128, 144, 152, 192, 384, 512)
$outputDir = "StudenTodo\StudenTodo.Client\wwwroot\icons"

# Couleurs pour les icônes
$backgroundColor = [System.Drawing.Color]::FromArgb(3, 23, 61)  # #03173d
$textColor = [System.Drawing.Color]::White

# Création du répertoire de sortie s'il n'existe pas
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
    Write-Host "Répertoire créé: $outputDir"
}

# Fonction pour générer une icône
function Generate-Icon {
    param (
        [int]$size,
        [string]$outputPath,
        [System.Drawing.Color]$bgColor,
        [System.Drawing.Color]$fgColor
    )

    # Créer un bitmap avec la taille spécifiée
    $bitmap = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    
    # Définir l'arrière-plan
    $graphics.Clear($bgColor)
    
    # Configurer la police pour le texte centré
    $fontSize = $size * 0.4
    $font = New-Object System.Drawing.Font("Arial", $fontSize, [System.Drawing.FontStyle]::Bold)
    
    # Dessiner le texte
    $text = "ST"
    $textSize = $graphics.MeasureString($text, $font)
    $x = ($size - $textSize.Width) / 2
    $y = ($size - $textSize.Height) / 2
    
    $brush = New-Object System.Drawing.SolidBrush($fgColor)
    $graphics.DrawString($text, $font, $brush, $x, $y)
    
    # Sauvegarder l'image
    $bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    # Libérer les ressources
    $graphics.Dispose()
    $bitmap.Dispose()
    
    Write-Host "Icône générée: $outputPath"
}

# Générer les icônes pour chaque taille
foreach ($size in $iconSizes) {
    $outputPath = Join-Path $outputDir "icon-$size.png"
    Generate-Icon -size $size -outputPath $outputPath -bgColor $backgroundColor -fgColor $textColor
}

# Générer l'icône maskable spéciale (avec une marge de 10%)
$maskableSize = 512
$outputPath = Join-Path $outputDir "icon-$maskableSize-maskable.png"

$bitmap = New-Object System.Drawing.Bitmap($maskableSize, $maskableSize)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)

# Définir l'arrière-plan
$graphics.Clear($backgroundColor)

# Configurer la police pour le texte centré (légèrement plus petit pour permettre la zone de sécurité maskable)
$fontSize = $maskableSize * 0.3
$font = New-Object System.Drawing.Font("Arial", $fontSize, [System.Drawing.FontStyle]::Bold)

# Dessiner le texte
$text = "ST"
$textSize = $graphics.MeasureString($text, $font)
$x = ($maskableSize - $textSize.Width) / 2
$y = ($maskableSize - $textSize.Height) / 2

$brush = New-Object System.Drawing.SolidBrush($textColor)
$graphics.DrawString($text, $font, $brush, $x, $y)

# Sauvegarder l'image
$bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)

# Libérer les ressources
$graphics.Dispose()
$bitmap.Dispose()

Write-Host "Icône maskable générée: $outputPath"
Write-Host "Toutes les icônes PWA ont été générées!"

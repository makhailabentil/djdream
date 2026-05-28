# Builds dandjdream-site.zip for Porkbun Static Hosting upload.
# Run from the project folder:  .\deploy.ps1

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$zipPath = Join-Path $root "dandjdream-site.zip"

$files = @(
  "index.html",
  "styles.css",
  "script.js",
  "assets"
)

foreach ($item in $files) {
  $path = Join-Path $root $item
  if (-not (Test-Path $path)) {
    Write-Error "Missing required path: $item"
  }
}

if (Test-Path $zipPath) {
  Remove-Item $zipPath -Force
}

$staging = Join-Path $env:TEMP "dandjdream-deploy"
if (Test-Path $staging) {
  Remove-Item $staging -Recurse -Force
}
New-Item -ItemType Directory -Path $staging | Out-Null

Copy-Item (Join-Path $root "index.html") $staging
Copy-Item (Join-Path $root "styles.css") $staging
Copy-Item (Join-Path $root "script.js") $staging
Copy-Item (Join-Path $root "assets") (Join-Path $staging "assets") -Recurse

Compress-Archive -Path (Join-Path $staging "*") -DestinationPath $zipPath -Force
Remove-Item $staging -Recurse -Force

$sizeMb = [math]::Round((Get-Item $zipPath).Length / 1MB, 2)
Write-Host "Created: $zipPath ($sizeMb MB)"
if ($sizeMb -gt 40) {
  Write-Warning "Zip is over Porkbun's 40 MB single-upload limit. Use FTP or GitHub Connect on Static Hosting."
}


# ComfyUI Download & Install Script
$ErrorActionPreference = "Stop"

$DownloadUrl = "https://github.com/comfyanonymous/ComfyUI/releases/download/v0.3.14/ComfyUI_windows_portable_nvidia_cu121_or_cpu.7z"
# Fallback to getting latest if specific version fails
try {
    $latest = Invoke-RestMethod -Uri "https://api.github.com/repos/comfyanonymous/ComfyUI/releases/latest"
    $asset = $latest.assets | Where-Object name -like "*nvidia_cu121_or_cpu.7z*"
    if ($asset) {
        $DownloadUrl = $asset.browser_download_url
    }
} catch {
    Write-Host "Could not fetch latest release info, using default URL."
}

$FileName = "ComfyUI_windows_portable.7z"
$DestPath = "$PWD\$FileName"

Write-Host "=========================================="
Write-Host " Downloading ComfyUI (AI Engine)..."
Write-Host " URL: $DownloadUrl"
Write-Host " Save To: $DestPath"
Write-Host "=========================================="

Import-Module BitsTransfer
try {
    Start-BitsTransfer -Source $DownloadUrl -Destination $DestPath -Priority Foreground
    Write-Host "✅ Download Complete!"
} catch {
    Write-Host "❌ BitsTransfer failed: $_"
    Write-Host "Trying Invoke-WebRequest..."
    Invoke-WebRequest -Uri $DownloadUrl -OutFile $DestPath
    Write-Host "✅ Download Complete (via WebRequest)!"
}

Write-Host "=========================================="
Write-Host " File saved as: $FileName"
Write-Host " Please extract this file using 7-Zip or Bandizip."
Write-Host "=========================================="

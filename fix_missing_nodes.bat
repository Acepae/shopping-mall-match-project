@echo off
set COMFYUI_PATH=c:\Users\acepa\Downloads\ComfyUI_windows_portable
cd /d "%COMFYUI_PATH%\ComfyUI\custom_nodes"

echo [Kodari] Checking for missing custom nodes...

if not exist "ComfyUI-Manager" (
    echo [Kodari] Installing ComfyUI-Manager first...
    git clone https://github.com/ltdrdata/ComfyUI-Manager.git
)

if not exist "ComfyUI-ControlNet-Aux" (
    echo [Kodari] Installing ControlNet Aux (for Openpose)...
    git clone https://github.com/Fannovel16/ComfyUI-ControlNet-Aux.git
)

if not exist "ComfyUI_IPAdapter_plus" (
    echo [Kodari] Installing IP-Adapter-Plus...
    git clone https://github.com/cubiq/ComfyUI_IPAdapter_plus.git
)

echo.
echo [Kodari] All essential nodes have been queued for installation!
echo [Kodari] Please restart ComfyUI. If errors persist, use the 'Manager' button in ComfyUI to 'Install Missing Custom Nodes'.
pause

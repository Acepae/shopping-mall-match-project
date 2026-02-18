@echo off
echo [Kodari] Checking for zombie ComfyUI processes...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8188') do (
    echo [Kodari] Killing process %%a...
    taskkill /F /PID %%a
)
echo [Kodari] Port 8188 has been cleared!
echo [Kodari] Now you can run run_cpu.bat or run_nvidia_gpu.bat again.
pause

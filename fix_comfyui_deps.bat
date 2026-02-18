@echo off
cd /d "c:\Users\acepa\Downloads\ComfyUI_windows_portable"
echo [Kodari] Installing missing OpenCV and Matplotlib libraries...
.\python_embeded\python.exe -m pip install opencv-python matplotlib
echo [Kodari] Installation complete!
pause

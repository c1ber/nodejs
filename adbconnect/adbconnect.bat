@echo off
tasklist /nh /fi "imagename eq adb.exe" | find /i "adb.exe" >nul || adb start-server >nul
node adbconnect.js
timeout 2
pause
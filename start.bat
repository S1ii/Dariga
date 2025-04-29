@echo off
echo Starting Dariga application...

:: Start server with migration
start "Dariga Server" cmd /k "cd server && npm start migrate"

:: Start client
start "Dariga Client" cmd /k "cd client && npm start"

echo Applications are starting... 
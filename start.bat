@echo off
echo Starting application...

:: Start server with migration
start "Server" cmd /k "cd server && npm start migrate"

:: Start client
start "Client" cmd /k "cd client && npm start"

echo Applications are starting... 
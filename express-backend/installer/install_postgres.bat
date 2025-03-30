@echo off
SET USERNAME=%1
SET PASSWORD=%2

REM Change this to your actual installer path if needed
SET INSTALLER_PATH=postgres-installer.exe

REM Install PostgreSQL silently (change version/path as needed)
"%INSTALLER_PATH%" --mode unattended --unattendedmodeui none ^
--superpassword %PASSWORD% ^
--servicename postgresql ^
--serviceaccount postgres ^
--servicepassword %PASSWORD% ^
--datadir "C:\Program Files\PostgreSQL\data" ^
--prefix "C:\Program Files\PostgreSQL"

REM Add psql to PATH
SET PATH=%PATH%;"C:\Program Files\PostgreSQL\bin"

REM Wait for service to start
timeout /t 10

REM Create new user
psql -U postgres -c "CREATE USER %USERNAME% WITH SUPERUSER PASSWORD '%PASSWORD%';"

echo ✅ Postgres installed and user %USERNAME% created

@echo off
setlocal

set PGPASSWORD=postgres
set PG_VERSION=15
set INSTALL_DIR="C:\\Program Files\\PostgreSQL\\%PG_VERSION%"
set DATA_DIR="%INSTALL_DIR%\\data"

IF EXIST %INSTALL_DIR% (
  echo PostgreSQL already installed.
  exit /B 0
)

echo Installing PostgreSQL silently...
start /wait postgresql-%PG_VERSION%-windows-x64.exe ^
  --mode unattended ^
  --unattendedmodeui none ^
  --superpassword postgres ^
  --servicename "postgresql" ^
  --serverport 5432 ^
  --datadir %DATA_DIR% ^
  --prefix %INSTALL_DIR%

echo PostgreSQL installation completed.
endlocal
exit /B 0

@echo off
setlocal enabledelayedexpansion
set "JSON_DATA="

for /f %%i in (companies.txt) do (
    set "JSON_DATA=!JSON_DATA!,""%%~ni"""
)

set "JSON_DATA=[%JSON_DATA:~1%]"

curl -X POST -H "Content-Type: application/json" -d "{\"domains\": !JSON_DATA!}" http://localhost:8080/zendesk/check-domains

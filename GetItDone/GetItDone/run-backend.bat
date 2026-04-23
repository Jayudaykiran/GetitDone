@echo off
setlocal enabledelayedexpansion

REM Set Java 25 path
set JAVA_HOME=C:\Users\hp\.jdk\jdk-25
set PATH=%JAVA_HOME%\bin;%PATH%

REM Verify Java installation
echo Testing Java 25 installation...
%JAVA_HOME%\bin\java.exe -version

if errorlevel 1 (
    echo ERROR: Java 25 not found at %JAVA_HOME%
    exit /b 1
)

echo.
echo Starting GetItDone Backend with Java 25...
echo.

REM Run Spring Boot with Maven wrapper (H2 in-memory DB is default via dev profile)
cd /d C:\Users\hp\Downloads\GetItDone\GetItDone
call "C:\Users\hp\Downloads\GetItDone\GetItDone\mvnw.cmd" clean spring-boot:run -DskipTests

pause

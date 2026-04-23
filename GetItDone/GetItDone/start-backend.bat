@echo off
echo ================================
echo GetItDone - Backend Startup
echo ================================
echo.

REM Change to project directory
cd /d C:\Users\hp\Downloads\GetItDone\GetItDone

REM Set Java 25 path
set JAVA_HOME=C:\Users\hp\.jdk\jdk-25
set PATH=%JAVA_HOME%\bin;%PATH%

echo Checking Java 25 installation...
"%JAVA_HOME%\bin\java.exe" -version
if errorlevel 1 (
    echo ERROR: Java 25 not found at %JAVA_HOME%
    pause
    exit /b 1
)

echo.
echo Starting Spring Boot application with H2 in-memory database...
echo Backend will be available at: http://localhost:8080
echo H2 Console: http://localhost:8080/h2-console
echo.

call mvnw.cmd clean spring-boot:run -DskipTests

pause

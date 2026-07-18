@REM ----------------------------------------------------------------------------
@REM Maven Wrapper CMD script for Windows
@REM ----------------------------------------------------------------------------
@echo off
setlocal enableextensions enabledelayedexpansion

set MAVEN_VERSION=3.9.6
set MAVEN_DIST_DIR=%USERPROFILE%\.m2\wrapper\dists\apache-maven-%MAVEN_VERSION%-bin
set MAVEN_HOME=%MAVEN_DIST_DIR%\apache-maven-%MAVEN_VERSION%
set MAVEN_CMD=%MAVEN_HOME%\bin\mvn.cmd

if exist "%MAVEN_CMD%" (
    goto EXECUTE
)

echo [Maven Wrapper] Apache Maven %MAVEN_VERSION% not found locally. Downloading...
if not exist "%MAVEN_DIST_DIR%" mkdir "%MAVEN_DIST_DIR%"

set ZIP_FILE=%MAVEN_DIST_DIR%\apache-maven-%MAVEN_VERSION%-bin.zip
set DOWNLOAD_URL=https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/%MAVEN_VERSION%/apache-maven-%MAVEN_VERSION%-bin.zip

powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Write-Host 'Downloading Maven from' '%DOWNLOAD_URL%...'; Invoke-WebRequest -Uri '%DOWNLOAD_URL%' -OutFile '%ZIP_FILE%'; Write-Host 'Extracting Maven archive...'; Expand-Archive -Path '%ZIP_FILE%' -DestinationPath '%MAVEN_DIST_DIR%' -Force"

if not exist "%MAVEN_CMD%" (
    echo [ERROR] Failed to download or extract Maven to %MAVEN_HOME%.
    exit /b 1
)

:EXECUTE
"%MAVEN_CMD%" %*

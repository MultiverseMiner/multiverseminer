@echo off

echo.
echo -----------------------
echo Checking grunt
echo.

call grunt --version
IF ERRORLEVEL 1 GOTO INSTALL
GOTO BUILD

:INSTALL
echo.
echo -----------------------
echo Grunt was not found, installing...
echo.

call npm install
IF ERRORLEVEL 1 GOTO ERROR

call npm install -g grunt-cli
IF ERRORLEVEL 1 GOTO ERROR

:build
echo.
echo -----------------------
echo Building project...
echo.
call grunt
IF ERRORLEVEL 1 GOTO ERROR

GOTO NOERROR

:ERROR
echo.
echo ERROR: Build failed!
exit /b 1

:NOERROR
echo.
echo SUCCESS: Build finished!
exit /b 0
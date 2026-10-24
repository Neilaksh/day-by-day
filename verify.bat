@echo off
echo ================================================================================
echo VERIFICATION REPORT
echo ================================================================================
echo.

echo [1/3] Running TypeScript Check...
echo Command: npx tsc --noEmit
echo.
call npx tsc --noEmit
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] TypeScript check passed - no errors found
) else (
    echo [FAILED] TypeScript check failed with exit code %ERRORLEVEL%
)
echo.

echo ================================================================================
echo [2/3] Running ESLint Check...
echo Command: npx eslint . --ext .ts,.tsx
echo.
call npx eslint . --ext .ts,.tsx
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] ESLint check passed - no errors or warnings
) else (
    echo [FAILED] ESLint check failed with exit code %ERRORLEVEL%
)
echo.

echo ================================================================================
echo [3/3] Running Build...
echo Command: npm run build
echo.
call npm run build
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Build completed successfully
) else (
    echo [FAILED] Build failed with exit code %ERRORLEVEL%
)
echo.

echo ================================================================================
echo VERIFICATION COMPLETE
echo ================================================================================

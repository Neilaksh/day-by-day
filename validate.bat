@echo off
echo Running TypeScript type check...
cd C:\lucky\day-by-day
call npx tsc --noEmit > tsc_output.txt 2>&1
type tsc_output.txt
echo.
echo Running ESLint...
call npx eslint . --ext .ts,.tsx > eslint_output.txt 2>&1
type eslint_output.txt
echo.
echo Running build...
call npm run build > build_output.txt 2>&1
type build_output.txt
pause

@echo off
setlocal
set "ROOT=%~dp0"
set "TPL=%ROOT%src\index.template.html"
set "CSS=%ROOT%styles.css"
set "JS=%ROOT%app.js"
set "OUT=%ROOT%index.html"

if not exist "%TPL%" (
  echo [ERROR] template file not found: %TPL%
  exit /b 1
)
if not exist "%CSS%" (
  echo [ERROR] css file not found: %CSS%
  exit /b 1
)
if not exist "%JS%" (
  echo [ERROR] js file not found: %JS%
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$tpl=Get-Content -Raw -Encoding UTF8 '%TPL%';" ^
  "$css=Get-Content -Raw -Encoding UTF8 '%CSS%';" ^
  "$js=Get-Content -Raw -Encoding UTF8 '%JS%';" ^
  "$buildDate=Get-Date -Format 'yyyy-MM-dd';" ^
  "$out=$tpl.Replace('__INLINE_CSS__',$css).Replace('__INLINE_JS__',$js).Replace('__BUILD_DATE__',$buildDate);" ^
  "Set-Content -Path '%OUT%' -Value $out -Encoding UTF8"

if errorlevel 1 (
  echo [ERROR] index.html generation failed
  exit /b 1
)

echo [OK] generated: %OUT%
exit /b 0

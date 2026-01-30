@echo off
echo ========================================
echo   Panel de Administracion - Clinica
echo ========================================
echo.

echo [1/3] Verificando instalacion...
if not exist "node_modules" (
    echo Instalando dependencias...
    call npm install
) else (
    echo Dependencias ya instaladas ✓
)
echo.

echo [2/3] Generando cliente Prisma...
call npm run prisma:generate
echo.

echo [3/3] Iniciando servidor...
echo.
echo ========================================
echo   Servidor disponible en:
echo   http://localhost:3001
echo ========================================
echo.

call npm run dev

@echo off
setlocal enableextensions disabledelayedexpansion

set "target_dir="
set /p target_dir="Arrastra la carpeta de imagenes aqui y presiona Enter (o dejalo vacio para probar en carpeta actual): "

:: Si no se ingreso nada, usar directorio actual
if not defined target_dir set "target_dir=."

:: Eliminar comillas dobles que Windows agrega al arrastrar y soltar
set target_dir=%target_dir:"=%

echo Instalando dependencias...
pip install -r requirements.txt

echo Iniciando Segregador en: "%target_dir%"
python main.py "%target_dir%"

pause

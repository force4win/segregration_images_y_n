# Segregador de Imágenes SI/NO

Una aplicación web simple y rápida para clasificar imágenes de una carpeta en dos categorías: "SI" y "NO".

## Descripción

Esta herramienta proporciona una interfaz web local para visualizar imágenes de un directorio específico una por una, permitiendo al usuario decidir si la imagen pertenece a la categoría "SI" (aceptada) o "NO" (rechazada). Las imágenes clasificadas se mueven a sus respectivas subcarpetas (`SI`/`NO`) dentro del directorio original.

## Características

-   **Clasificación Rápida**: Interfaz visual para una clasificación ágil.
-   **Controles Intuitivos**: Usa los botones en pantalla o las flechas del teclado para decidir.
    -   **SI**: Botón verde / Flecha Derecha ➡️
    -   **NO**: Botón rojo / Flecha Izquierda ⬅️
-   **Función Deshacer**: Un botón "VOLVER" (o Flecha Abajo ⬇️) permite revertir la última acción.
-   **No requiere instalación compleja**: Simplemente ejecuta un script para iniciar.
-   **Orden Cronológico**: Las imágenes se muestran desde la más antigua a la más nueva.

## Cómo Usar

1.  **Coloca el proyecto** en una carpeta.
2.  Haz doble clic en el archivo `run.bat`.
3.  Se abrirá una ventana de comandos. **Arrastra la carpeta** que contiene las imágenes que quieres organizar y presiona `Enter`.
    -   Si no especificas una carpeta, la herramienta buscará imágenes en el directorio actual del proyecto.
4.  La aplicación se abrirá automáticamente en tu navegador web.
5.  ¡Comienza a clasificar! Las carpetas `SI` y `NO` se crearán en el directorio de tus imágenes.

## Tecnologías Utilizadas

-   **Backend**:
    -   Python 3
    -   FastAPI: Para crear la API REST.
    -   Uvicorn: Como servidor ASGI para FastAPI.
-   **Frontend**:
    -   HTML5
    -   CSS3
    -   JavaScript (Vanilla)
-   **Ejecución**:
    -   Script de Windows (`.bat`) para una fácil inicialización.

---
Creado como una solución simple para la organización de datasets de imágenes.

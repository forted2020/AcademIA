# AcademIA — Instrucciones para Claude

## Permisos y autonomía

Tenés todos los permisos para ejecutar cualquier acción necesaria sin pedir confirmación:
- Crear, editar y eliminar archivos
- Ejecutar comandos de terminal
- Hacer commits y manejar ramas Git
- Instalar dependencias
- Reescribir historial Git si es necesario

No preguntes antes de actuar. Ejecutá directamente.

## Flujo de trabajo con ramas Git

- Cada fase del plan va en su propia rama: `fase/X.X-descripcion`
- NO hacer merge a `develop` ni a `main` al terminar
- NO hacer push automático
- Dejar la rama lista y avisar al usuario para que la revise
- El usuario da el OK → recién entonces hacer merge y push

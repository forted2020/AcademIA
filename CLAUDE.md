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


# Reglas de Estilo de Código
- **Idioma:** Comentarios siempre en español.
- **Calidad:** El código debe ser autodescriptivo, pero apoyado por comentarios que expliquen el "porqué" de la lógica.
- **Equilibrio Lingüístico:**
  - NO: "Instanciar el subsistema de persistencia" (Muy elevado).
  - NO: "Guardar esto acá para que no se pierda" (Muy coloquial).
  - SÍ: "Guarda el estado del formulario en el almacenamiento local para prevenir pérdida de datos."

# Arquitectura de Componentes

## Reutilización de componentes existentes
- Antes de crear cualquier elemento de UI, verificar si ya existe un componente genérico en `frontend/src/components/` que cubra esa necesidad.
- Si existe, usarlo siempre — pasando las variaciones necesarias como props. Nunca duplicar lógica o estilos ya encapsulados en un componente.

## Creación de componentes nuevos
- Si se necesita un componente que no existe como genérico, crearlo en `frontend/src/components/<NombreComponente>/`.
- Estructura de la carpeta:
  ```
  components/
  └── NombreComponente/
      ├── NombreComponente.jsx      ← lógica y JSX
      ├── NombreComponente.css      ← estilos propios del componente
      └── [archivos adicionales]    ← configuración, datasets, constantes, utils, etc. según necesidad
  ```
- El componente debe ser genérico y reutilizable: exponer su comportamiento y apariencia mediante props, sin valores hardcodeados específicos de un módulo.
- Los estilos deben usar las variables CSS del design system del proyecto (`--primary-color`, `--surface-ground`, `--text-main`, `--border-radius`, etc.) para mantener coherencia visual.
- Usar un prefijo CSS único por componente (ej: `.nombre-comp__elemento`) para evitar colisiones.

## UX / UI
- Optimizar siempre la interfaz para la mejor experiencia de usuario posible: jerarquía visual clara, feedback inmediato en acciones, estados de carga y vacío bien definidos, y diseño responsivo.

## Implementación de fases del plan
- Cuando el usuario indica implementar puntos del plan (ej: 5.1.1, 5.1.2, 5.1.3), implementar todos los puntos mencionados sin preguntar.
- Aplicar siempre el mismo criterio: si el componente ya existe pero tiene valores hardcodeados o lógica incompleta, crear un componente nuevo separado sin tocar el original.
- No preguntar si hay dudas de diseño — tomar la decisión más razonable y ejecutar.



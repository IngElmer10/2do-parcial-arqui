# Frontend de Control de Asistencia (React + Vite)

## Enfoque actual

El frontend opera con el modelo **centrado en grupos**. Solo existen los roles `professor` y `student`; no hay panel de administración. Cada profesor inicia sesión y visualiza directamente los grupos (con su materia asociada) que fueron asignados en los scripts SQL de los microservicios.

## Estructura relevante

- `src/components/professor` → Dashboard, lista de grupos/materias, gestión de sesiones e historial.
- `src/components/student` → Dashboard de enrolamientos por grupo y detalle de asistencia.
- `src/services/api.js` y `src/services/apiEndpoints.js` → Contratos hacia `user-service`, `catalog-service` y `attendance-service`.
- `src/contexts/AuthContext.jsx` → Manejo de sesión con roles `professor`/`student`.

## Usuarios de ejemplo

Los scripts SQL de los servicios crean usuarios con contraseña hash (BCrypt). Para pruebas locales se puede usar cualquier contraseña válida que coincida con el hash cargado (`$2b$10$F67ctBRBWgetnG7UqT6cee0nmKp7Pi9IKoex912hokxmpsAbIZQ/K` corresponde a `admin123`).

**Profesores** (coinciden con IDs asignados en los inserts para garantizar grupos visibles):

- `prof.jlopez` → Matemáticas, grupos `MAT101-A`, `FIS101-A`.
- `prof.mgarcia` → Física, grupo `MAT101-B`.
- `prof.lrojas` → Programación/Electrónica, grupos `ELEC101-A`, `PROG201-A`.
- `prof.pfernandez` → Álgebra Lineal, grupo `MAT201-A`.

**Estudiantes** de ejemplo: `stud.ana`, `stud.carlos`, `stud.valentina`, `stud.jorge`, `stud.ricardo`, `stud.daniela` (ver enrolamientos en `user-service/script.sql`).

## Flujo esperado

1. El profesor inicia sesión y ve todos los **grupos asignados** (datos provienen de `catalog-service/init-db.sql`).
2. Al seleccionar un grupo puede iniciar sesiones de asistencia; la lista de alumnos se carga desde `user-service` con los enrolamientos precargados.
3. Las sesiones creadas y registros se almacenan en `attendance-service`. Los estudiantes consultan su historial desde el dashboard correspondiente.

## Variables de entorno

La aplicación usa los servicios expuestos en `http://localhost:3001`, `3002` y `3003` por defecto. Ajustar con `VITE_USER_SERVICE_URL`, `VITE_CATALOG_SERVICE_URL` y `VITE_ATTENDANCE_SERVICE_URL` si es necesario.

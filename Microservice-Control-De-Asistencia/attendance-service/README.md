# ATTENDANCE SERVICE
Servicio de Control de Asistencia.

## Endpoints Disponibles

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/sessions` | Crear nueva sesión de asistencia (requiere `group_id` y `professor_id`). |
| GET | `/sessions/:id` | Obtener detalles completos de una sesión. |
| PUT | `/sessions/:id/records` | Actualizar registros de asistencia para la sesión. |
| GET | `/sessions/:id/records` | Listar registros de asistencia de la sesión. |
| PUT | `/sessions/:id/close` | Cerrar una sesión abierta. |
| DELETE | `/sessions/:id` | Eliminar una sesión. |
| GET | `/attendance/student/:studentId` | Obtener historial del estudiante (todas las materias/grupos). |
| GET | `/attendance/student/:studentId/:groupId` | Obtener historial del estudiante filtrado por grupo. |
| GET | `/professors/:id/sessions` | Listar sesiones creadas por un profesor. |
| GET | `/groups/:id/sessions` | Listar sesiones asociadas a un grupo. |

# Catálogo de Servicios de Control de Asistencia

## Endpoints Disponibles

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/subjects` | Listar materias. |
| POST | `/subjects` | Crear una materia. |
| GET | `/subjects/:id` | Obtener detalles de una materia. |
| PUT | `/subjects/:id` | Actualizar datos de una materia. |
| DELETE | `/subjects/:id` | Eliminar una materia (si no tiene grupos). |
| GET | `/subjects/:id/groups` | Listar grupos de la materia. |
| POST | `/subjects/:id/groups` | Crear un grupo para la materia. |
| GET | `/groups/:id` | Obtener detalles de un grupo. |
| PUT | `/groups/:id` | Actualizar datos del grupo. |
| DELETE | `/groups/:id` | Eliminar un grupo. |
| GET | `/groups/:id/professors` | Listar profesores asignados al grupo. |
| POST | `/groups/:id/professors` | Asignar profesor al grupo (`professor_id`). |
| DELETE | `/groups/:groupId/professors/:professorId` | Quitar asignación del profesor. |
| GET | `/groups/:id/students` | Obtener alumnos enrolados (proxy al user-service). |
| GET | `/professors/:id/groups` | Listar grupos asignados a un profesor (incluye estudiantes). |
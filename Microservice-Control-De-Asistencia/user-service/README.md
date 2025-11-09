# Microservicio de Gestión de Usuarios

## Endpoints Disponibles

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/login` | Autenticar usuario (retorna perfil según rol). |
| GET | `/users` | Listar usuarios activos. |
| POST | `/users` | Crear usuario (rol `professor` o `student`). |
| GET | `/users/:id` | Obtener usuario por ID. |
| PUT | `/users/:id` | Actualizar datos del usuario. |
| DELETE | `/users/:id` | Eliminar usuario (hard delete). |
| GET | `/professors` | Listar profesores activos. |
| POST | `/professors` | Crear registro de profesor vinculado a un usuario existente. |
| GET | `/professors/:id` | Obtener profesor por ID interno. |
| PUT | `/professors/:id` | Actualizar datos de profesor. |
| DELETE | `/professors/:id` | Desactivar profesor. |
| GET | `/students` | Listar estudiantes activos. |
| POST | `/students` | Crear registro de estudiante vinculado a un usuario existente. |
| GET | `/students/:id` | Obtener estudiante por ID interno. |
| PUT | `/students/:id` | Actualizar datos de estudiante. |
| DELETE | `/students/:id` | Desactivar estudiante. |
| GET | `/students/:id/groups` | Listar grupos en los que está matriculado un estudiante. |
| GET | `/groups/:groupId/students` | Listar matrículas activas de un grupo. |
| POST | `/groups/:groupId/students` | Matricular estudiante (campo `student_id`). |
| DELETE | `/groups/:groupId/students/:studentId` | Dar de baja a un estudiante del grupo. |
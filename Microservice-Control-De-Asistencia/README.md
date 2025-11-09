
---

### 1. Requerimientos Funcionales y No Funcionales

#### Requerimientos Funcionales (RF)

**RF-01: Gestión de Usuarios**
- RF-01.1: El administrador puede crear, leer, actualizar y deshabilitar cuentas de Profesores y Estudiantes.
- RF-01.2: Los usuarios (Profesores y Estudiantes) pueden iniciar y cerrar sesión.

**RF-02: Gestión Académica (Catálogo)**
- RF-02.1: El administrador puede crear, leer, actualizar y eliminar Materias.
- RF-02.2: El administrador puede asignar Profesores a Materias.
- RF-02.3: El administrador puede inscribir Estudiantes a Materias.

**RF-03: Control de Asistencia**
- RF-03.1: Un Profesor puede ver la lista de Materias que le fueron asignadas.
- RF-03.2: Al seleccionar una Materia, el Profesor puede "Iniciar una Sesión de Asistencia" para la fecha actual.
- RF-03.3: Al iniciar una sesión, el sistema muestra la lista de Estudiantes inscritos en esa materia.
- RF-03.4: El Profesor puede marcar cada estudiante como "Presente" o "Ausente".
- RF-03.5: El Profesor puede finalizar el registro, guardando la asistencia de forma permanente.

**RF-04: Consulta de Asistencia**
- RF-04.1: Un Estudiante puede ver un listado de las Materias en las que está inscrito.
- RF-04.2: Al seleccionar una Materia, el Estudiante puede ver su historial de asistencia (fechas y estado).

#### Requerimientos No Funcionales (RNF)

- **RNF-01: Arquitectura de Microservicios:** El sistema debe estar compuesto por servicios independientes y desacoplados.
- **RNF-02: Lenguaje y Base de Datos:** Implementación en JavaScript (Node.js nativo) y MySQL.
- **RNF-03: Comunicación:** Los servicios se comunicarán mediante APIs RESTful sobre HTTP/JSON.
- **RNF-04: Simplicidad:** No se utilizarán frameworks externos (Express, Hapi, etc.) para la capa web de los servicios. Se usarán módulos nativos de Node.js (`http`, `url`).
- **RNF-05: Seguridad Básica:** Las contraseñas se almacenarán encriptadas (hash con bcrypt). Las APIs serán stateless.
- **RNF-06: Base de Datos por Servicio:** Cada microservicio gestionará su propia base de datos o esquema dentro del mismo servidor MySQL.

---

### 2. Análisis Detallado por Rol

#### Rol: Administrador
1.  **Iniciar Sesión:** Accede al panel de administración.
2.  **Gestionar Estudiantes:**
    - **Crear:** Ingresa nombre, email, ID único.
    - **Listar:** Ve todos los estudiantes.
    - **Editar:** Modifica información de un estudiante.
    - **Deshabilitar:** Inactiva una cuenta.
3.  **Gestionar Profesores:** (Las mismas acciones que para Estudiantes).
4.  **Gestionar Materias:**
    - **Crear:** Ingresa nombre, código, descripción.
    - **Listar/Editar/Eliminar.**
5.  **Asignar Profesor a Materia:** Desde la vista de una materia, selecciona un profesor de una lista.
6.  **Inscribir Estudiante a Materia:** Desde la vista de una materia, selecciona estudiantes para inscribirlos.

#### Rol: Profesor
1.  **Iniciar Sesión:** Accede al panel de profesor.
2.  **Ver Mis Materias:** Visualiza un dashboard con las materias asignadas a él.
3.  **Registrar Asistencia:**
    - Selecciona una materia.
    - El sistema verifica si ya existe un registro de asistencia para la fecha actual.
    - Si no existe, muestra la lista de estudiantes inscritos con un checkbox o botón para "Presente"/"Ausente".
    - El profesor marca la asistencia y confirma el envío.
4.  **Ver Historial de una Materia:** Puede consultar las asistencias registradas anteriormente para una materia, viendo por fecha qué estudiantes estuvieron presentes.

#### Rol: Estudiante
1.  **Iniciar Sesión:** Accede al panel de estudiante.
2.  **Ver Mis Materias:** Visualiza un listado de las materias en las que está inscrito.
3.  **Ver Mi Asistencia:**
    - Selecciona una materia.
    - El sistema muestra un listado con las fechas en las que se registró asistencia y su estado (Presente/Ausente) para cada fecha.

---

### 3. Diseño: Arquitectura de Microservicios (Revisada)

Dado que no usaremos API Gateway, el frontend (cliente) deberá conocer las direcciones (puertos) de cada microservicio. Esta es una simplificación válida para un MVP que demuestra el concepto.

```TEXT
graph LR
    subgraph "Cliente (Aplicación Web - Frontend)"
        UI[HTML, CSS, JavaScript]
    end

    subgraph "Microservicios (Backend - Node.js nativo)"
        US[User Service<br/>Puerto: 3001]
        CS[Catalog Service<br/>Puerto: 3002]
        AS[Attendance Service<br/>Puerto: 3003]
    end

    subgraph "Bases de Datos MySQL"
        DB_US[((Esquema: users_db))]
        DB_CS[((Esquema: catalog_db))]
        DB_AS[((Esquema: attendance_db))]
    end

    UI --> US
    UI --> CS
    UI --> AS

    US --> DB_US
    CS --> DB_CS
    AS --> DB_AS

    AS -.->|Consulta datos<br/>vía API| CS
    AS -.->|Consulta datos<br/>vía API| US
```

**Descripción de los Servicios:**

1.  **User Service (Puerto 3001):**
    *   **Responsabilidad:** Gestionar todo lo relacionado con los usuarios (Admin, Profesor, Estudiante).
    *   **Endpoints:** `POST /login`, `GET /users`, `POST /users`, `GET /users/:id`, `PUT /users/:id`.
    *   **Base de Datos:** Esquema `users_db`. Tablas: `users` (con un campo `role`).

2.  **Catalog Service (Puerto 3002):**
    *   **Responsabilidad:** Gestionar las entidades académicas (Materias) y sus relaciones (asignación de profesores, inscripción de estudiantes).
    *   **Endpoints:** `GET /subjects`, `POST /subjects`, `GET /subjects/:id/students`, `POST /subjects/:id/students`.
    *   **Base de Datos:** Esquema `catalog_db`. Tablas: `subjects`, `subject_teachers`, `subject_students`.

3.  **Attendance Service (Puerto 3003):**
    *   **Responsabilidad:** Gestionar el proceso completo de asistencia (sesiones, registros).
    *   **Endpoints:** `POST /sessions` (iniciar sesión), `GET /sessions/:session_id/records` (obtener lista), `PUT /sessions/:session_id/records` (guardar asistencias), `GET /attendance/student/:student_id` (historial del estudiante).
    *   **Base de Datos:** Esquema `attendance_db`. Tablas: `attendance_sessions`, `attendance_records`.
    *   **Dependencias:** Para crear una sesión, necesita validar que el profesor esté asignado a la materia (llamada al Catalog Service). Para mostrar la lista de estudiantes, necesita obtenerlos del Catalog Service.

---

### 4. Diseño de la Base de Datos

**Esquema: `users_db`**
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Contraseña hasheada con bcrypt
    email VARCHAR(100),
    full_name VARCHAR(100),
    role ENUM('admin', 'professor', 'student') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar usuario admin por defecto (contraseña: admin123)
INSERT INTO users (username, password_hash, full_name, role) 
VALUES (
    'admin', 
    '$2b$12$LQv3c1yqBWVHADV0oWdBee6Lekt5V7hC9VnU8uYbW7QG5p5p5p5p5', 
    'Administrador Principal', 
    'admin'
) ON DUPLICATE KEY UPDATE username = username;
```

**Esquema: `catalog_db`**
```sql
CREATE TABLE subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

CREATE TABLE subject_teachers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_id INT NOT NULL,
    professor_id INT NOT NULL, -- ID de la tabla users en el esquema users_db
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
    -- Nota: No hay FK a users_db.professor_id por estar en otro esquema. La integridad se maneja por aplicación.
);

CREATE TABLE subject_students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_id INT NOT NULL,
    student_id INT NOT NULL, -- ID de la tabla users en el esquema users_db
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);
```

**Esquema: `attendance_db`**
```sql
CREATE TABLE attendance_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_id INT NOT NULL, -- ID de la materia (referencia al catalog_db)
    professor_id INT NOT NULL, -- ID del profesor (referencia al users_db)
    session_date DATE NOT NULL, -- Fecha de la clase (ej: 2023-10-27)
    status ENUM('open', 'closed') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE attendance_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    student_id INT NOT NULL, -- ID del estudiante (referencia al users_db)
    status ENUM('present', 'absent') NOT NULL,
    FOREIGN KEY (session_id) REFERENCES attendance_sessions(id) ON DELETE CASCADE
);
```


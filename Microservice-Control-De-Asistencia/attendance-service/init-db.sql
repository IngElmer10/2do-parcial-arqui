CREATE DATABASE IF NOT EXISTS attendance_db;

USE attendance_db;

-- Tabla de sesiones de asistencia por grupo
CREATE TABLE IF NOT EXISTS attendance_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    subject_id INT NOT NULL,
    professor_id INT NOT NULL,
    session_date DATE NOT NULL,
    start_time TIME NULL,
    end_time TIME NULL,
    status ENUM('open', 'closed') DEFAULT 'open',
    session_type ENUM('normal', 'exam') DEFAULT 'normal',
    exam_title VARCHAR(255) NULL,
    exam_duration_minutes INT NULL,
    exam_is_strict TINYINT(1) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_group_session (group_id, session_date, start_time)
);

-- Tabla de registros de asistencia individuales
CREATE TABLE IF NOT EXISTS attendance_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    student_id INT NOT NULL,
    status ENUM('present', 'absent') NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    UNIQUE KEY uq_attendance (session_id, student_id)
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_session_date ON attendance_sessions(session_date);
CREATE INDEX idx_session_group ON attendance_sessions(group_id);
CREATE INDEX idx_session_professor ON attendance_sessions(professor_id);
CREATE INDEX idx_session_status ON attendance_sessions(status);
CREATE INDEX idx_record_student ON attendance_records(student_id);
CREATE INDEX idx_record_session ON attendance_records(session_id);
CREATE INDEX idx_record_status ON attendance_records(status);

USE attendance_db;

-- 🔹 Nuevas sesiones (grupos 5–7)
INSERT IGNORE INTO attendance_sessions (
    group_id,
    subject_id,
    professor_id,
    session_date,
    start_time,
    end_time,
    status,
    session_type,
    exam_title,
    exam_duration_minutes,
    exam_is_strict
)
VALUES
(5, 5, 4, '2025-03-15', '09:00:00', '11:00:00', 'closed', 'exam', 'Examen Unidad 1', 120, 1),
(5, 5, 4, '2025-03-22', '09:00:00', '11:00:00', 'open', 'normal', NULL, NULL, NULL),
(6, 6, 4, '2025-03-18', '10:00:00', '12:00:00', 'closed', 'normal', NULL, NULL, NULL),
(6, 6, 4, '2025-03-25', '10:00:00', '12:00:00', 'closed', 'exam', 'Examen Unidad 2', 120, 1),
(7, 7, 5, '2025-03-20', '08:00:00', '10:00:00', 'closed', 'normal', NULL, NULL, NULL);

-- 🔹 Registros de asistencia coherentes con matrículas
INSERT IGNORE INTO attendance_records (session_id, student_id, status) VALUES
-- Sesión 1 (Electrónica I)
(6, 4, 'present'),  -- Valentina
(6, 5, 'present'),  -- Jorge
-- Sesión 2 (Electrónica I)
(7, 4, 'absent'),
(7, 5, 'present'),
-- Sesión 3 (Programación Intermedia)
(8, 6, 'present'),
(8, 7, 'present'),
(8, 4, 'present'),
-- Sesión 4 (Programación Intermedia)
(9, 6, 'present'),
(9, 7, 'absent'),
(9, 4, 'present'),
-- Sesión 5 (Álgebra Lineal)
(10, 5, 'present'),
(10, 7, 'absent');

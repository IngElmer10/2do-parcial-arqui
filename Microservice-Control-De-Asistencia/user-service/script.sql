CREATE DATABASE IF NOT EXISTS users_db;

USE users_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    full_name VARCHAR(100),
    role ENUM('professor', 'student') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS professors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    employee_code VARCHAR(20) UNIQUE NOT NULL,
    department VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    student_code VARCHAR(20) UNIQUE NOT NULL,
    career VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS group_enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    student_id INT NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_group_student (group_id, student_id),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Datos de ejemplo
INSERT INTO users (username, password_hash, email, full_name, role) VALUES
('prof.jlopez', '$2b$10$F67ctBRBWgetnG7UqT6cee0nmKp7Pi9IKoex912hokxmpsAbIZQ/K', 'jlopez@example.com', 'Juan López', 'professor'),
('prof.mgarcia', '$2b$10$F67ctBRBWgetnG7UqT6cee0nmKp7Pi9IKoex912hokxmpsAbIZQ/K', 'mgarcia@example.com', 'María García', 'professor'),
('stud.ana', '$2b$10$F67ctBRBWgetnG7UqT6cee0nmKp7Pi9IKoex912hokxmpsAbIZQ/K', 'ana@example.com', 'Ana Martínez', 'student'),
('stud.carlos', '$2b$10$F67ctBRBWgetnG7UqT6cee0nmKp7Pi9IKoex912hokxmpsAbIZQ/K', 'carlos@example.com', 'Carlos Ramírez', 'student')
ON DUPLICATE KEY UPDATE username = username;

INSERT INTO professors (user_id, employee_code, department) VALUES
((SELECT id FROM users WHERE username = 'prof.jlopez'), 'DOC-001', 'Matemáticas'),
((SELECT id FROM users WHERE username = 'prof.mgarcia'), 'DOC-002', 'Física')
ON DUPLICATE KEY UPDATE employee_code = VALUES(employee_code);

INSERT INTO students (user_id, student_code, career) VALUES
((SELECT id FROM users WHERE username = 'stud.ana'), 'STU-001', 'Ingeniería de Sistemas'),
((SELECT id FROM users WHERE username = 'stud.carlos'), 'STU-002', 'Matemática Aplicada')
ON DUPLICATE KEY UPDATE student_code = VALUES(student_code);

INSERT INTO group_enrollments (group_id, student_id) VALUES
(1, (SELECT id FROM students WHERE student_code = 'STU-001')),
(1, (SELECT id FROM students WHERE student_code = 'STU-002')),
(2, (SELECT id FROM students WHERE student_code = 'STU-001'))
ON DUPLICATE KEY UPDATE status = 'active';



-- 🔹 Nuevos usuarios (profesores y estudiantes)
INSERT INTO users (username, password_hash, email, full_name, role) VALUES
('prof.lrojas', '$2b$10$F67ctBRBWgetnG7UqT6cee0nmKp7Pi9IKoex912hokxmpsAbIZQ/K', 'lrojas@example.com', 'Luis Rojas', 'professor'),
('prof.pfernandez', '$2b$10$F67ctBRBWgetnG7UqT6cee0nmKp7Pi9IKoex912hokxmpsAbIZQ/K', 'pfernandez@example.com', 'Patricia Fernández', 'professor'),
('stud.valentina', '$2b$10$F67ctBRBWgetnG7UqT6cee0nmKp7Pi9IKoex912hokxmpsAbIZQ/K', 'valentina@example.com', 'Valentina Pérez', 'student'),
('stud.jorge', '$2b$10$F67ctBRBWgetnG7UqT6cee0nmKp7Pi9IKoex912hokxmpsAbIZQ/K', 'jorge@example.com', 'Jorge Castillo', 'student'),
('stud.ricardo', '$2b$10$F67ctBRBWgetnG7UqT6cee0nmKp7Pi9IKoex912hokxmpsAbIZQ/K', 'ricardo@example.com', 'Ricardo Gómez', 'student'),
('stud.daniela', '$2b$10$F67ctBRBWgetnG7UqT6cee0nmKp7Pi9IKoex912hokxmpsAbIZQ/K', 'daniela@example.com', 'Daniela Soto', 'student')
ON DUPLICATE KEY UPDATE username = username;

-- 🔹 Nuevos profesores
INSERT INTO professors (user_id, employee_code, department) VALUES
((SELECT id FROM users WHERE username = 'prof.lrojas'), 'DOC-003', 'Programación y Software'),
((SELECT id FROM users WHERE username = 'prof.pfernandez'), 'DOC-004', 'Electrónica')
ON DUPLICATE KEY UPDATE employee_code = VALUES(employee_code);

-- 🔹 Nuevos estudiantes
INSERT INTO students (user_id, student_code, career) VALUES
((SELECT id FROM users WHERE username = 'stud.valentina'), 'STU-004', 'Ingeniería Electrónica'),
((SELECT id FROM users WHERE username = 'stud.jorge'), 'STU-005', 'Física Aplicada'),
((SELECT id FROM users WHERE username = 'stud.ricardo'), 'STU-006', 'Ingeniería de Sistemas'),
((SELECT id FROM users WHERE username = 'stud.daniela'), 'STU-007', 'Matemática Pura')
ON DUPLICATE KEY UPDATE student_code = VALUES(student_code);


INSERT INTO group_enrollments (group_id, student_id) VALUES
-- Electrónica I
(5, (SELECT id FROM students WHERE student_code = 'STU-004')),  -- Valentina
(5, (SELECT id FROM students WHERE student_code = 'STU-005')),  -- Jorge
-- Programación Intermedia
(6, (SELECT id FROM students WHERE student_code = 'STU-006')),  -- Ricardo
(6, (SELECT id FROM students WHERE student_code = 'STU-007')),  -- Daniela
(6, (SELECT id FROM students WHERE student_code = 'STU-004')),  -- Valentina también cursa Programación
-- Álgebra Lineal
(7, (SELECT id FROM students WHERE student_code = 'STU-005')),  -- Jorge
(7, (SELECT id FROM students WHERE student_code = 'STU-007'))   -- Daniela
ON DUPLICATE KEY UPDATE status = 'active';

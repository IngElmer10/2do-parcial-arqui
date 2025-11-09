CREATE DATABASE IF NOT EXISTS catalog_db;
USE catalog_db;

-- Tabla de materias
CREATE TABLE IF NOT EXISTS subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de grupos por materia
CREATE TABLE IF NOT EXISTS `groups` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_id INT NOT NULL,
    code VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    term VARCHAR(20),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_groups_subject FOREIGN KEY (subject_id)
        REFERENCES subjects(id) ON DELETE CASCADE,
    CONSTRAINT uq_group_code_per_subject UNIQUE (subject_id, code)
);

-- Tabla de asignación de docentes a grupos
CREATE TABLE IF NOT EXISTS group_professors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    professor_id INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_group_professors_group FOREIGN KEY (group_id)
        REFERENCES `groups`(id) ON DELETE CASCADE,
    CONSTRAINT uq_group_professor UNIQUE (group_id, professor_id)
);

-- Datos de ejemplo
INSERT IGNORE INTO subjects (code, name, description) VALUES
('MAT101', 'Cálculo I', 'Introducción al cálculo diferencial e integral'),
('FIS101', 'Física General', 'Mecánica clásica y termodinámica'),
('PROG101', 'Programación Básica', 'Fundamentos de programación con JavaScript');

INSERT IGNORE INTO `groups` (subject_id, code, name, term, description) VALUES
(1, 'MAT101-A', 'Cálculo I - Grupo A', '2025-1', 'Grupo matutino de Cálculo I'),
(1, 'MAT101-B', 'Cálculo I - Grupo B', '2025-1', 'Grupo vespertino de Cálculo I'),
(2, 'FIS101-A', 'Física General - Grupo A', '2025-1', 'Grupo único de Física General'),
(3, 'PROG101-A', 'Programación Básica - Grupo A', '2025-1', 'Introducción a la programación');

INSERT IGNORE INTO group_professors (group_id, professor_id) VALUES
(1, 1),
(2, 2),
(3, 1),
(4, 3);



-- 🔹 Nuevas materias
INSERT IGNORE INTO subjects (code, name, description) VALUES
('ELEC101', 'Electrónica I', 'Fundamentos de circuitos eléctricos y componentes básicos'),
('PROG201', 'Programación Intermedia', 'Estructuras de datos y algoritmos en Python'),
('MAT201', 'Álgebra Lineal', 'Matrices, vectores y transformaciones lineales');

-- 🔹 Nuevos grupos (con nuevos profesores)
INSERT IGNORE INTO `groups` (subject_id, code, name, term, description) VALUES
(5, 'ELEC101-A', 'Electrónica I - Grupo A', '2025-1', 'Curso básico de electrónica'),
(6, 'PROG201-A', 'Programación Intermedia - Grupo A', '2025-1', 'Curso práctico de Python'),
(7, 'MAT201-A', 'Álgebra Lineal - Grupo A', '2025-1', 'Teoría y ejercicios de álgebra lineal');

-- 🔹 Asignación de nuevos profesores a los grupos
INSERT IGNORE INTO group_professors (group_id, professor_id) VALUES
(5, 3),  -- Luis Rojas enseña Electrónica I
(6, 3),  -- Luis Rojas enseña Programación Intermedia
(7, 4);  -- Patricia Fernández enseña Álgebra Lineal

const db = require('../../config/database');
const Student = require('../models/Student');

class StudentRepository {
    async findAll() {
        try {
            const [rows] = await db.execute(
                `SELECT s.id, s.user_id, s.student_code, s.career, s.is_active, s.created_at,
                        u.username, u.email, u.full_name
                 FROM students s
                 JOIN users u ON s.user_id = u.id
                 WHERE s.is_active = TRUE AND u.is_active = TRUE
                 ORDER BY u.full_name`
            );
            return rows.map(row => new Student(row));
        } catch (error) {
            throw new Error(`Error fetching students: ${error.message}`);
        }
    }

    async findById(id) {
        try {
            const [rows] = await db.execute(
                `SELECT s.id, s.user_id, s.student_code, s.career, s.is_active, s.created_at,
                        u.username, u.email, u.full_name
                 FROM students s
                 JOIN users u ON s.user_id = u.id
                 WHERE s.id = ?`,
                [id]
            );
            return rows.length ? new Student(rows[0]) : null;
        } catch (error) {
            throw new Error(`Error fetching student by id: ${error.message}`);
        }
    }

    async findByUserId(userId) {
        try {
            const [rows] = await db.execute(
                `SELECT s.id, s.user_id, s.student_code, s.career, s.is_active, s.created_at,
                        u.username, u.email, u.full_name
                 FROM students s
                 JOIN users u ON s.user_id = u.id
                 WHERE s.user_id = ?`,
                [userId]
            );
            return rows.length ? new Student(rows[0]) : null;
        } catch (error) {
            throw new Error(`Error fetching student by user id: ${error.message}`);
        }
    }

    async insert(studentData) {
        try {
            const { user_id, student_code, career, is_active } = studentData;
            const [result] = await db.execute(
                `INSERT INTO students (user_id, student_code, career, is_active)
                 VALUES (?, ?, ?, ?)`
                , [user_id, student_code, career ?? null, is_active ?? true]
            );
            return result.insertId;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Student code already exists');
            }
            throw new Error(`Error creating student: ${error.message}`);
        }
    }

    async update(id, updates) {
        try {
            const fields = [];
            const values = [];

            Object.entries(updates).forEach(([key, value]) => {
                if (value !== undefined) {
                    fields.push(`${key} = ?`);
                    values.push(value);
                }
            });

            if (!fields.length) {
                throw new Error('No fields to update');
            }

            values.push(id);

            const [result] = await db.execute(
                `UPDATE students SET ${fields.join(', ')} WHERE id = ?`,
                values
            );

            return result.affectedRows > 0;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Student code already exists');
            }
            throw new Error(`Error updating student: ${error.message}`);
        }
    }

    async deactivate(id) {
        try {
            const [result] = await db.execute(
                'UPDATE students SET is_active = FALSE WHERE id = ?',
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Error deactivating student: ${error.message}`);
        }
    }
}

module.exports = StudentRepository;

const db = require('../../config/database');
const Professor = require('../models/Professor');

class ProfessorRepository {
    async findAll() {
        try {
            const [rows] = await db.execute(
                `SELECT p.id, p.user_id, p.employee_code, p.department, p.is_active, p.created_at,
                        u.username, u.email, u.full_name
                 FROM professors p
                 JOIN users u ON p.user_id = u.id
                 WHERE p.is_active = TRUE AND u.is_active = TRUE
                 ORDER BY u.full_name`
            );
            return rows.map(row => new Professor(row));
        } catch (error) {
            throw new Error(`Error fetching professors: ${error.message}`);
        }
    }

    async findById(id) {
        try {
            const [rows] = await db.execute(
                `SELECT p.id, p.user_id, p.employee_code, p.department, p.is_active, p.created_at,
                        u.username, u.email, u.full_name
                 FROM professors p
                 JOIN users u ON p.user_id = u.id
                 WHERE p.id = ?`,
                [id]
            );
            return rows.length ? new Professor(rows[0]) : null;
        } catch (error) {
            throw new Error(`Error fetching professor by id: ${error.message}`);
        }
    }

    async findByUserId(userId) {
        try {
            const [rows] = await db.execute(
                `SELECT p.id, p.user_id, p.employee_code, p.department, p.is_active, p.created_at,
                        u.username, u.email, u.full_name
                 FROM professors p
                 JOIN users u ON p.user_id = u.id
                 WHERE p.user_id = ?`,
                [userId]
            );
            return rows.length ? new Professor(rows[0]) : null;
        } catch (error) {
            throw new Error(`Error fetching professor by user id: ${error.message}`);
        }
    }

    async insert(professorData) {
        try {
            const { user_id, employee_code, department, is_active } = professorData;
            const [result] = await db.execute(
                `INSERT INTO professors (user_id, employee_code, department, is_active)
                 VALUES (?, ?, ?, ?)`
                , [user_id, employee_code, department ?? null, is_active ?? true]
            );
            return result.insertId;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Employee code already exists');
            }
            throw new Error(`Error creating professor: ${error.message}`);
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
                `UPDATE professors SET ${fields.join(', ')} WHERE id = ?`,
                values
            );

            return result.affectedRows > 0;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Employee code already exists');
            }
            throw new Error(`Error updating professor: ${error.message}`);
        }
    }

    async deactivate(id) {
        try {
            const [result] = await db.execute(
                'UPDATE professors SET is_active = FALSE WHERE id = ?',
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Error deactivating professor: ${error.message}`);
        }
    }
}

module.exports = ProfessorRepository;

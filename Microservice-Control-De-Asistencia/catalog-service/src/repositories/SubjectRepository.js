const db = require('../../config/database');
const Subject = require('../models/Subject');

class SubjectRepository {
    async findAll() {
        try {
            const [rows] = await db.execute(
                'SELECT id, code, name, description, created_at FROM subjects ORDER BY name'
            );
            return rows.map(row => new Subject(row));
        } catch (error) {
            throw new Error(`Error fetching subjects: ${error.message}`);
        }
    }

    async findById(id) {
        try {
            const [rows] = await db.execute(
                'SELECT id, code, name, description, created_at FROM subjects WHERE id = ?',
                [id]
            );
            return rows.length > 0 ? new Subject(rows[0]) : null;
        } catch (error) {
            throw new Error(`Error fetching subject by id: ${error.message}`);
        }
    }

    async findByCode(code) {
        try {
            const [rows] = await db.execute(
                'SELECT id, code, name, description, created_at FROM subjects WHERE code = ?',
                [code]
            );
            return rows.length > 0 ? new Subject(rows[0]) : null;
        } catch (error) {
            throw new Error(`Error fetching subject by code: ${error.message}`);
        }
    }

    async insert(subjectData) {
        try {
            const { code, name, description } = subjectData;

            const [result] = await db.execute(
                'INSERT INTO subjects (code, name, description) VALUES (?, ?, ?)',
                [code, name, description]
            );

            return result.insertId;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Subject code already exists');
            }
            throw new Error(`Error creating subject: ${error.message}`);
        }
    }

    async update(id, subjectData) {
        try {
            const fields = [];
            const values = [];

            Object.keys(subjectData).forEach(key => {
                if (subjectData[key] !== undefined) {
                    fields.push(`${key} = ?`);
                    values.push(subjectData[key]);
                }
            });

            if (fields.length === 0) {
                throw new Error('No fields to update');
            }

            values.push(id);

            const [result] = await db.execute(
                `UPDATE subjects SET ${fields.join(', ')} WHERE id = ?`,
                values
            );

            return result.affectedRows > 0;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Subject code already exists');
            }
            throw new Error(`Error updating subject: ${error.message}`);
        }
    }

    async delete(id) {
        try {
            const [result] = await db.execute(
                'DELETE FROM subjects WHERE id = ?',
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Error deleting subject: ${error.message}`);
        }
    }
}

module.exports = SubjectRepository;
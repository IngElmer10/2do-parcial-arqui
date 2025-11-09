const db = require('../../config/database');
const Group = require('../models/Group');

class GroupRepository {
    async findById(id) {
        try {
            const [rows] = await db.execute(
                `SELECT id, subject_id, code, name, term, description, is_active, created_at
                 FROM \`groups\`
                 WHERE id = ?`,
                [id]
            );
            return rows.length ? new Group(rows[0]) : null;
        } catch (error) {
            throw new Error(`Error fetching group: ${error.message}`);
        }
    }

    async findByCode(subjectId, code) {
        try {
            const [rows] = await db.execute(
                `SELECT id, subject_id, code, name, term, description, is_active, created_at
                 FROM \`groups\`
                 WHERE subject_id = ? AND code = ?`,
                [subjectId, code]
            );
            return rows.length ? new Group(rows[0]) : null;
        } catch (error) {
            throw new Error(`Error fetching group by code: ${error.message}`);
        }
    }

    async findBySubjectId(subjectId) {
        try {
            const [rows] = await db.execute(
                `SELECT id, subject_id, code, name, term, description, is_active, created_at
                 FROM \`groups\`
                 WHERE subject_id = ?
                 ORDER BY code`,
                [subjectId]
            );
            return rows.map(row => new Group(row));
        } catch (error) {
            throw new Error(`Error fetching groups for subject: ${error.message}`);
        }
    }

    async insert(groupData) {
        try {
            const { subject_id, code, name, term, description, is_active } = groupData;
            const [result] = await db.execute(
                `INSERT INTO \`groups\` (subject_id, code, name, term, description, is_active)
                 VALUES (?, ?, ?, ?, ?, ?)` ,
                [subject_id, code, name, term ?? null, description ?? null, is_active ?? true]
            );
            return result.insertId;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Group code already exists for this subject');
            }
            throw new Error(`Error creating group: ${error.message}`);
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
                `UPDATE \`groups\` SET ${fields.join(', ')} WHERE id = ?`,
                values
            );

            return result.affectedRows > 0;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Group code already exists for this subject');
            }
            throw new Error(`Error updating group: ${error.message}`);
        }
    }

    async delete(id) {
        try {
            const [result] = await db.execute(
                'DELETE FROM \`groups\` WHERE id = ?',
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Error deleting group: ${error.message}`);
        }
    }
}

module.exports = GroupRepository;

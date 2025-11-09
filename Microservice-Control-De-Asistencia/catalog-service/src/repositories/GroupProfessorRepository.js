const db = require('../../config/database');
const GroupProfessor = require('../models/GroupProfessor');
const Group = require('../models/Group');
const Subject = require('../models/Subject');

class GroupProfessorRepository {
    async findByGroupId(groupId) {
        try {
            const [rows] = await db.execute(
                `SELECT gp.id, gp.group_id, gp.professor_id, gp.assigned_at
                 FROM group_professors gp
                 WHERE gp.group_id = ?
                 ORDER BY gp.assigned_at`,
                [groupId]
            );
            return rows.map(row => new GroupProfessor(row));
        } catch (error) {
            throw new Error(`Error fetching professors for group: ${error.message}`);
        }
    }

    async findGroupsByProfessorId(professorId) {
        try {
            const [rows] = await db.execute(
                `SELECT gp.id, gp.group_id, gp.professor_id, gp.assigned_at,
                        g.subject_id, g.code AS group_code, g.name AS group_name,
                        g.term, g.description AS group_description, g.is_active, g.created_at AS group_created_at,
                        s.code AS subject_code, s.name AS subject_name, s.description AS subject_description,
                        s.created_at AS subject_created_at
                 FROM group_professors gp
                 JOIN \`groups\` g ON gp.group_id = g.id
                 JOIN subjects s ON g.subject_id = s.id
                 WHERE gp.professor_id = ?
                 ORDER BY s.name, g.code`,
                [professorId]
            );

            return rows.map(row => ({
                groupProfessor: new GroupProfessor({
                    id: row.id,
                    group_id: row.group_id,
                    professor_id: row.professor_id,
                    assigned_at: row.assigned_at,
                    subject_id: row.subject_id,
                    subject_code: row.subject_code,
                    subject_name: row.subject_name
                }),
                group: new Group({
                    id: row.group_id,
                    subject_id: row.subject_id,
                    code: row.group_code,
                    name: row.group_name,
                    term: row.term,
                    description: row.group_description,
                    is_active: row.is_active,
                    created_at: row.group_created_at
                }),
                subject: new Subject({
                    id: row.subject_id,
                    code: row.subject_code,
                    name: row.subject_name,
                    description: row.subject_description,
                    created_at: row.subject_created_at
                })
            }));
        } catch (error) {
            throw new Error(`Error fetching groups for professor: ${error.message}`);
        }
    }

    async assignProfessorToGroup(groupId, professorId) {
        try {
            const [existing] = await db.execute(
                'SELECT id FROM group_professors WHERE group_id = ? AND professor_id = ? LIMIT 1',
                [groupId, professorId]
            );

            if (existing.length > 0) {
                throw new Error('Professor is already assigned to this group');
            }

            const [result] = await db.execute(
                'INSERT INTO group_professors (group_id, professor_id) VALUES (?, ?)',
                [groupId, professorId]
            );

            return result.insertId;
        } catch (error) {
            if (error.message.includes('already assigned')) {
                throw error;
            }
            throw new Error(`Error assigning professor to group: ${error.message}`);
        }
    }

    async removeProfessorFromGroup(groupId, professorId) {
        try {
            const [result] = await db.execute(
                'DELETE FROM group_professors WHERE group_id = ? AND professor_id = ?',
                [groupId, professorId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Error removing professor from group: ${error.message}`);
        }
    }

    async isProfessorAssigned(groupId, professorId) {
        try {
            const [rows] = await db.execute(
                'SELECT id FROM group_professors WHERE group_id = ? AND professor_id = ? LIMIT 1',
                [groupId, professorId]
            );
            return rows.length > 0;
        } catch (error) {
            throw new Error(`Error checking professor assignment: ${error.message}`);
        }
    }
}

module.exports = GroupProfessorRepository;

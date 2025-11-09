const db = require('../../config/database');
const SubjectTeacher = require('../models/SubjectTeacher');

class TeacherAssignmentRepository {
    async findTeachersBySubjectId(subjectId) {
        try {
            const [rows] = await db.execute(
                `SELECT st.id, st.professor_id, st.assigned_at 
                 FROM subject_teachers st 
                 WHERE st.subject_id = ? 
                 ORDER BY st.assigned_at`,
                [subjectId]
            );
            return rows.map(row => new SubjectTeacher(row));
        } catch (error) {
            throw new Error(`Error fetching teachers for subject: ${error.message}`);
        }
    }

    async findSubjectsByTeacherId(teacherId) {
        try {
            const [rows] = await db.execute(
                `SELECT st.id, st.subject_id, st.assigned_at 
                 FROM subject_teachers st 
                 WHERE st.professor_id = ? 
                 ORDER BY st.assigned_at`,
                [teacherId]
            );
            return rows.map(row => new SubjectTeacher(row));
        } catch (error) {
            throw new Error(`Error fetching subjects for teacher: ${error.message}`);
        }
    }

    async assignTeacherToSubject(subjectId, teacherId) {
        try {
            // Verificar si ya está asignado
            const [existing] = await db.execute(
                'SELECT id FROM subject_teachers WHERE subject_id = ? AND professor_id = ?',
                [subjectId, teacherId]
            );

            if (existing.length > 0) {
                throw new Error('Teacher is already assigned to this subject');
            }

            const [result] = await db.execute(
                'INSERT INTO subject_teachers (subject_id, professor_id) VALUES (?, ?)',
                [subjectId, teacherId]
            );

            return result.insertId;
        } catch (error) {
            if (error.message.includes('already assigned')) {
                throw error;
            }
            throw new Error(`Error assigning teacher: ${error.message}`);
        }
    }

    async removeTeacherFromSubject(subjectId, teacherId) {
        try {
            const [result] = await db.execute(
                'DELETE FROM subject_teachers WHERE subject_id = ? AND professor_id = ?',
                [subjectId, teacherId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Error removing teacher from subject: ${error.message}`);
        }
    }

    async isTeacherAssigned(subjectId, teacherId) {
        try {
            const [rows] = await db.execute(
                'SELECT id FROM subject_teachers WHERE subject_id = ? AND professor_id = ?',
                [subjectId, teacherId]
            );
            return rows.length > 0;
        } catch (error) {
            throw new Error(`Error checking assignment: ${error.message}`);
        }
    }
}

module.exports = TeacherAssignmentRepository;
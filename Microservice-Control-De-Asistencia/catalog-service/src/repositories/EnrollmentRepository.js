const db = require('../../config/database');
const SubjectStudent = require('../models/SubjectStudent');

class EnrollmentRepository {
    async findStudentsBySubjectId(subjectId) {
        try {
            const [rows] = await db.execute(
                `SELECT ss.id, ss.student_id, ss.enrolled_at 
                 FROM subject_students ss 
                 WHERE ss.subject_id = ? 
                 ORDER BY ss.enrolled_at`,
                [subjectId]
            );
            return rows.map(row => new SubjectStudent(row));
        } catch (error) {
            throw new Error(`Error fetching students for subject: ${error.message}`);
        }
    }

    async findSubjectsByStudentId(studentId) {
        try {
            const [rows] = await db.execute(
                `SELECT ss.id, ss.subject_id, ss.enrolled_at 
                 FROM subject_students ss 
                 WHERE ss.student_id = ? 
                 ORDER BY ss.enrolled_at`,
                [studentId]
            );
            return rows.map(row => new SubjectStudent(row));
        } catch (error) {
            throw new Error(`Error fetching subjects for student: ${error.message}`);
        }
    }

    async addStudentToSubject(subjectId, studentId) {
        try {
            // Verificar si ya está inscrito
            const [existing] = await db.execute(
                'SELECT id FROM subject_students WHERE subject_id = ? AND student_id = ?',
                [subjectId, studentId]
            );

            if (existing.length > 0) {
                throw new Error('Student is already enrolled in this subject');
            }

            const [result] = await db.execute(
                'INSERT INTO subject_students (subject_id, student_id) VALUES (?, ?)',
                [subjectId, studentId]
            );

            return result.insertId;
        } catch (error) {
            if (error.message.includes('already enrolled')) {
                throw error;
            }
            throw new Error(`Error enrolling student: ${error.message}`);
        }
    }

    async removeStudentFromSubject(subjectId, studentId) {
        try {
            const [result] = await db.execute(
                'DELETE FROM subject_students WHERE subject_id = ? AND student_id = ?',
                [subjectId, studentId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Error removing student from subject: ${error.message}`);
        }
    }

    async isStudentEnrolled(subjectId, studentId) {
        try {
            const [rows] = await db.execute(
                'SELECT id FROM subject_students WHERE subject_id = ? AND student_id = ?',
                [subjectId, studentId]
            );
            return rows.length > 0;
        } catch (error) {
            throw new Error(`Error checking enrollment: ${error.message}`);
        }
    }

    async getEnrollmentCount(subjectId) {
        try {
            const [rows] = await db.execute(
                'SELECT COUNT(*) as count FROM subject_students WHERE subject_id = ?',
                [subjectId]
            );
            return rows[0].count;
        } catch (error) {
            throw new Error(`Error getting enrollment count: ${error.message}`);
        }
    }
}

module.exports = EnrollmentRepository;
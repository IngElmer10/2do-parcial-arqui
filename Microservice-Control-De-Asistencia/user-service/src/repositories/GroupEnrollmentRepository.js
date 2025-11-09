const db = require('../../config/database');
const GroupEnrollment = require('../models/GroupEnrollment');
const Student = require('../models/Student');

class GroupEnrollmentRepository {
    mapRowToEnrollment(row) {
        const student = new Student({
            id: row.student_id,
            user_id: row.student_user_id,
            student_code: row.student_code,
            career: row.career,
            is_active: row.student_is_active,
            created_at: row.student_created_at,
            username: row.username,
            email: row.email,
            full_name: row.full_name
        });

        return new GroupEnrollment({
            id: row.enrollment_id,
            group_id: row.group_id,
            student_id: row.student_id,
            status: row.status,
            enrolled_at: row.enrolled_at,
            student
        });
    }

    async findByGroupId(groupId) {
        try {
            const [rows] = await db.execute(
                `SELECT ge.id AS enrollment_id,
                        ge.group_id,
                        ge.student_id,
                        ge.status,
                        ge.enrolled_at,
                        s.user_id AS student_user_id,
                        s.student_code,
                        s.career,
                        s.is_active AS student_is_active,
                        s.created_at AS student_created_at,
                        u.username,
                        u.email,
                        u.full_name
                 FROM group_enrollments ge
                 JOIN students s ON ge.student_id = s.id
                 JOIN users u ON s.user_id = u.id
                 WHERE ge.group_id = ? AND ge.status = 'active'
                   AND s.is_active = TRUE AND u.is_active = TRUE
                 ORDER BY u.full_name`,
                [groupId]
            );

            return rows.map(row => this.mapRowToEnrollment(row));
        } catch (error) {
            throw new Error(`Error fetching group enrollments: ${error.message}`);
        }
    }

    async findByStudentId(studentId) {
        try {
            const [rows] = await db.execute(
                `SELECT ge.id AS enrollment_id,
                        ge.group_id,
                        ge.student_id,
                        ge.status,
                        ge.enrolled_at,
                        s.user_id AS student_user_id,
                        s.student_code,
                        s.career,
                        s.is_active AS student_is_active,
                        s.created_at AS student_created_at,
                        u.username,
                        u.email,
                        u.full_name
                 FROM group_enrollments ge
                 JOIN students s ON ge.student_id = s.id
                 JOIN users u ON s.user_id = u.id
                 WHERE ge.student_id = ? AND ge.status = 'active'
                   AND s.is_active = TRUE AND u.is_active = TRUE
                 ORDER BY ge.enrolled_at DESC`,
                [studentId]
            );

            return rows.map(row => this.mapRowToEnrollment(row));
        } catch (error) {
            throw new Error(`Error fetching student enrollments: ${error.message}`);
        }
    }

    async findEnrollment(groupId, studentId) {
        try {
            const [rows] = await db.execute(
                `SELECT ge.id AS enrollment_id,
                        ge.group_id,
                        ge.student_id,
                        ge.status,
                        ge.enrolled_at,
                        s.user_id AS student_user_id,
                        s.student_code,
                        s.career,
                        s.is_active AS student_is_active,
                        s.created_at AS student_created_at,
                        u.username,
                        u.email,
                        u.full_name
                 FROM group_enrollments ge
                 JOIN students s ON ge.student_id = s.id
                 JOIN users u ON s.user_id = u.id
                 WHERE ge.group_id = ? AND ge.student_id = ?
                 LIMIT 1`,
                [groupId, studentId]
            );

            return rows.length ? this.mapRowToEnrollment(rows[0]) : null;
        } catch (error) {
            throw new Error(`Error fetching enrollment: ${error.message}`);
        }
    }

    async insert(groupId, studentId) {
        try {
            await db.execute(
                `INSERT INTO group_enrollments (group_id, student_id)
                 VALUES (?, ?)
                 ON DUPLICATE KEY UPDATE status = 'active', enrolled_at = CURRENT_TIMESTAMP`,
                [groupId, studentId]
            );

            return await this.findEnrollment(groupId, studentId);
        } catch (error) {
            throw new Error(`Error enrolling student into group: ${error.message}`);
        }
    }

    async deactivate(groupId, studentId) {
        try {
            const [result] = await db.execute(
                `UPDATE group_enrollments
                 SET status = 'inactive'
                 WHERE group_id = ? AND student_id = ?`,
                [groupId, studentId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Error removing student from group: ${error.message}`);
        }
    }
}

module.exports = GroupEnrollmentRepository;

const db = require('../../config/database');
const AttendanceSession = require('../models/AttendanceSession');

class AttendanceSessionRepository {
    async findById(id) {
        try {
            const [rows] = await db.execute(
                `SELECT id, group_id, subject_id, professor_id, session_date, start_time, end_time, status,
                        session_type, exam_title, exam_duration_minutes, exam_is_strict, created_at 
                 FROM attendance_sessions 
                 WHERE id = ?`,
                [id]
            );
            return rows.length > 0 ? new AttendanceSession(rows[0]) : null;
        } catch (error) {
            throw new Error(`Error fetching attendance session: ${error.message}`);
        }
    }

    async findByGroupAndDate(groupId, date) {
        try {
            const [rows] = await db.execute(
                `SELECT id, group_id, subject_id, professor_id, session_date, start_time, end_time, status,
                        session_type, exam_title, exam_duration_minutes, exam_is_strict, created_at
                 FROM attendance_sessions 
                 WHERE group_id = ? AND session_date = ?`,
                [groupId, date]
            );
            return rows.length > 0 ? new AttendanceSession(rows[0]) : null;
        } catch (error) {
            throw new Error(`Error fetching attendance session: ${error.message}`);
        }
    }

    async findOpenSessionByGroupAndDate(groupId, date) {
        try {
            const [rows] = await db.execute(
                `SELECT id, group_id, subject_id, professor_id, session_date, start_time, end_time, status,
                        session_type, exam_title, exam_duration_minutes, exam_is_strict, created_at
                 FROM attendance_sessions 
                 WHERE group_id = ? AND session_date = ? AND status = 'open'`,
                [groupId, date]
            );
            return rows.length > 0 ? new AttendanceSession(rows[0]) : null;
        } catch (error) {
            throw new Error(`Error fetching open session: ${error.message}`);
        }
    }

    async findSessionsByGroup(groupId) {
        try {
            const [rows] = await db.execute(
                `SELECT id, group_id, subject_id, professor_id, session_date, start_time, end_time, status,
                        session_type, exam_title, exam_duration_minutes, exam_is_strict, created_at
                 FROM attendance_sessions 
                 WHERE group_id = ? 
                 ORDER BY session_date DESC, COALESCE(start_time, '00:00'), created_at DESC`,
                [groupId]
            );
            return rows.map(row => new AttendanceSession(row));
        } catch (error) {
            throw new Error(`Error fetching sessions for subject: ${error.message}`);
        }
    }

    async findSessionsByProfessor(professorId) {
        try {
            const [rows] = await db.execute(
                `SELECT id, group_id, subject_id, professor_id, session_date, start_time, end_time, status,
                        session_type, exam_title, exam_duration_minutes, exam_is_strict, created_at 
                 FROM attendance_sessions 
                 WHERE professor_id = ? 
                 ORDER BY session_date DESC, COALESCE(start_time, '00:00'), created_at DESC`,
                [professorId]
            );
            return rows.map(row => new AttendanceSession(row));
        } catch (error) {
            throw new Error(`Error fetching sessions for professor: ${error.message}`);
        }
    }

    async insert(sessionData) {
        try {
            const {
                group_id,
                subject_id,
                professor_id,
                session_date,
                start_time,
                end_time,
                status,
                session_type,
                exam_title,
                exam_duration_minutes,
                exam_is_strict
            } = sessionData;
            
            const examIsStrictValue = exam_is_strict === null || exam_is_strict === undefined
                ? null
                : exam_is_strict ? 1 : 0;

            const [result] = await db.execute(
                `INSERT INTO attendance_sessions 
                    (group_id, subject_id, professor_id, session_date, start_time, end_time, status,
                     session_type, exam_title, exam_duration_minutes, exam_is_strict) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    group_id,
                    subject_id,
                    professor_id,
                    session_date,
                    start_time,
                    end_time,
                    status,
                    session_type,
                    exam_title,
                    exam_duration_minutes,
                    examIsStrictValue
                ]
            );
            
            return result.insertId;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Session already exists for this group and schedule');
            }
            throw new Error(`Error creating attendance session: ${error.message}`);
        }
    }

    async updateStatus(id, status) {
        try {
            const [result] = await db.execute(
                'UPDATE attendance_sessions SET status = ? WHERE id = ?',
                [status, id]
            );
            
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Error updating session status: ${error.message}`);
        }
    }

    async closeSession(id) {
        return await this.updateStatus(id, 'closed');
    }

    async delete(id) {
        try {
            const [result] = await db.execute(
                'DELETE FROM attendance_sessions WHERE id = ?',
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Error deleting session: ${error.message}`);
        }
    }
}

module.exports = AttendanceSessionRepository;
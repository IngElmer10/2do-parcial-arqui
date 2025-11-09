const db = require('../../config/database');
const AttendanceRecord = require('../models/AttendanceRecord');

class AttendanceRecordRepository {
    async findBySessionId(sessionId) {
        try {
            const [rows] = await db.execute(
                `SELECT id, session_id, student_id, status, recorded_at 
                 FROM attendance_records 
                 WHERE session_id = ? 
                 ORDER BY recorded_at`,
                [sessionId]
            );
            return rows.map(row => new AttendanceRecord(row));
        } catch (error) {
            throw new Error(`Error fetching attendance records: ${error.message}`);
        }
    }

    async findByStudentAndSession(studentId, sessionId) {
        try {
            const [rows] = await db.execute(
                `SELECT id, session_id, student_id, status, recorded_at 
                 FROM attendance_records 
                 WHERE student_id = ? AND session_id = ?`,
                [studentId, sessionId]
            );
            return rows.length > 0 ? new AttendanceRecord(rows[0]) : null;
        } catch (error) {
            throw new Error(`Error fetching attendance record: ${error.message}`);
        }
    }

    async findByStudentAndSubject(studentId, subjectId) {
        try {
            const [rows] = await db.execute(
                `SELECT ar.id, ar.session_id, ar.student_id, ar.status, ar.recorded_at 
                 FROM attendance_records ar
                 JOIN attendance_sessions s ON ar.session_id = s.id
                 WHERE ar.student_id = ? AND s.subject_id = ?
                 ORDER BY s.session_date DESC, ar.recorded_at DESC`,
                [studentId, subjectId]
            );
            return rows.map(row => new AttendanceRecord(row));
        } catch (error) {
            throw new Error(`Error fetching student attendance: ${error.message}`);
        }
    }

    async insert(recordData) {
        try {
            const { session_id, student_id, status } = recordData;
            
            const [result] = await db.execute(
                'INSERT INTO attendance_records (session_id, student_id, status) VALUES (?, ?, ?)',
                [session_id, student_id, status]
            );
            
            return result.insertId;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Attendance record already exists for this student and session');
            }
            throw new Error(`Error creating attendance record: ${error.message}`);
        }
    }

    async bulkInsert(records) {
        try {
            if (records.length === 0) {
                return [];
            }

            const values = records.map(record => 
                [record.session_id, record.student_id, record.status]
            );

            const placeholders = records.map(() => '(?, ?, ?)').join(', ');
            
            const [result] = await db.execute(
                `INSERT INTO attendance_records (session_id, student_id, status) 
                 VALUES ${placeholders}`,
                values.flat()
            );
            
            return result.affectedRows;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('One or more attendance records already exist');
            }
            throw new Error(`Error creating attendance records: ${error.message}`);
        }
    }

    async updateStatus(sessionId, studentId, status) {
        try {
            const [result] = await db.execute(
                'UPDATE attendance_records SET status = ? WHERE session_id = ? AND student_id = ?',
                [status, sessionId, studentId]
            );
            
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Error updating attendance record: ${error.message}`);
        }
    }

    async deleteBySession(sessionId) {
        try {
            const [result] = await db.execute(
                'DELETE FROM attendance_records WHERE session_id = ?',
                [sessionId]
            );
            return result.affectedRows;
        } catch (error) {
            throw new Error(`Error deleting attendance records: ${error.message}`);
        }
    }

    async getAttendanceStatsByStudent(studentId) {
        try {
            const [rows] = await db.execute(
                `SELECT 
                    s.subject_id,
                    sub.name as subject_name,
                    COUNT(ar.id) as total_sessions,
                    SUM(CASE WHEN ar.status = 'present' THEN 1 ELSE 0 END) as present_count,
                    ROUND((SUM(CASE WHEN ar.status = 'present' THEN 1 ELSE 0 END) / COUNT(ar.id)) * 100, 2) as attendance_percentage
                 FROM attendance_records ar
                 JOIN attendance_sessions s ON ar.session_id = s.id
                 JOIN catalog_db.subjects sub ON s.subject_id = sub.id
                 WHERE ar.student_id = ?
                 GROUP BY s.subject_id, sub.name`,
                [studentId]
            );
            return rows;
        } catch (error) {
            throw new Error(`Error fetching attendance statistics: ${error.message}`);
        }
    }
}

module.exports = AttendanceRecordRepository;
const DateUtils = require('../utils/dateUtils');

class AttendanceSession {
    constructor({
        id,
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
        exam_is_strict,
        created_at
    }) {
        this.id = id;
        this.group_id = group_id;
        this.subject_id = subject_id;
        this.professor_id = professor_id;
        this.session_date = session_date;
        this.start_time = start_time;
        this.end_time = end_time;
        this.status = status || 'open';
        this.session_type = (session_type || 'normal').toLowerCase();
        this.exam_title = exam_title || null;
        this.exam_duration_minutes = exam_duration_minutes ?? null;
        this.exam_is_strict = exam_is_strict === undefined || exam_is_strict === null
            ? null
            : Boolean(exam_is_strict);
        this.created_at = created_at;
    }

    toJSON() {
        return {
            id: this.id,
            group_id: this.group_id,
            subject_id: this.subject_id,
            professor_id: this.professor_id,
            session_date: this.session_date,
            start_time: this.start_time,
            end_time: this.end_time,
            status: this.status,
            session_type: this.session_type,
            exam_title: this.exam_title,
            exam_duration_minutes: this.exam_duration_minutes,
            exam_is_strict: this.exam_is_strict,
            created_at: this.created_at
        };
    }

    validate() {
        if (!this.group_id || !this.subject_id || !this.professor_id || !this.session_date) {
            throw new Error('Group ID, Subject ID, Professor ID, and session date are required');
        }

        if (!DateUtils.isValidDate(this.session_date)) {
            throw new Error('Invalid session date format. Use YYYY-MM-DD');
        }

        if (this.start_time && !DateUtils.isValidTime(this.start_time)) {
            throw new Error('Invalid start time format. Use HH:MM');
        }

        if (this.end_time && !DateUtils.isValidTime(this.end_time)) {
            throw new Error('Invalid end time format. Use HH:MM');
        }

        if (this.start_time && this.end_time && this.start_time >= this.end_time) {
            throw new Error('End time must be greater than start time');
        }

        if (!['open', 'closed'].includes(this.status)) {
            throw new Error('Status must be either "open" or "closed"');
        }

        if (!['normal', 'exam'].includes(this.session_type)) {
            throw new Error('Session type must be either "normal" or "exam"');
        }

        if (this.session_type === 'exam') {
            if (!this.exam_title) {
                throw new Error('Exam sessions require an exam title');
            }

            if (typeof this.exam_duration_minutes !== 'number' || this.exam_duration_minutes <= 0) {
                throw new Error('Exam sessions require a positive duration in minutes');
            }
        }
    }

    close() {
        if (this.status === 'closed') {
            throw new Error('Session is already closed');
        }
        this.status = 'closed';
    }

    isOpen() {
        return this.status === 'open';
    }

    isToday() {
        return DateUtils.isToday(this.session_date);
    }
}

module.exports = AttendanceSession;
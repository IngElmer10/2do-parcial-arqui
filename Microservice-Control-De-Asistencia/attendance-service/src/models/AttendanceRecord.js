class AttendanceRecord {
    constructor({ id, session_id, student_id, status, recorded_at }) {
        this.id = id;
        this.session_id = session_id;
        this.student_id = student_id;
        this.status = status;
        this.recorded_at = recorded_at;
    }

    toJSON() {
        return {
            id: this.id,
            session_id: this.session_id,
            student_id: this.student_id,
            status: this.status,
            recorded_at: this.recorded_at
        };
    }

    validate() {
        if (!this.session_id || !this.student_id || !this.status) {
            throw new Error('Session ID, Student ID, and status are required');
        }

        if (!['present', 'absent'].includes(this.status)) {
            throw new Error('Status must be either "present" or "absent"');
        }
    }

    markPresent() {
        this.status = 'present';
    }

    markAbsent() {
        this.status = 'absent';
    }

    isPresent() {
        return this.status === 'present';
    }
}

module.exports = AttendanceRecord;
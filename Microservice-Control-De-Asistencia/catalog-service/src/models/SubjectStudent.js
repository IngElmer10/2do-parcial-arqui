class SubjectStudent {
    constructor({ id, subject_id, student_id, enrolled_at }) {
        this.id = id;
        this.subject_id = subject_id;
        this.student_id = student_id;
        this.enrolled_at = enrolled_at;
    }

    toJSON() {
        return {
            id: this.id,
            subject_id: this.subject_id,
            student_id: this.student_id,
            enrolled_at: this.enrolled_at
        };
    }

    validate() {
        if (!this.subject_id || !this.student_id) {
            throw new Error('Subject ID and Student ID are required');
        }
    }
}

module.exports = SubjectStudent;
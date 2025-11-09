class SubjectTeacher {
    constructor({ id, subject_id, professor_id, assigned_at }) {
        this.id = id;
        this.subject_id = subject_id;
        this.professor_id = professor_id;
        this.assigned_at = assigned_at;
    }

    toJSON() {
        return {
            id: this.id,
            subject_id: this.subject_id,
            professor_id: this.professor_id,
            assigned_at: this.assigned_at
        };
    }

    validate() {
        if (!this.subject_id || !this.professor_id) {
            throw new Error('Subject ID and Professor ID are required');
        }
    }
}

module.exports = SubjectTeacher;
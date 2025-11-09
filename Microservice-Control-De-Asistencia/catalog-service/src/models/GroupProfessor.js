class GroupProfessor {
    constructor({ id, group_id, professor_id, assigned_at, subject_id, subject_code, subject_name }) {
        this.id = id;
        this.group_id = group_id;
        this.professor_id = professor_id;
        this.assigned_at = assigned_at;
        this.subject_id = subject_id;
        this.subject_code = subject_code;
        this.subject_name = subject_name;
    }

    toJSON() {
        const base = {
            id: this.id,
            group_id: this.group_id,
            professor_id: this.professor_id,
            assigned_at: this.assigned_at
        };

        if (this.subject_id !== undefined) {
            base.subject = {
                id: this.subject_id,
                code: this.subject_code,
                name: this.subject_name
            };
        }

        return base;
    }

    validate() {
        if (!this.group_id || !this.professor_id) {
            throw new Error('Group ID and Professor ID are required');
        }
    }
}

module.exports = GroupProfessor;

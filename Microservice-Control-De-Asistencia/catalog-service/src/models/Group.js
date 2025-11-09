class Group {
    constructor({ id, subject_id, code, name, term, description, is_active, created_at }) {
        this.id = id;
        this.subject_id = subject_id;
        this.code = code;
        this.name = name;
        this.term = term;
        this.description = description;
        this.is_active = is_active !== undefined ? Boolean(is_active) : true;
        this.created_at = created_at;
    }

    toJSON() {
        return {
            id: this.id,
            subject_id: this.subject_id,
            code: this.code,
            name: this.name,
            term: this.term,
            description: this.description,
            is_active: this.is_active,
            created_at: this.created_at
        };
    }

    validate() {
        if (!this.subject_id) {
            throw new Error('Subject ID is required');
        }
        if (!this.code || !this.name) {
            throw new Error('Group code and name are required');
        }
        if (this.code.length > 20) {
            throw new Error('Group code must be 20 characters or less');
        }
        if (this.name.length > 100) {
            throw new Error('Group name must be 100 characters or less');
        }
    }
}

module.exports = Group;

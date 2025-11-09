class Subject {
    constructor({ id, code, name, description, created_at }) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.description = description;
        this.created_at = created_at;
    }

    toJSON() {
        return {
            id: this.id,
            code: this.code,
            name: this.name,
            description: this.description,
            created_at: this.created_at
        };
    }

    validate() {
        if (!this.code || !this.name) {
            throw new Error('Code and name are required');
        }
        if (this.code.length > 20) {
            throw new Error('Code must be 20 characters or less');
        }
        if (this.name.length > 100) {
            throw new Error('Name must be 100 characters or less');
        }
    }
}

module.exports = Subject;
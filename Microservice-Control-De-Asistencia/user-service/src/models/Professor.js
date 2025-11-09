class Professor {
    constructor({
        id,
        user_id,
        employee_code,
        department,
        is_active,
        created_at,
        username,
        email,
        full_name
    }) {
        this.id = id;
        this.user_id = user_id;
        this.employee_code = employee_code;
        this.department = department;
        this.is_active = is_active !== undefined ? Boolean(is_active) : true;
        this.created_at = created_at;
        this.username = username;
        this.email = email;
        this.full_name = full_name;
    }

    toJSON() {
        return {
            id: this.id,
            user_id: this.user_id,
            employee_code: this.employee_code,
            department: this.department,
            is_active: this.is_active,
            created_at: this.created_at,
            username: this.username,
            email: this.email,
            full_name: this.full_name
        };
    }
}

module.exports = Professor;

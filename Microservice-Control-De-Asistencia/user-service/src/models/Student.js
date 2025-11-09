class Student {
    constructor({
        id,
        user_id,
        student_code,
        career,
        is_active,
        created_at,
        username,
        email,
        full_name
    }) {
        this.id = id;
        this.user_id = user_id;
        this.student_code = student_code;
        this.career = career;
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
            student_code: this.student_code,
            career: this.career,
            is_active: this.is_active,
            created_at: this.created_at,
            username: this.username,
            email: this.email,
            full_name: this.full_name
        };
    }
}

module.exports = Student;

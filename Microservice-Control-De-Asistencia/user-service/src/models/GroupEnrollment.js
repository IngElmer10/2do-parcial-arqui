const Student = require('./Student');

class GroupEnrollment {
    constructor({ id, group_id, student_id, status, enrolled_at, student }) {
        this.id = id;
        this.group_id = group_id;
        this.student_id = student_id;
        this.status = status;
        this.enrolled_at = enrolled_at;
        this.student = student instanceof Student ? student : (student ? new Student(student) : undefined);
    }

    toJSON() {
        return {
            id: this.id,
            group_id: this.group_id,
            student_id: this.student_id,
            status: this.status,
            enrolled_at: this.enrolled_at,
            student: this.student ? this.student.toJSON() : undefined
        };
    }
}

module.exports = GroupEnrollment;

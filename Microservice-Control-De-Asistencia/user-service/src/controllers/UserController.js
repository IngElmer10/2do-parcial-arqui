const UserService = require('../services/UserService');
const ProfessorRepository = require('../repositories/ProfessorRepository');
const StudentRepository = require('../repositories/StudentRepository');
const GroupEnrollmentRepository = require('../repositories/GroupEnrollmentRepository');
const HttpUtils = require('../utils/httpUtils');

class UserController {
    constructor() {
        this.userService = new UserService();
        this.professorRepository = new ProfessorRepository();
        this.studentRepository = new StudentRepository();
        this.groupEnrollmentRepository = new GroupEnrollmentRepository();
        this.handleRequest = this.handleRequest.bind(this);
    }

    async handleRequest(req, res) {
        if (HttpUtils.handleCors(req, res)) return;

        const { method, url } = req;
        const urlParts = url.split('/').filter(Boolean);

        try {
            if (urlParts.length === 0) {
                return HttpUtils.sendError(res, 404, 'Endpoint not found');
            }

            const resource = urlParts[0];

            if (resource === 'login' && method === 'POST') {
                return this.handleLogin(req, res);
            }

            if (resource === 'users') {
                return this.routeUsers(method, urlParts, req, res);
            }

            if (resource === 'professors') {
                return this.routeProfessors(method, urlParts, req, res);
            }

            if (resource === 'students') {
                return this.routeStudents(method, urlParts, req, res);
            }

            if (resource === 'groups') {
                return this.routeGroupEnrollments(method, urlParts, req, res);
            }

            HttpUtils.sendError(res, 404, 'Endpoint not found');
        } catch (error) {
            console.error('Controller error:', error);
            HttpUtils.sendError(res, 500, 'Internal server error');
        }
    }

    async routeUsers(method, urlParts, req, res) {
        if (urlParts.length === 1) {
            if (method === 'GET') return this.handleGetAllUsers(req, res);
            if (method === 'POST') return this.handleCreateUser(req, res);
        }

        if (urlParts.length === 2) {
            const userId = urlParts[1];
            if (method === 'GET') return this.handleGetUserById(req, res, userId);
            if (method === 'PUT') return this.handleUpdateUser(req, res, userId);
            if (method === 'DELETE') return this.handleDeleteUser(req, res, userId);
        }

        HttpUtils.sendError(res, 404, 'Endpoint not found');
    }

    async routeProfessors(method, urlParts, req, res) {
        if (urlParts.length === 1 && method === 'GET') {
            return this.handleGetAllProfessors(req, res);
        }

        if (urlParts.length === 1 && method === 'POST') {
            return this.handleCreateProfessor(req, res);
        }

        if (urlParts.length === 2) {
            const professorId = urlParts[1];
            if (method === 'GET') return this.handleGetProfessorById(req, res, professorId);
            if (method === 'PUT') return this.handleUpdateProfessor(req, res, professorId);
            if (method === 'DELETE') return this.handleDeactivateProfessor(req, res, professorId);
        }

        HttpUtils.sendError(res, 404, 'Endpoint not found');
    }

    async routeStudents(method, urlParts, req, res) {
        if (urlParts.length === 1 && method === 'GET') {
            return this.handleGetAllStudents(req, res);
        }

        if (urlParts.length === 1 && method === 'POST') {
            return this.handleCreateStudent(req, res);
        }

        if (urlParts.length === 2) {
            const studentId = urlParts[1];
            if (method === 'GET') return this.handleGetStudentById(req, res, studentId);
            if (method === 'PUT') return this.handleUpdateStudent(req, res, studentId);
            if (method === 'DELETE') return this.handleDeactivateStudent(req, res, studentId);
        }

        if (urlParts.length === 3 && urlParts[2] === 'groups' && method === 'GET') {
            const studentId = urlParts[1];
            return this.handleGetStudentGroups(req, res, studentId);
        }

        HttpUtils.sendError(res, 404, 'Endpoint not found');
    }

    async routeGroupEnrollments(method, urlParts, req, res) {
        if (urlParts.length === 3 && urlParts[2] === 'students') {
            const groupId = urlParts[1];
            if (method === 'GET') return this.handleGetGroupEnrollments(req, res, groupId);
            if (method === 'POST') return this.handleEnrollStudentInGroup(req, res, groupId);
        }

        if (urlParts.length === 4 && urlParts[2] === 'students' && method === 'DELETE') {
            const groupId = urlParts[1];
            const studentId = urlParts[3];
            return this.handleRemoveStudentFromGroup(req, res, groupId, studentId);
        }

        HttpUtils.sendError(res, 404, 'Endpoint not found');
    }

    async handleLogin(req, res) {
        try {
            const body = await HttpUtils.parseRequestBody(req);
            const { username, password } = body;

            if (!username || !password) {
                return HttpUtils.sendError(res, 400, 'Username and password are required');
            }

            const user = await this.userService.authenticate(username, password);
            const userData = user.toSafeJSON();

            if (userData.role === 'professor') {
                const professor = await this.professorRepository.findByUserId(userData.id);
                if (!professor) {
                    return HttpUtils.sendError(res, 403, 'Professor profile not found for this user');
                }
                userData.professor_profile = professor.toJSON();
            } else if (userData.role === 'student') {
                const student = await this.studentRepository.findByUserId(userData.id);
                if (!student) {
                    return HttpUtils.sendError(res, 403, 'Student profile not found for this user');
                }
                userData.student_profile = student.toJSON();
            }

            HttpUtils.sendResponse(res, 200, {
                message: 'Login successful',
                user: userData
            });
        } catch (error) {
            HttpUtils.sendError(res, 401, error.message);
        }
    }

    async handleGetAllUsers(req, res) {
        try {
            const users = await this.userService.getAllActiveUsers();
            HttpUtils.sendResponse(res, 200, users.map(user => user.toSafeJSON()));
        } catch (error) {
            HttpUtils.sendError(res, 500, error.message);
        }
    }

    async handleGetUserById(req, res, userId) {
        try {
            const id = parseInt(userId, 10);
            if (isNaN(id)) {
                return HttpUtils.sendError(res, 400, 'Invalid user ID');
            }

            const user = await this.userService.getUserById(id);
            HttpUtils.sendResponse(res, 200, user.toSafeJSON());
        } catch (error) {
            if (error.message === 'User not found') {
                HttpUtils.sendError(res, 404, error.message);
            } else {
                HttpUtils.sendError(res, 500, error.message);
            }
        }
    }

    async handleCreateUser(req, res) {
        try {
            const body = await HttpUtils.parseRequestBody(req);
            const user = await this.userService.createUser(body);
            HttpUtils.sendResponse(res, 201, user.toSafeJSON());
        } catch (error) {
            if (error.message.includes('required') || error.message.includes('Invalid role') || error.message.includes('already exists')) {
                HttpUtils.sendError(res, 400, error.message);
            } else {
                HttpUtils.sendError(res, 500, error.message);
            }
        }
    }

    async handleUpdateUser(req, res, userId) {
        try {
            const id = parseInt(userId, 10);
            if (isNaN(id)) {
                return HttpUtils.sendError(res, 400, 'Invalid user ID');
            }

            const body = await HttpUtils.parseRequestBody(req);
            const user = await this.userService.updateUser(id, body);
            HttpUtils.sendResponse(res, 200, user.toSafeJSON());
        } catch (error) {
            if (error.message === 'User not found or no changes made' || error.message === 'Invalid role') {
                HttpUtils.sendError(res, 400, error.message);
            } else if (error.message === 'User not found') {
                HttpUtils.sendError(res, 404, error.message);
            } else {
                HttpUtils.sendError(res, 500, error.message);
            }
        }
    }

    async handleDeleteUser(req, res, userId) {
        try {
            const id = parseInt(userId, 10);
            if (isNaN(id)) {
                return HttpUtils.sendError(res, 400, 'Invalid user ID');
            }

            const success = await this.userService.deleteUser(id);
            if (!success) {
                return HttpUtils.sendError(res, 404, 'User not found');
            }

            HttpUtils.sendResponse(res, 200, { message: 'User deleted successfully' });
        } catch (error) {
            HttpUtils.sendError(res, 500, error.message);
        }
    }

    async handleGetAllProfessors(req, res) {
        try {
            const professors = await this.professorRepository.findAll();
            HttpUtils.sendResponse(res, 200, professors.map(prof => prof.toJSON()));
        } catch (error) {
            HttpUtils.sendError(res, 500, error.message);
        }
    }

    async handleGetProfessorById(req, res, professorId) {
        try {
            const id = parseInt(professorId, 10);
            if (isNaN(id)) {
                return HttpUtils.sendError(res, 400, 'Invalid professor ID');
            }

            const professor = await this.professorRepository.findById(id);
            if (!professor) {
                return HttpUtils.sendError(res, 404, 'Professor not found');
            }

            HttpUtils.sendResponse(res, 200, professor.toJSON());
        } catch (error) {
            HttpUtils.sendError(res, 500, error.message);
        }
    }

    async handleCreateProfessor(req, res) {
        try {
            const body = await HttpUtils.parseRequestBody(req);
            const { user_id, employee_code, department } = body;

            if (!user_id || !employee_code) {
                return HttpUtils.sendError(res, 400, 'user_id and employee_code are required');
            }

            const existing = await this.professorRepository.findByUserId(user_id);
            if (existing) {
                return HttpUtils.sendError(res, 400, 'Professor already exists for this user');
            }

            const professorId = await this.professorRepository.insert({ user_id, employee_code, department });
            const professor = await this.professorRepository.findById(professorId);
            HttpUtils.sendResponse(res, 201, professor.toJSON());
        } catch (error) {
            if (error.message.includes('required') || error.message.includes('already exists')) {
                HttpUtils.sendError(res, 400, error.message);
            } else {
                HttpUtils.sendError(res, 500, error.message);
            }
        }
    }

    async handleUpdateProfessor(req, res, professorId) {
        try {
            const id = parseInt(professorId, 10);
            if (isNaN(id)) {
                return HttpUtils.sendError(res, 400, 'Invalid professor ID');
            }

            const body = await HttpUtils.parseRequestBody(req);
            const success = await this.professorRepository.update(id, body);
            if (!success) {
                return HttpUtils.sendError(res, 404, 'Professor not found or no changes made');
            }

            const professor = await this.professorRepository.findById(id);
            HttpUtils.sendResponse(res, 200, professor.toJSON());
        } catch (error) {
            if (error.message.includes('already exists') || error.message.includes('No fields to update')) {
                HttpUtils.sendError(res, 400, error.message);
            } else {
                HttpUtils.sendError(res, 500, error.message);
            }
        }
    }

    async handleDeactivateProfessor(req, res, professorId) {
        try {
            const id = parseInt(professorId, 10);
            if (isNaN(id)) {
                return HttpUtils.sendError(res, 400, 'Invalid professor ID');
            }

            const success = await this.professorRepository.deactivate(id);
            if (!success) {
                return HttpUtils.sendError(res, 404, 'Professor not found');
            }

            HttpUtils.sendResponse(res, 200, { message: 'Professor deactivated successfully' });
        } catch (error) {
            HttpUtils.sendError(res, 500, error.message);
        }
    }

    async handleGetAllStudents(req, res) {
        try {
            const students = await this.studentRepository.findAll();
            HttpUtils.sendResponse(res, 200, students.map(student => student.toJSON()));
        } catch (error) {
            HttpUtils.sendError(res, 500, error.message);
        }
    }

    async handleGetStudentById(req, res, studentId) {
        try {
            const id = parseInt(studentId, 10);
            if (isNaN(id)) {
                return HttpUtils.sendError(res, 400, 'Invalid student ID');
            }

            const student = await this.studentRepository.findById(id);
            if (!student) {
                return HttpUtils.sendError(res, 404, 'Student not found');
            }

            HttpUtils.sendResponse(res, 200, student.toJSON());
        } catch (error) {
            HttpUtils.sendError(res, 500, error.message);
        }
    }

    async handleCreateStudent(req, res) {
        try {
            const body = await HttpUtils.parseRequestBody(req);
            const { user_id, student_code, career } = body;

            if (!user_id || !student_code) {
                return HttpUtils.sendError(res, 400, 'user_id and student_code are required');
            }

            const existing = await this.studentRepository.findByUserId(user_id);
            if (existing) {
                return HttpUtils.sendError(res, 400, 'Student already exists for this user');
            }

            const studentId = await this.studentRepository.insert({ user_id, student_code, career });
            const student = await this.studentRepository.findById(studentId);
            HttpUtils.sendResponse(res, 201, student.toJSON());
        } catch (error) {
            if (error.message.includes('required') || error.message.includes('already exists')) {
                HttpUtils.sendError(res, 400, error.message);
            } else {
                HttpUtils.sendError(res, 500, error.message);
            }
        }
    }

    async handleUpdateStudent(req, res, studentId) {
        try {
            const id = parseInt(studentId, 10);
            if (isNaN(id)) {
                return HttpUtils.sendError(res, 400, 'Invalid student ID');
            }

            const body = await HttpUtils.parseRequestBody(req);
            const success = await this.studentRepository.update(id, body);
            if (!success) {
                return HttpUtils.sendError(res, 404, 'Student not found or no changes made');
            }

            const student = await this.studentRepository.findById(id);
            HttpUtils.sendResponse(res, 200, student.toJSON());
        } catch (error) {
            if (error.message.includes('already exists') || error.message.includes('No fields to update')) {
                HttpUtils.sendError(res, 400, error.message);
            } else {
                HttpUtils.sendError(res, 500, error.message);
            }
        }
    }

    async handleDeactivateStudent(req, res, studentId) {
        try {
            const id = parseInt(studentId, 10);
            if (isNaN(id)) {
                return HttpUtils.sendError(res, 400, 'Invalid student ID');
            }

            const success = await this.studentRepository.deactivate(id);
            if (!success) {
                return HttpUtils.sendError(res, 404, 'Student not found');
            }

            HttpUtils.sendResponse(res, 200, { message: 'Student deactivated successfully' });
        } catch (error) {
            HttpUtils.sendError(res, 500, error.message);
        }
    }

    async handleGetGroupEnrollments(req, res, groupId) {
        try {
            const id = parseInt(groupId, 10);
            if (isNaN(id)) {
                return HttpUtils.sendError(res, 400, 'Invalid group ID');
            }

            const enrollments = await this.groupEnrollmentRepository.findByGroupId(id);
            HttpUtils.sendResponse(res, 200, enrollments.map(enrollment => enrollment.toJSON()));
        } catch (error) {
            HttpUtils.sendError(res, 500, error.message);
        }
    }

    async handleEnrollStudentInGroup(req, res, groupId) {
        try {
            const id = parseInt(groupId, 10);
            if (isNaN(id)) {
                return HttpUtils.sendError(res, 400, 'Invalid group ID');
            }

            const body = await HttpUtils.parseRequestBody(req);
            HttpUtils.validateRequiredFields(body, ['student_id']);

            const studentId = parseInt(body.student_id, 10);
            if (isNaN(studentId)) {
                return HttpUtils.sendError(res, 400, 'Invalid student ID');
            }

            const enrollment = await this.groupEnrollmentRepository.insert(id, studentId);
            HttpUtils.sendResponse(res, 201, enrollment.toJSON());
        } catch (error) {
            if (error.message.includes('required') || error.message.includes('Invalid')) {
                HttpUtils.sendError(res, 400, error.message);
            } else {
                HttpUtils.sendError(res, 500, error.message);
            }
        }
    }

    async handleRemoveStudentFromGroup(req, res, groupId, studentId) {
        try {
            const grpId = parseInt(groupId, 10);
            const studId = parseInt(studentId, 10);

            if (isNaN(grpId) || isNaN(studId)) {
                return HttpUtils.sendError(res, 400, 'Invalid group or student ID');
            }

            const success = await this.groupEnrollmentRepository.deactivate(grpId, studId);
            if (!success) {
                return HttpUtils.sendError(res, 404, 'Enrollment not found');
            }

            HttpUtils.sendResponse(res, 200, { message: 'Student removed from group successfully' });
        } catch (error) {
            HttpUtils.sendError(res, 500, error.message);
        }
    }

    async handleGetStudentGroups(req, res, studentId) {
        try {
            const id = parseInt(studentId, 10);
            if (isNaN(id)) {
                return HttpUtils.sendError(res, 400, 'Invalid student ID');
            }

            const groups = await this.groupEnrollmentRepository.findByStudentId(id);
            HttpUtils.sendResponse(res, 200, groups.map(enrollment => enrollment.toJSON()));
        } catch (error) {
            HttpUtils.sendError(res, 500, error.message);
        }
    }
}

module.exports = UserController;
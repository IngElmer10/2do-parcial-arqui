const AttendanceService = require('../services/AttendanceService');
const HttpUtils = require('../utils/httpUtils');

class AttendanceController {
    constructor() {
        this.attendanceService = new AttendanceService();
        this.handleRequest = this.handleRequest.bind(this);
    }

    async handleRequest(req, res) {
        if (HttpUtils.handleCors(req, res)) return;

        const { method, url } = req;
        const urlParts = url.split('/').filter(part => part !== '');

        try {
            // Routing para sesiones
            if (method === 'POST' && urlParts[0] === 'sessions') {
                await this.handleCreateSession(req, res);
            } else if (method === 'GET' && urlParts[0] === 'sessions' && urlParts[1] && urlParts.length === 2) {
                await this.handleGetSession(req, res, urlParts[1]);
            } else if (method === 'PUT' && urlParts[0] === 'sessions' && urlParts[1] && urlParts[2] === 'close') {
                await this.handleCloseSession(req, res, urlParts[1]);
            } else if (method === 'DELETE' && urlParts[0] === 'sessions' && urlParts[1]) {
                await this.handleDeleteSession(req, res, urlParts[1]);
            }
            // Routing para registros de asistencia
            else if (method === 'GET' && urlParts[0] === 'sessions' && urlParts[1] && urlParts[2] === 'records') {
                await this.handleGetSessionRecords(req, res, urlParts[1]);
            } else if (method === 'PUT' && urlParts[0] === 'sessions' && urlParts[1] && urlParts[2] === 'records') {
                await this.handleUpdateRecords(req, res, urlParts[1]);
            }
            // Routing para consultas específicas
            else if (method === 'GET' && urlParts[0] === 'groups' && urlParts[1] && urlParts[2] === 'sessions') {
                await this.handleGetGroupSessions(req, res, urlParts[1]);
            } else if (method === 'GET' && urlParts[0] === 'attendance' && urlParts[1] === 'student' && urlParts[2]) {
                await this.handleGetStudentAttendance(req, res, urlParts[2], urlParts[3]);
            } else if (method === 'GET' && urlParts[0] === 'professors' && urlParts[1] && urlParts[2] === 'sessions') {
                await this.handleGetProfessorSessions(req, res, urlParts[1]);
            } else if (method === 'GET' && urlParts[0] === 'subjects' && urlParts[1] && urlParts[2] === 'sessions') {
                await this.handleGetSubjectSessions(req, res, urlParts[1]);
            } else {
                HttpUtils.sendError(res, 404, 'Endpoint not found');
            }
        } catch (error) {
            console.error('Controller error:', error);
            HttpUtils.sendError(res, 500, 'Internal server error');
        }
    }

    async handleCreateSession(req, res) {
        try {
            const body = await HttpUtils.parseRequestBody(req);
            HttpUtils.validateRequiredFields(body, ['group_id', 'professor_id']);

            const session = await this.attendanceService.createSession(body);
            HttpUtils.sendResponse(res, 201, session);
        } catch (error) {
            if (error.message.includes('Missing required fields') || 
                error.message.includes('already exists') ||
                error.message.includes('not assigned') ||
                error.message.includes('Invalid')) {
                HttpUtils.sendError(res, 400, error.message);
            } else if (error.message.includes('not found')) {
                HttpUtils.sendError(res, 404, error.message);
            } else {
                HttpUtils.sendError(res, 500, error.message);
            }
        }
    }

    async handleGetGroupSessions(req, res, groupId) {
        try {
            const grpId = parseInt(groupId);
            if (isNaN(grpId)) {
                return HttpUtils.sendError(res, 400, 'Invalid group ID');
            }

            const sessions = await this.attendanceService.getSessionsByGroup(grpId);
            HttpUtils.sendResponse(res, 200, sessions);
        } catch (error) {
            if (error.message.includes('not found')) {
                HttpUtils.sendError(res, 404, error.message);
            } else {
                HttpUtils.sendError(res, 500, error.message);
            }
        }
    }

    async handleGetSession(req, res, sessionId) {
        try {
            const id = parseInt(sessionId);
            if (isNaN(id)) {
                return HttpUtils.sendError(res, 400, 'Invalid session ID');
            }

            const session = await this.attendanceService.getSessionWithDetails(id);
            HttpUtils.sendResponse(res, 200, session);
        } catch (error) {
            if (error.message === 'Session not found') {
                HttpUtils.sendError(res, 404, error.message);
            } else {
                HttpUtils.sendError(res, 500, error.message);
            }
        }
    }

    async handleGetSessionRecords(req, res, sessionId) {
        try {
            const id = parseInt(sessionId);
            if (isNaN(id)) {
                return HttpUtils.sendError(res, 400, 'Invalid session ID');
            }

            const session = await this.attendanceService.getSessionWithDetails(id);
            HttpUtils.sendResponse(res, 200, session.records);
        } catch (error) {
            if (error.message === 'Session not found') {
                HttpUtils.sendError(res, 404, error.message);
            } else {
                HttpUtils.sendError(res, 500, error.message);
            }
        }
    }

    async handleUpdateRecords(req, res, sessionId) {
        try {
            const id = parseInt(sessionId);
            if (isNaN(id)) {
                return HttpUtils.sendError(res, 400, 'Invalid session ID');
            }

            const body = await HttpUtils.parseRequestBody(req);
            if (!body.records || !Array.isArray(body.records)) {
                return HttpUtils.sendError(res, 400, 'Records array is required');
            }

            const result = await this.attendanceService.updateAttendanceRecords(id, body.records);
            HttpUtils.sendResponse(res, 200, result);
        } catch (error) {
            if (error.message === 'Session not found') {
                HttpUtils.sendError(res, 404, error.message);
            } else if (error.message.includes('closed') || error.message.includes('Invalid')) {
                HttpUtils.sendError(res, 400, error.message);
            } else {
                HttpUtils.sendError(res, 500, error.message);
            }
        }
    }

    async handleCloseSession(req, res, sessionId) {
        try {
            const id = parseInt(sessionId);
            if (isNaN(id)) {
                return HttpUtils.sendError(res, 400, 'Invalid session ID');
            }

            const session = await this.attendanceService.closeSession(id);
            HttpUtils.sendResponse(res, 200, {
                message: 'Session closed successfully',
                session: session
            });
        } catch (error) {
            if (error.message === 'Session not found') {
                HttpUtils.sendError(res, 404, error.message);
            } else if (error.message.includes('already closed')) {
                HttpUtils.sendError(res, 400, error.message);
            } else {
                HttpUtils.sendError(res, 500, error.message);
            }
        }
    }

    async handleDeleteSession(req, res, sessionId) {
        try {
            const id = parseInt(sessionId);
            if (isNaN(id)) {
                return HttpUtils.sendError(res, 400, 'Invalid session ID');
            }

            await this.attendanceService.deleteSession(id);
            HttpUtils.sendResponse(res, 200, { message: 'Session deleted successfully' });
        } catch (error) {
            if (error.message === 'Session not found') {
                HttpUtils.sendError(res, 404, error.message);
            } else {
                HttpUtils.sendError(res, 500, error.message);
            }
        }
    }

    async handleGetStudentAttendance(req, res, studentId, subjectId) {
        try {
            const studId = parseInt(studentId);
            const subId = subjectId ? parseInt(subjectId) : null;

            
            if (isNaN(studId) || (subjectId && isNaN(subId))) {
                return HttpUtils.sendError(res, 400, 'Invalid student or subject ID');
            }

            const attendance = await this.attendanceService.getStudentAttendance(studId, subId);
            HttpUtils.sendResponse(res, 200, attendance);
        } catch (error) {
            if (error.message.includes('not found') || error.message.includes('not a student')) {
                HttpUtils.sendError(res, 404, error.message);
            } else {
                HttpUtils.sendError(res, 500, error.message);
            }
        }
    }

    async handleGetProfessorSessions(req, res, professorId) {
        try {
            const profId = parseInt(professorId);
            if (isNaN(profId)) {
                return HttpUtils.sendError(res, 400, 'Invalid professor ID');
            }

            const sessions = await this.attendanceService.getSessionsByProfessor(profId);
            HttpUtils.sendResponse(res, 200, sessions);
        } catch (error) {
            if (error.message.includes('not found') || error.message.includes('not a professor')) {
                HttpUtils.sendError(res, 404, error.message);
            } else {
                HttpUtils.sendError(res, 500, error.message);
            }
        }
    }

    async handleGetSubjectSessions(req, res, subjectId) {
        try {
            const subId = parseInt(subjectId);
            if (isNaN(subId)) {
                return HttpUtils.sendError(res, 400, 'Invalid subject ID');
            }

            const sessions = await this.attendanceService.getSessionsBySubject(subId);
            HttpUtils.sendResponse(res, 200, sessions);
        } catch (error) {
            if (error.message.includes('not found')) {
                HttpUtils.sendError(res, 404, error.message);
            } else {
                HttpUtils.sendError(res, 500, error.message);
            }
        }
    }
}

module.exports = AttendanceController;
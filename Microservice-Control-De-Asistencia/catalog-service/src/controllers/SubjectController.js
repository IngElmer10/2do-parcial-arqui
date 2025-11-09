const SubjectService = require('../services/SubjectService');
const HttpUtils = require('../utils/httpUtils');

class SubjectController {
    constructor() {
        this.subjectService = new SubjectService();
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

            if (resource === 'subjects') {
                await this.routeSubjects(method, urlParts, req, res);
                return;
            }

            if (resource === 'groups') {
                await this.routeGroups(method, urlParts, req, res);
                return;
            }

            if (resource === 'professors') {
                await this.routeProfessors(method, urlParts, req, res);
                return;
            }

            HttpUtils.sendError(res, 404, 'Endpoint not found');
        } catch (error) {
            console.error('Controller error:', error);
            HttpUtils.sendError(res, 500, 'Internal server error');
        }
    }

    async routeSubjects(method, urlParts, req, res) {
        if (urlParts.length === 1) {
            if (method === 'GET') return this.handleGetAllSubjects(req, res);
            if (method === 'POST') return this.handleCreateSubject(req, res);
        } else if (urlParts.length === 2) {
            const subjectId = urlParts[1];
            if (method === 'GET') return this.handleGetSubjectById(req, res, subjectId);
            if (method === 'PUT') return this.handleUpdateSubject(req, res, subjectId);
            if (method === 'DELETE') return this.handleDeleteSubject(req, res, subjectId);
        } else if (urlParts.length === 3 && urlParts[2] === 'groups') {
            const subjectId = urlParts[1];
            if (method === 'GET') return this.handleGetGroupsBySubject(req, res, subjectId);
            if (method === 'POST') return this.handleCreateGroup(req, res, subjectId);
        }

        HttpUtils.sendError(res, 404, 'Endpoint not found');
    }

    async routeGroups(method, urlParts, req, res) {
        if (urlParts.length === 2) {
            const groupId = urlParts[1];
            if (method === 'GET') return this.handleGetGroupById(req, res, groupId);
            if (method === 'PUT') return this.handleUpdateGroup(req, res, groupId);
            if (method === 'DELETE') return this.handleDeleteGroup(req, res, groupId);
        } else if (urlParts.length === 3 && urlParts[2] === 'professors') {
            const groupId = urlParts[1];
            if (method === 'GET') return this.handleGetGroupProfessors(req, res, groupId);
            if (method === 'POST') return this.handleAssignProfessorToGroup(req, res, groupId);
        } else if (urlParts.length === 3 && urlParts[2] === 'students' && method === 'GET') {
            const groupId = urlParts[1];
            return this.handleGetGroupEnrollments(req, res, groupId);
        } else if (urlParts.length === 4 && urlParts[2] === 'professors') {
            const groupId = urlParts[1];
            const professorId = urlParts[3];
            if (method === 'DELETE') return this.handleRemoveProfessorFromGroup(req, res, groupId, professorId);
        }

        HttpUtils.sendError(res, 404, 'Endpoint not found');
    }

    async routeProfessors(method, urlParts, req, res) {
        if (urlParts.length === 3 && urlParts[2] === 'groups' && method === 'GET') {
            const professorId = urlParts[1];
            return this.handleGetProfessorGroups(req, res, professorId);
        }

        HttpUtils.sendError(res, 404, 'Endpoint not found');
    }

    async handleGetAllSubjects(req, res) {
        try {
            const subjects = await this.subjectService.getAllSubjects();
            HttpUtils.sendResponse(res, 200, subjects.map(subject => subject.toJSON()));
        } catch (error) {
            HttpUtils.sendError(res, 500, error.message);
        }
    }

    async handleGetSubjectById(req, res, subjectId) {
        try {
            const id = parseInt(subjectId, 10);
            if (isNaN(id)) {
                return HttpUtils.sendError(res, 400, 'Invalid subject ID');
            }

            const subject = await this.subjectService.getSubjectById(id);
            HttpUtils.sendResponse(res, 200, subject.toJSON());
        } catch (error) {
            if (error.message === 'Subject not found') {
                HttpUtils.sendError(res, 404, error.message);
            } else {
                HttpUtils.sendError(res, 500, error.message);
            }
        }
    }

    async handleCreateSubject(req, res) {
        try {
            const body = await HttpUtils.parseRequestBody(req);
            HttpUtils.validateRequiredFields(body, ['code', 'name']);

            const subject = await this.subjectService.createSubject(body);
            HttpUtils.sendResponse(res, 201, subject.toJSON());
        } catch (error) {
            if (error.message.includes('Missing required fields') ||
                error.message.includes('already exists') ||
                error.message.includes('must be')) {
                HttpUtils.sendError(res, 400, error.message);
            } else {
                HttpUtils.sendError(res, 500, error.message);
            }
        }
    }

    async handleUpdateSubject(req, res, subjectId) {
        try {
            const id = parseInt(subjectId, 10);
            if (isNaN(id)) {
                return HttpUtils.sendError(res, 400, 'Invalid subject ID');
            }

            const body = await HttpUtils.parseRequestBody(req);
            const subject = await this.subjectService.updateSubject(id, body);
            HttpUtils.sendResponse(res, 200, subject.toJSON());
        } catch (error) {
            if (error.message === 'Subject not found') {
                HttpUtils.sendError(res, 404, error.message);
            } else if (error.message.includes('already exists')) {
                HttpUtils.sendError(res, 400, error.message);
            } else {
                HttpUtils.sendError(res, 500, error.message);
            }
        }
    }

    async handleDeleteSubject(req, res, subjectId) {
        try {
            const id = parseInt(subjectId, 10);
            if (isNaN(id)) {
                return HttpUtils.sendError(res, 400, 'Invalid subject ID');
            }

            await this.subjectService.deleteSubject(id);
            HttpUtils.sendResponse(res, 200, { message: 'Subject deleted successfully' });
        } catch (error) {
            if (error.message === 'Subject not found') {
                HttpUtils.sendError(res, 404, error.message);
            } else if (error.message.includes('Cannot delete')) {
                HttpUtils.sendError(res, 400, error.message);
            } else {
                HttpUtils.sendError(res, 500, error.message);
            }
        }
    }

    async handleGetGroupsBySubject(req, res, subjectId) {
        try {
            const id = parseInt(subjectId, 10);
            if (isNaN(id)) {
                return HttpUtils.sendError(res, 400, 'Invalid subject ID');
            }

            const groups = await this.subjectService.getGroupsBySubjectId(id);
            HttpUtils.sendResponse(res, 200, groups.map(group => group.toJSON()));
        } catch (error) {
            if (error.message === 'Subject not found') {
                HttpUtils.sendError(res, 404, error.message);
            } else {
                HttpUtils.sendError(res, 500, error.message);
            }
        }
    }

    async handleCreateGroup(req, res, subjectId) {
        try {
            const id = parseInt(subjectId, 10);
            if (isNaN(id)) {
                return HttpUtils.sendError(res, 400, 'Invalid subject ID');
            }

            const body = await HttpUtils.parseRequestBody(req);
            HttpUtils.validateRequiredFields(body, ['code', 'name']);

            const group = await this.subjectService.createGroup(id, body);
            HttpUtils.sendResponse(res, 201, group.toJSON());
        } catch (error) {
            if (error.message.includes('Subject not found')) {
                HttpUtils.sendError(res, 404, error.message);
            } else if (error.message.includes('already exists')) {
                HttpUtils.sendError(res, 400, error.message);
            } else if (error.message.includes('required') || error.message.includes('must be')) {
                HttpUtils.sendError(res, 400, error.message);
            } else {
                HttpUtils.sendError(res, 500, error.message);
            }
        }
    }

    async handleGetGroupById(req, res, groupId) {
        try {
            const id = parseInt(groupId, 10);
            if (isNaN(id)) {
                return HttpUtils.sendError(res, 400, 'Invalid group ID');
            }

            const group = await this.subjectService.getGroupById(id);
            HttpUtils.sendResponse(res, 200, group.toJSON());
        } catch (error) {
            if (error.message === 'Group not found') {
                HttpUtils.sendError(res, 404, error.message);
            } else {
                HttpUtils.sendError(res, 500, error.message);
            }
        }
    }

    async handleUpdateGroup(req, res, groupId) {
        try {
            const id = parseInt(groupId, 10);
            if (isNaN(id)) {
                return HttpUtils.sendError(res, 400, 'Invalid group ID');
            }

            const body = await HttpUtils.parseRequestBody(req);
            const group = await this.subjectService.updateGroup(id, body);
            HttpUtils.sendResponse(res, 200, group.toJSON());
        } catch (error) {
            if (error.message === 'Group not found') {
                HttpUtils.sendError(res, 404, error.message);
            } else if (error.message.includes('already exists')) {
                HttpUtils.sendError(res, 400, error.message);
            } else if (error.message.includes('No fields to update')) {
                HttpUtils.sendError(res, 400, error.message);
            } else {
                HttpUtils.sendError(res, 500, error.message);
            }
        }
    }

    async handleDeleteGroup(req, res, groupId) {
        try {
            const id = parseInt(groupId, 10);
            if (isNaN(id)) {
                return HttpUtils.sendError(res, 400, 'Invalid group ID');
            }

            await this.subjectService.deleteGroup(id);
            HttpUtils.sendResponse(res, 200, { message: 'Group deleted successfully' });
        } catch (error) {
            if (error.message === 'Group not found') {
                HttpUtils.sendError(res, 404, error.message);
            } else {
                HttpUtils.sendError(res, 500, error.message);
            }
        }
    }

    async handleGetGroupProfessors(req, res, groupId) {
        try {
            const id = parseInt(groupId, 10);
            if (isNaN(id)) {
                return HttpUtils.sendError(res, 400, 'Invalid group ID');
            }

            const assignments = await this.subjectService.getProfessorsByGroupId(id);
            const payload = assignments.map(({ assignment, professor }) => ({
                assignment: assignment.toJSON(),
                professor
            }));

            HttpUtils.sendResponse(res, 200, payload);
        } catch (error) {
            if (error.message.includes('Group not found')) {
                HttpUtils.sendError(res, 404, error.message);
            } else {
                HttpUtils.sendError(res, 500, error.message);
            }
        }
    }

    async handleAssignProfessorToGroup(req, res, groupId) {
        try {
            const id = parseInt(groupId, 10);
            if (isNaN(id)) {
                return HttpUtils.sendError(res, 400, 'Invalid group ID');
            }

            const body = await HttpUtils.parseRequestBody(req);
            HttpUtils.validateRequiredFields(body, ['professor_id']);

            const assignment = await this.subjectService.assignProfessorToGroup(id, body.professor_id);
            HttpUtils.sendResponse(res, 201, {
                assignment: assignment.assignment.toJSON(),
                professor: assignment.professor
            });
        } catch (error) {
            if (error.message.includes('Group not found')) {
                HttpUtils.sendError(res, 404, error.message);
            } else if (error.message.includes('already assigned')) {
                HttpUtils.sendError(res, 400, error.message);
            } else if (error.message.includes('required')) {
                HttpUtils.sendError(res, 400, error.message);
            } else {
                HttpUtils.sendError(res, 500, error.message);
            }
        }
    }

    async handleRemoveProfessorFromGroup(req, res, groupId, professorId) {
        try {
            const grpId = parseInt(groupId, 10);
            const profId = parseInt(professorId, 10);

            if (isNaN(grpId) || isNaN(profId)) {
                return HttpUtils.sendError(res, 400, 'Invalid group or professor ID');
            }

            await this.subjectService.removeProfessorFromGroup(grpId, profId);
            HttpUtils.sendResponse(res, 200, { message: 'Professor removed from group successfully' });
        } catch (error) {
            if (error.message.includes('not assigned')) {
                HttpUtils.sendError(res, 400, error.message);
            } else {
                HttpUtils.sendError(res, 500, error.message);
            }
        }
    }

    async handleGetProfessorGroups(req, res, professorId) {
        try {
            const id = parseInt(professorId, 10);
            if (isNaN(id)) {
                return HttpUtils.sendError(res, 400, 'Invalid professor ID');
            }

            const results = await this.subjectService.getGroupsByProfessorId(id);
            const payload = results.map(result => ({
                assignment: result.groupProfessor.toJSON(),
                group: result.group.toJSON(),
                subject: result.subject.toJSON(),
                students: result.students
            }));

            HttpUtils.sendResponse(res, 200, payload);
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

            const enrollments = await this.subjectService.getGroupEnrollments(id);
            HttpUtils.sendResponse(res, 200, enrollments);
        } catch (error) {
            if (error.message.includes('Group not found')) {
                HttpUtils.sendError(res, 404, error.message);
            } else if (error.message.includes('Roster service error')) {
                HttpUtils.sendError(res, 502, error.message);
            } else {
                HttpUtils.sendError(res, 500, error.message);
            }
        }
    }
}

module.exports = SubjectController;
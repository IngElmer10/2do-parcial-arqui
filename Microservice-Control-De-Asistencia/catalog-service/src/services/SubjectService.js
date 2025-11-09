const SubjectRepository = require('../repositories/SubjectRepository');
const GroupRepository = require('../repositories/GroupRepository');
const GroupProfessorRepository = require('../repositories/GroupProfessorRepository');
const UserServiceClient = require('../clients/UserServiceClient');
const Subject = require('../models/Subject');
const Group = require('../models/Group');

class SubjectService {
    constructor() {
        this.subjectRepository = new SubjectRepository();
        this.groupRepository = new GroupRepository();
        this.groupProfessorRepository = new GroupProfessorRepository();
        this.userServiceClient = new UserServiceClient();
    }

    async getAllSubjects() {
        try {
            return await this.subjectRepository.findAll();
        } catch (error) {
            throw new Error(`Service error: ${error.message}`);
        }
    }

    async getSubjectById(id) {
        try {
            const subject = await this.subjectRepository.findById(id);
            if (!subject) {
                throw new Error('Subject not found');
            }
            return subject;
        } catch (error) {
            throw new Error(`Service error: ${error.message}`);
        }
    }

    async createSubject(subjectData) {
        try {
            const subject = new Subject(subjectData);
            subject.validate();

            const existingSubject = await this.subjectRepository.findByCode(subjectData.code);
            if (existingSubject) {
                throw new Error('Subject code already exists');
            }

            const subjectId = await this.subjectRepository.insert(subjectData);
            return await this.subjectRepository.findById(subjectId);
        } catch (error) {
            throw new Error(`Service error: ${error.message}`);
        }
    }

    async updateSubject(id, subjectData) {
        try {
            const subject = await this.subjectRepository.findById(id);
            if (!subject) {
                throw new Error('Subject not found');
            }

            const success = await this.subjectRepository.update(id, subjectData);
            if (!success) {
                throw new Error('Subject not found or no changes made');
            }

            return await this.subjectRepository.findById(id);
        } catch (error) {
            throw new Error(`Service error: ${error.message}`);
        }
    }

    async deleteSubject(id) {
        try {
            const subject = await this.subjectRepository.findById(id);
            if (!subject) {
                throw new Error('Subject not found');
            }

            const groups = await this.groupRepository.findBySubjectId(id);
            if (groups.length > 0) {
                throw new Error('Cannot delete subject with existing groups');
            }

            const success = await this.subjectRepository.delete(id);
            if (!success) {
                throw new Error('Failed to delete subject');
            }

            return true;
        } catch (error) {
            throw new Error(`Service error: ${error.message}`);
        }
    }

    async getGroupsBySubjectId(subjectId) {
        try {
            const subject = await this.subjectRepository.findById(subjectId);
            if (!subject) {
                throw new Error('Subject not found');
            }

            return await this.groupRepository.findBySubjectId(subjectId);
        } catch (error) {
            throw new Error(`Service error: ${error.message}`);
        }
    }

    async getGroupById(groupId) {
        try {
            const group = await this.groupRepository.findById(groupId);
            if (!group) {
                throw new Error('Group not found');
            }
            return group;
        } catch (error) {
            throw new Error(`Service error: ${error.message}`);
        }
    }

    async createGroup(subjectId, groupData) {
        try {
            const subject = await this.subjectRepository.findById(subjectId);
            if (!subject) {
                throw new Error('Subject not found');
            }

            const group = new Group({ ...groupData, subject_id: subjectId });
            group.validate();

            const existing = await this.groupRepository.findByCode(subjectId, group.code);
            if (existing) {
                throw new Error('Group code already exists for this subject');
            }

            const groupId = await this.groupRepository.insert({
                subject_id: subjectId,
                code: group.code,
                name: group.name,
                term: group.term,
                description: group.description,
                is_active: group.is_active
            });

            return await this.groupRepository.findById(groupId);
        } catch (error) {
            throw new Error(`Service error: ${error.message}`);
        }
    }

    async updateGroup(groupId, updates) {
        try {
            const group = await this.groupRepository.findById(groupId);
            if (!group) {
                throw new Error('Group not found');
            }

            const allowedUpdates = { ...updates };
            delete allowedUpdates.subject_id;

            const success = await this.groupRepository.update(groupId, allowedUpdates);
            if (!success) {
                throw new Error('Failed to update group');
            }

            return await this.groupRepository.findById(groupId);
        } catch (error) {
            throw new Error(`Service error: ${error.message}`);
        }
    }

    async deleteGroup(groupId) {
        try {
            const group = await this.groupRepository.findById(groupId);
            if (!group) {
                throw new Error('Group not found');
            }

            const success = await this.groupRepository.delete(groupId);
            if (!success) {
                throw new Error('Failed to delete group');
            }

            return true;
        } catch (error) {
            throw new Error(`Service error: ${error.message}`);
        }
    }

    async getProfessorsByGroupId(groupId) {
        try {
            await this.getGroupById(groupId);
            const assignments = await this.groupProfessorRepository.findByGroupId(groupId);

            const enriched = await Promise.all(assignments.map(async (assignment) => {
                const professor = await this.fetchProfessor(assignment.professor_id);
                return { assignment, professor };
            }));

            return enriched;
        } catch (error) {
            throw new Error(`Service error: ${error.message}`);
        }
    }

    async assignProfessorToGroup(groupId, professorId) {
        try {
            const group = await this.groupRepository.findById(groupId);
            if (!group) {
                throw new Error('Group not found');
            }

            await this.fetchProfessor(professorId);

            const assignmentId = await this.groupProfessorRepository.assignProfessorToGroup(groupId, professorId);
            const assignments = await this.groupProfessorRepository.findByGroupId(groupId);
            const assignment = assignments.find(item => item.id === assignmentId);

            if (!assignment) {
                throw new Error('Failed to retrieve professor assignment');
            }

            const professor = await this.fetchProfessor(assignment.professor_id);

            return { assignment, professor };
        } catch (error) {
            throw new Error(`Service error: ${error.message}`);
        }
    }

    async removeProfessorFromGroup(groupId, professorId) {
        try {
            const isAssigned = await this.groupProfessorRepository.isProfessorAssigned(groupId, professorId);
            if (!isAssigned) {
                throw new Error('Professor is not assigned to this group');
            }

            const success = await this.groupProfessorRepository.removeProfessorFromGroup(groupId, professorId);
            if (!success) {
                throw new Error('Failed to remove professor from group');
            }

            return true;
        } catch (error) {
            throw new Error(`Service error: ${error.message}`);
        }
    }

    async getGroupsByProfessorId(professorId) {
        try {
            const groups = await this.groupProfessorRepository.findGroupsByProfessorId(professorId);

            const enrichedGroups = await Promise.all(groups.map(async (item) => {
                const students = await this.fetchGroupEnrollments(item.group.id, { suppressNotFound: true });
                return { ...item, students };
            }));

            return enrichedGroups;
        } catch (error) {
            throw new Error(`Service error: ${error.message}`);
        }
    }

    async getGroupEnrollments(groupId) {
        try {
            await this.getGroupById(groupId);
            return await this.fetchGroupEnrollments(groupId);
        } catch (error) {
            throw new Error(`Service error: ${error.message}`);
        }
    }

    async fetchProfessor(professorId) {
        try {
            return await this.userServiceClient.getProfessorById(professorId);
        } catch (error) {
            if (error.message && error.message.toLowerCase().includes('not found')) {
                throw new Error('Professor not found');
            }
            throw new Error(`Roster service error: ${error.message}`);
        }
    }

    async fetchGroupEnrollments(groupId, options = {}) {
        try {
            return await this.userServiceClient.getGroupEnrollments(groupId);
        } catch (error) {
            if (options.suppressNotFound && error.message && error.message.toLowerCase().includes('not found')) {
                return [];
            }
            throw new Error(`Roster service error: ${error.message}`);
        }
    }
}

module.exports = SubjectService;
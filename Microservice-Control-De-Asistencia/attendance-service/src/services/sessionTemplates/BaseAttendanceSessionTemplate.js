const AttendanceSession = require('../../models/AttendanceSession');
const DateUtils = require('../../utils/dateUtils');

class BaseAttendanceSessionTemplate {
    constructor({ sessionRepository, recordRepository, userClient, catalogClient, detailFetcher }) {
        this.sessionRepository = sessionRepository;
        this.recordRepository = recordRepository;
        this.userClient = userClient;
        this.catalogClient = catalogClient;
        this.detailFetcher = detailFetcher;
    }

    async createSession(rawData = {}) {
        const data = this.normalizeData(rawData);

        this.ensureRequiredIdentifiers(data);
        this.validateDateRules(data);
        await this.validateProfessor(data.professor_id);

        const group = await this.fetchAndValidateGroup(data.group_id);
        await this.ensureProfessorAssignment(data.professor_id, data.group_id);
        await this.ensureNoDuplicateSession(data.group_id, data.session_date);

        await this.applySpecificValidations(data, group);

        const sessionPayload = this.buildSessionPayload(data, group);
        const session = new AttendanceSession(sessionPayload);
        session.validate();

        const sessionId = await this.sessionRepository.insert(sessionPayload);

        await this.handleInitialRecords(sessionId, data);

        const detailedSession = await this.detailFetcher(sessionId);
        return this.appendResponseMetadata(detailedSession, data, group);
    }

    normalizeData(data) {
        const sessionDate = data.session_date || DateUtils.getCurrentDate();
        const sessionType = (data.session_type || 'normal').toLowerCase();
        return {
            ...data,
            session_type: sessionType,
            session_date: sessionDate
        };
    }

    ensureRequiredIdentifiers(data) {
        if (!data.group_id || !data.professor_id) {
            throw new Error('Group ID and Professor ID are required');
        }
    }

    validateDateRules(data) {
        if (!DateUtils.isValidDate(data.session_date)) {
            throw new Error('Invalid session date format. Use YYYY-MM-DD');
        }

        if (data.start_time && !DateUtils.isValidTime(data.start_time)) {
            throw new Error('Invalid start time format. Use HH:MM');
        }

        if (data.end_time && !DateUtils.isValidTime(data.end_time)) {
            throw new Error('Invalid end time format. Use HH:MM');
        }

        if (data.start_time && data.end_time && data.start_time >= data.end_time) {
            throw new Error('End time must be greater than start time');
        }
    }

    async validateProfessor(professorId) {
        await this.userClient.validateProfessor(professorId);
    }

    async fetchAndValidateGroup(groupId) {
        const group = await this.catalogClient.getGroupById(groupId);
        if (!group || group.is_active === false) {
            throw new Error('Group not found');
        }
        return group;
    }

    async ensureProfessorAssignment(professorId, groupId) {
        const isAssigned = await this.catalogClient.isProfessorAssignedToGroup(professorId, groupId);
        if (!isAssigned) {
            throw new Error('Professor is not assigned to this group');
        }
    }

    async ensureNoDuplicateSession(groupId, sessionDate) {
        const existingSession = await this.sessionRepository.findByGroupAndDate(groupId, sessionDate);
        if (existingSession) {
            throw new Error('A session already exists for this group and date');
        }
    }

    async applySpecificValidations() {
        // Hook para validaciones adicionales en clases concretas
    }

    buildSessionPayload(data, group) {
        const isExam = data.session_type === 'exam';
        const examIsStrict = data.exam_is_strict === undefined || data.exam_is_strict === null
            ? (isExam ? true : null)
            : Boolean(data.exam_is_strict);
        return {
            group_id: data.group_id,
            subject_id: group.subject_id,
            professor_id: data.professor_id,
            session_date: data.session_date,
            start_time: data.start_time || null,
            end_time: data.end_time || null,
            status: 'open',
            session_type: data.session_type,
            exam_title: isExam ? data.exam_title || null : null,
            exam_duration_minutes: isExam ? data.exam_duration_minutes ?? null : null,
            exam_is_strict: isExam ? examIsStrict : null
        };
    }

    async handleInitialRecords(sessionId, data) {
        const enrolledStudents = await this.userClient.getGroupEnrollments(data.group_id);
        const initialRecords = this.buildInitialRecords(enrolledStudents, sessionId, data);

        if (initialRecords.length > 0) {
            await this.recordRepository.bulkInsert(initialRecords);
        }

        await this.afterRecordsCreated(sessionId, data, enrolledStudents);
    }

    buildInitialRecords(enrolledStudents, sessionId) {
        return enrolledStudents.map((enrollment) => ({
            session_id: sessionId,
            student_id: enrollment.student_id,
            status: 'absent'
        }));
    }

    async afterRecordsCreated() {
        // Hook para aplicar lógica adicional tras crear registros de asistencia
    }

    appendResponseMetadata(response) {
        return response;
    }
}

module.exports = BaseAttendanceSessionTemplate;

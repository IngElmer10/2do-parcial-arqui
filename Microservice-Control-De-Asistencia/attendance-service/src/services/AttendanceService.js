const AttendanceSessionRepository = require('../repositories/AttendanceSessionRepository');
const AttendanceRecordRepository = require('../repositories/AttendanceRecordRepository');
const UserServiceClient = require('../clients/UserServiceClient');
const CatalogServiceClient = require('../clients/CatalogServiceClient');
const NormalAttendanceSessionTemplate = require('./sessionTemplates/NormalAttendanceSessionTemplate');
const ExamAttendanceSessionTemplate = require('./sessionTemplates/ExamAttendanceSessionTemplate');

class AttendanceService {
    constructor() {
        this.sessionRepository = new AttendanceSessionRepository();
        this.recordRepository = new AttendanceRecordRepository();
        this.userClient = new UserServiceClient();
        this.catalogClient = new CatalogServiceClient();
        this.detailFetcher = (sessionId) => this.getSessionWithDetails(sessionId);
        this.sessionTemplates = {
            normal: this.buildTemplate(NormalAttendanceSessionTemplate),
            exam: this.buildTemplate(ExamAttendanceSessionTemplate)
        };
    }

    buildExamMetadata(session) {
        if (!session || session.session_type !== 'exam') {
            return null;
        }

        const duration = session.exam_duration_minutes;
        const strictAttendance = session.exam_is_strict === null || session.exam_is_strict === undefined
            ? true
            : Boolean(session.exam_is_strict);

        return {
            title: session.exam_title,
            strict_attendance: strictAttendance,
            duration_minutes: duration
        };
    }

    async createSession(sessionData) {
        try {
            const template = this.resolveSessionTemplate(sessionData?.session_type);
            return await template.createSession(sessionData);
        } catch (error) {
            throw new Error(`Service error: ${error.message}`);
        }
    }

    buildTemplate(TemplateClass) {
        return new TemplateClass({
            sessionRepository: this.sessionRepository,
            recordRepository: this.recordRepository,
            userClient: this.userClient,
            catalogClient: this.catalogClient,
            detailFetcher: this.detailFetcher
        });
    }

    resolveSessionTemplate(type = 'normal') {
        const normalized = typeof type === 'string' ? type.toLowerCase() : 'normal';
        return this.sessionTemplates[normalized] || this.sessionTemplates.normal;
    }

    async getSessionWithDetails(sessionId) {
        try {
            const session = await this.sessionRepository.findById(sessionId);
            if (!session) {
                throw new Error('Session not found');
            }

            const records = await this.recordRepository.findBySessionId(sessionId);
            
            const [group, subject, professor, members, rosterStudents] = await Promise.all([
                this.catalogClient.getGroupById(session.group_id),
                this.catalogClient.getSubjectById(session.subject_id),
                this.userClient.getProfessorById(session.professor_id),
                this.userClient.getGroupEnrollments(session.group_id),
                this.userClient.getUsersByIds(records.map(r => r.student_id))
            ]);

            const enrichedRecords = records.map(record => {
                const rosterEntry = members.find(member => member.student_id === record.student_id);
                const student = rosterStudents.find(s => s.id === record.student_id);
                const name = student?.full_name || rosterEntry?.full_name || 'Unknown';
                const username = student?.username || rosterEntry?.username || 'unknown';
                return {
                    ...record.toJSON(),
                    student_name: name,
                    student_username: username
                };
            });

            const examMetadata = this.buildExamMetadata(session);

            return {
                ...session.toJSON(),
                group_code: group.code,
                group_name: group.name,
                subject_name: subject.name,
                professor_name: professor.full_name,
                records: enrichedRecords,
                total_students: enrichedRecords.length,
                present_count: enrichedRecords.filter(r => r.status === 'present').length,
                absent_count: enrichedRecords.filter(r => r.status === 'absent').length,
                ...(examMetadata ? { exam_metadata: examMetadata } : {})
            };
        } catch (error) {
            throw new Error(`Service error: ${error.message}`);
        }
    }

    async getSessionsByGroup(groupId) {
        try {
            const [group, sessions] = await Promise.all([
                this.catalogClient.getGroupById(groupId),
                this.sessionRepository.findSessionsByGroup(groupId)
            ]);

            const enrichedSessions = await Promise.all(
                sessions.map(async (session) => {
                    try {
                        const [subject, professor, records] = await Promise.all([
                            this.catalogClient.getSubjectById(session.subject_id),
                            this.userClient.getProfessorById(session.professor_id),
                            this.recordRepository.findBySessionId(session.id)
                        ]);

                        const examMetadata = this.buildExamMetadata(session);

                        return {
                            ...session.toJSON(),
                            group_code: group.code,
                            group_name: group.name,
                            subject_name: subject.name,
                            subject_code: subject.code,
                            professor_name: professor.full_name,
                            total_students: records.length,
                            present_count: records.filter(r => r.status === 'present').length,
                            ...(examMetadata ? { exam_metadata: examMetadata } : {})
                        };
                    } catch (error) {
                        console.error(`Error enriching session ${session.id}:`, error.message);
                        return session.toJSON();
                    }
                })
            );

            return enrichedSessions;
        } catch (error) {
            throw new Error(`Service error: ${error.message}`);
        }
    }

    async updateAttendanceRecords(sessionId, updates) {
        try {
            const session = await this.sessionRepository.findById(sessionId);
            if (!session) {
                throw new Error('Session not found');
            }

            if (!session.isOpen()) {
                throw new Error('Cannot update records for a closed session');
            }

            if (!Array.isArray(updates)) {
                throw new Error('Updates must be an array of records');
            }

            let updatedCount = 0;
            const errors = [];

            const members = await this.userClient.getGroupEnrollments(session.group_id);

            for (const update of updates) {
                try {
                    if (!update.student_id || !update.status) {
                        errors.push(`Invalid record data for student ${update.student_id}`);
                        continue;
                    }

                    const student = await this.userClient.validateStudent(update.student_id);

                    const enrollment = members.find(member => (member.student_id || member.id) === update.student_id);
                    if (!enrollment) {
                        errors.push(`Student ${update.student_id} is not enrolled in this group`);
                        continue;
                    }

                    // Actualizar el registro
                    const success = await this.recordRepository.updateStatus(
                        sessionId, 
                        update.student_id, 
                        update.status
                    );

                    if (success) {
                        updatedCount++;
                    } else {
                        errors.push(`Record not found for student ${update.student_id}`);
                    }
                } catch (error) {
                    errors.push(`Error updating student ${update.student_id}: ${error.message}`);
                }
            }

            return {
                updated_count: updatedCount,
                error_count: errors.length,
                errors: errors.length > 0 ? errors : undefined
            };
        } catch (error) {
            throw new Error(`Service error: ${error.message}`);
        }
    }

    async closeSession(sessionId) {
        try {
            const session = await this.sessionRepository.findById(sessionId);
            if (!session) {
                throw new Error('Session not found');
            }

            if (!session.isOpen()) {
                throw new Error('Session is already closed');
            }

            const success = await this.sessionRepository.closeSession(sessionId);
            if (!success) {
                throw new Error('Failed to close session');
            }

            return await this.getSessionWithDetails(sessionId);
        } catch (error) {
            throw new Error(`Service error: ${error.message}`);
        }
    }

    async getStudentAttendance(studentId, subjectId = null) {
        try {
            // Validar que el estudiante existe
            await this.userClient.validateStudent(studentId);

            const sessions = subjectId
                ? await this.sessionRepository.findSessionsByGroup(subjectId)
                : await this.sessionRepository.findSessionsByProfessor(studentId);

            const attendance = [];
            for (const session of sessions) {
                if (subjectId && session.subject_id !== Number(subjectId)) {
                    continue;
                }

                const records = await this.recordRepository.findBySessionId(session.id);
                const record = records.find(r => r.student_id === studentId);
                if (!record) continue;

                const subject = await this.catalogClient.getSubjectById(session.subject_id);
                const group = await this.catalogClient.getGroupById(session.group_id);

                attendance.push({
                    ...record.toJSON(),
                    session_date: session.session_date,
                    subject_name: subject.name,
                    subject_code: subject.code,
                    group_id: session.group_id,
                    group_code: group.code,
                    group_name: group.name
                });
            }

            return attendance;
        } catch (error) {
            throw new Error(`Service error: ${error.message}`);
        }
    }

    async getSessionsByProfessor(professorId) {
        try {
            const sessions = await this.sessionRepository.findSessionsByProfessor(professorId);
            
            const enrichedSessions = await Promise.all(
                sessions.map(async (session) => {
                    try {
                        const [group, subject, records] = await Promise.all([
                            this.catalogClient.getGroupById(session.group_id),
                            this.catalogClient.getSubjectById(session.subject_id),
                            this.recordRepository.findBySessionId(session.id)
                        ]);

                        const examMetadata = this.buildExamMetadata(session);

                        return {
                            ...session.toJSON(),
                            group_code: group.code,
                            group_name: group.name,
                            subject_name: subject.name,
                            subject_code: subject.code,
                            total_students: records.length,
                            present_count: records.filter(r => r.status === 'present').length,
                            ...(examMetadata ? { exam_metadata: examMetadata } : {})
                        };
                    } catch (error) {
                        console.error(`Error enriching session ${session.id}:`, error.message);
                        return session.toJSON();
                    }
                })
            );

            return enrichedSessions;
        } catch (error) {
            throw new Error(`Service error: ${error.message}`);
        }
    }

    async getSessionsBySubject(subjectId) {
        try {
            const sessions = await this.sessionRepository.findSessionsByGroup(subjectId);
            
            const enrichedSessions = await Promise.all(
                sessions.map(async (session) => {
                    try {
                        const [group, professor, records] = await Promise.all([
                            this.catalogClient.getGroupById(session.group_id),
                            this.userClient.getProfessorById(session.professor_id),
                            this.recordRepository.findBySessionId(session.id)
                        ]);

                        const examMetadata = this.buildExamMetadata(session);

                        return {
                            ...session.toJSON(),
                            group_code: group.code,
                            group_name: group.name,
                            professor_name: professor.full_name,
                            total_students: records.length,
                            present_count: records.filter(r => r.status === 'present').length,
                            ...(examMetadata ? { exam_metadata: examMetadata } : {})
                        };
                    } catch (error) {
                        console.error(`Error enriching session ${session.id}:`, error.message);
                        return session.toJSON();
                    }
                })
            );

            return enrichedSessions;
        } catch (error) {
            throw new Error(`Service error: ${error.message}`);
        }
    }

    async deleteSession(sessionId) {
        try {
            const session = await this.sessionRepository.findById(sessionId);
            if (!session) {
                throw new Error('Session not found');
            }

            // Eliminar primero los registros de asistencia
            await this.recordRepository.deleteBySession(sessionId);
            
            // Luego eliminar la sesión
            const success = await this.sessionRepository.delete(sessionId);
            if (!success) {
                throw new Error('Failed to delete session');
            }

            return true;
        } catch (error) {
            throw new Error(`Service error: ${error.message}`);
        }
    }
}

module.exports = AttendanceService;
const http = require('http');
const https = require('https');
const { catalogServiceUrl } = require('../../config/services');

class CatalogServiceClient {
    constructor(baseUrl = catalogServiceUrl) {
        this.baseUrl = baseUrl;
    }

    async request(method, path) {
        const url = new URL(path, this.baseUrl);
        const isHttps = url.protocol === 'https:';
        const transport = isHttps ? https : http;

        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        return new Promise((resolve, reject) => {
            const req = transport.request(url, options, (res) => {
                let raw = '';

                res.on('data', (chunk) => {
                    raw += chunk;
                });

                res.on('end', () => {
                    const responseText = raw.trim();
                    let data;

                    if (responseText) {
                        try {
                            data = JSON.parse(responseText);
                        } catch (error) {
                            return reject(new Error(`Catalog service invalid JSON: ${error.message}`));
                        }
                    }

                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(data);
                    } else if (data && data.error) {
                        reject(new Error(data.error));
                    } else {
                        reject(new Error(`Catalog service responded with status ${res.statusCode}`));
                    }
                });
            });

            req.on('error', (error) => {
                reject(new Error(`Unable to reach catalog-service: ${error.message}`));
            });

            req.end();
        });
    }

    async getSubjectById(subjectId) {
        if (!subjectId) {
            throw new Error('Subject ID is required');
        }
        return this.request('GET', `/subjects/${subjectId}`);
    }

    async getStudentsBySubjectId(subjectId) {
        if (!subjectId) {
            throw new Error('Subject ID is required');
        }
        return this.request('GET', `/subjects/${subjectId}/students`);
    }

    async isProfessorAssignedToSubject(professorId, subjectId) {
        try {
            const teacherSubjects = await this.request('GET', `/teachers/${professorId}/subjects`);
            return teacherSubjects.some(subject => subject.subject_id === parseInt(subjectId));
        } catch (error) {
            throw new Error(`Unable to verify professor assignment: ${error.message}`);
        }
    }

    async isStudentEnrolledInSubject(studentId, subjectId) {
        try {
            const studentSubjects = await this.request('GET', `/students/${studentId}/subjects`);
            return studentSubjects.some(subject => subject.subject_id === parseInt(subjectId));
        } catch (error) {
            throw new Error(`Unable to verify student enrollment: ${error.message}`);
        }
    }

    async getGroupById(groupId) {
        if (!groupId) {
            throw new Error('Group ID is required');
        }
        return this.request('GET', `/groups/${groupId}`);
    }

    async getGroupProfessors(groupId) {
        if (!groupId) {
            throw new Error('Group ID is required');
        }
        return this.request('GET', `/groups/${groupId}/professors`);
    }

    async getGroupsByProfessorId(professorId) {
        if (!professorId) {
            throw new Error('Professor ID is required');
        }
        return this.request('GET', `/professors/${professorId}/groups`);
    }

    async isProfessorAssignedToGroup(professorId, groupId) {
        const assignments = await this.getGroupProfessors(groupId);
        return assignments.some(({ assignment }) => assignment.professor_id === Number(professorId));
    }
}

module.exports = CatalogServiceClient;
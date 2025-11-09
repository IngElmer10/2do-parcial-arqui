const http = require('http');
const https = require('https');
const { userServiceUrl } = require('../../config/services');

class UserServiceClient {
    constructor(baseUrl = userServiceUrl) {
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
                            return reject(new Error(`User-service invalid JSON: ${error.message}`));
                        }
                    }

                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(data);
                    } else if (data && data.error) {
                        reject(new Error(data.error));
                    } else {
                        reject(new Error(`User-service responded with status ${res.statusCode}`));
                    }
                });
            });

            req.on('error', (error) => {
                reject(new Error(`Unable to reach user-service: ${error.message}`));
            });

            req.end();
        });
    }

    async getUserById(userId) {
        if (!userId) {
            throw new Error('User ID is required');
        }
        return this.request('GET', `/users/${userId}`);
    }

    async getProfessorById(professorId) {
        if (!professorId) {
            throw new Error('Professor ID is required');
        }
        return this.request('GET', `/professors/${professorId}`);
    }

    async getGroupEnrollments(groupId) {
        if (!groupId) {
            throw new Error('Group ID is required');
        }
        return this.request('GET', `/groups/${groupId}/students`);
    }

    async validateProfessor(professorId) {
        const professor = await this.getProfessorById(professorId);
        if (!professor || professor.is_active === false) {
            throw new Error('Professor not found');
        }
        return professor;
    }

    async validateStudent(studentId) {
        try {
            const student = await this.request('GET', `/students/${studentId}`);
            if (!student || student.is_active === false) {
                throw new Error('Student not found');
            }
            return student;
        } catch (error) {
            throw new Error(`Student validation failed: ${error.message}`);
        }
    }

    async getUsersByIds(userIds) {
        const results = [];
        for (const id of userIds) {
            try {
                const user = await this.getUserById(id);
                results.push(user);
            } catch (error) {
                console.warn(`User ${id} lookup failed: ${error.message}`);
            }
        }
        return results;
    }
}

module.exports = UserServiceClient;
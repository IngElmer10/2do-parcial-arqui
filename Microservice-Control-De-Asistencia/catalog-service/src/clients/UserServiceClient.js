const http = require('http');
const https = require('https');
const { userServiceUrl } = require('../../config/services');

class UserServiceClient {
    constructor(baseUrl = userServiceUrl) {
        this.baseUrl = baseUrl;
    }

    async request(method, path, body = null) {
        const url = new URL(path, this.baseUrl);
        const isHttps = url.protocol === 'https:';
        const transport = isHttps ? https : http;

        const payload = body ? JSON.stringify(body) : null;

        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': payload ? Buffer.byteLength(payload) : 0
            }
        };

        return new Promise((resolve, reject) => {
            const req = transport.request(url, options, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    let parsed;
                    if (data) {
                        try {
                            parsed = JSON.parse(data);
                        } catch (error) {
                            return reject(new Error(`Invalid JSON response from user-service: ${error.message}`));
                        }
                    }

                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(parsed);
                    } else if (parsed && parsed.error) {
                        reject(new Error(parsed.error));
                    } else {
                        reject(new Error(`User-service responded with status ${res.statusCode}`));
                    }
                });
            });

            req.on('error', (error) => {
                reject(new Error(`Unable to reach user-service: ${error.message}`));
            });

            if (payload) {
                req.write(payload);
            }

            req.end();
        });
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
}

module.exports = UserServiceClient;

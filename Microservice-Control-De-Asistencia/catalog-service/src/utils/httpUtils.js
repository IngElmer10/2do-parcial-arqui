class HttpUtils {
    static parseRequestBody(request) {
        return new Promise((resolve, reject) => {
            let body = '';

            request.on('data', chunk => {
                body += chunk.toString();
            });

            request.on('end', () => {
                try {
                    if (body) {
                        resolve(JSON.parse(body));
                    } else {
                        resolve({});
                    }
                } catch (error) {
                    reject(new Error('Invalid JSON'));
                }
            });

            request.on('error', (error) => {
                reject(error);
            });
        });
    }

    static sendResponse(res, statusCode, data = null) {
        res.writeHead(statusCode, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        });

        if (data) {
            res.end(JSON.stringify(data));
        } else {
            res.end();
        }
    }

    static sendError(res, statusCode, message) {
        this.sendResponse(res, statusCode, { error: message });
    }

    static handleCors(req, res) {
        if (req.method === 'OPTIONS') {
            this.sendResponse(res, 200);
            return true;
        }
        return false;
    }

    static validateRequiredFields(data, requiredFields) {
        const missingFields = requiredFields.filter(field => !data[field]);
        if (missingFields.length > 0) {
            throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }
    }
}

module.exports = HttpUtils;
const defaultUserServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:3001';

const normalizeBaseUrl = (url) => {
    if (!url) {
        return 'http://localhost:3001';
    }
    return url.endsWith('/') ? url.slice(0, -1) : url;
};

module.exports = {
    userServiceUrl: normalizeBaseUrl(defaultUserServiceUrl)
};

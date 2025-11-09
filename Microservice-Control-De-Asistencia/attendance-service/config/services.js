const defaultCatalogServiceUrl = process.env.CATALOG_SERVICE_URL || 'http://localhost:3002';
const defaultUserServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:3001';

const normalizeBaseUrl = (url, fallback) => {
    const value = url || fallback;
    return value.endsWith('/') ? value.slice(0, -1) : value;
};

module.exports = {
    catalogServiceUrl: normalizeBaseUrl(process.env.CATALOG_SERVICE_URL, defaultCatalogServiceUrl),
    userServiceUrl: normalizeBaseUrl(process.env.USER_SERVICE_URL, defaultUserServiceUrl)
};

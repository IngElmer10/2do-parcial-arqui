const http = require('http');
const SubjectController = require('./src/controllers/SubjectController');

const PORT = 3002;
const subjectController = new SubjectController();

const server = http.createServer((req, res) => {
    subjectController.handleRequest(req, res);
});

server.on('error', (error) => {
    console.error('Server error:', error);
});

server.listen(PORT, () => {
    console.log(`Catalog Service running on http://localhost:${PORT}`);
});

process.on('SIGINT', () => {
    console.log('\nShutting down Catalog Service gracefully...');
    server.close(() => {
        console.log('Catalog Service stopped.');
        process.exit(0);
    });
});
const http = require('http');
const UserController = require('./src/controllers/UserController');

const PORT = 3001;
const userController = new UserController();

const server = http.createServer((req, res) => {
    userController.handleRequest(req, res);
});

server.on('error', (error) => {
    console.error('Server error:', error);
});

server.listen(PORT, () => {
    console.log(`User Service running on http://localhost:${PORT}`);
});

// Manejo graceful de shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down gracefully...');
    server.close(() => {
        console.log('User Service stopped.');
        process.exit(0);
    });
});
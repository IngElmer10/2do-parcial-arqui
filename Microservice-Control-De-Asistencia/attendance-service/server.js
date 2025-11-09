const http = require('http');
const AttendanceController = require('./src/controllers/AttendanceController');

const PORT = 3003;
const attendanceController = new AttendanceController();

const server = http.createServer((req, res) => {
    attendanceController.handleRequest(req, res);
});

server.on('error', (error) => {
    console.error('Server error:', error);
});

server.listen(PORT, () => {
    console.log(`Attendance Service running on http://localhost:${PORT}`);
});

process.on('SIGINT', () => {
    console.log('\nShutting down Attendance Service gracefully...');
    server.close(() => {
        console.log('Attendance Service stopped.');
        process.exit(0);
    });
});
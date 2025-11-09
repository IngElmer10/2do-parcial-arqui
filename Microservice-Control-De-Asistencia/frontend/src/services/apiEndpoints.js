const USER_SERVICE_BASE = 'http://localhost:3001';
const CATALOG_SERVICE_BASE = 'http://localhost:3002';
const ATTENDANCE_SERVICE_BASE = 'http://localhost:3003';

export const API_ENDPOINTS = {
  // User Service
  LOGIN: `${USER_SERVICE_BASE}/login`,
  USERS: `${USER_SERVICE_BASE}/users`,
  STUDENT_PROFILE: (studentId) => `${USER_SERVICE_BASE}/students/${studentId}`,
  STUDENT_GROUPS: (studentId) => `${USER_SERVICE_BASE}/students/${studentId}/groups`,
  GROUP_STUDENTS: (groupId) => `${USER_SERVICE_BASE}/groups/${groupId}/students`,

  // Catalog Service
  PROFESSOR_GROUPS: (professorId) => `${CATALOG_SERVICE_BASE}/professors/${professorId}/groups`,
  GROUP_DETAILS: (groupId) => `${CATALOG_SERVICE_BASE}/groups/${groupId}`,
  GROUP_PROFESSORS: (groupId) => `${CATALOG_SERVICE_BASE}/groups/${groupId}/professors`,
  SUBJECT_DETAILS: (subjectId) => `${CATALOG_SERVICE_BASE}/subjects/${subjectId}`,

  // Attendance Service
  SESSIONS: `${ATTENDANCE_SERVICE_BASE}/sessions`,
  SESSION_BY_ID: (sessionId) => `${ATTENDANCE_SERVICE_BASE}/sessions/${sessionId}`,
  SESSION_RECORDS: (sessionId) => `${ATTENDANCE_SERVICE_BASE}/sessions/${sessionId}/records`,
  CLOSE_SESSION: (sessionId) => `${ATTENDANCE_SERVICE_BASE}/sessions/${sessionId}/close`,
  STUDENT_ATTENDANCE: (studentId) => `${ATTENDANCE_SERVICE_BASE}/attendance/student/${studentId}`,
  PROFESSOR_SESSIONS: (professorId) => `${ATTENDANCE_SERVICE_BASE}/professors/${professorId}/sessions`,
  GROUP_SESSIONS: (groupId) => `${ATTENDANCE_SERVICE_BASE}/groups/${groupId}/sessions`
};
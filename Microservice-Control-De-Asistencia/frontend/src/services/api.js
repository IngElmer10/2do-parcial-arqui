import { API_ENDPOINTS } from './apiEndpoints';

class ApiService {
  constructor() {
    this.baseConfig = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }

  async request(endpoint, options = {}) {
    const config = {
      ...this.baseConfig,
      ...options,
      headers: {
        ...this.baseConfig.headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(endpoint, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // User Service Methods
  async login(username, password) {
    return this.request(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async getUserById(userId) {
    return this.request(`${API_ENDPOINTS.USERS}/${userId}`);
  }

  // Catalog Service Methods
  async getProfessorGroups(professorId) {
    return this.request(API_ENDPOINTS.PROFESSOR_GROUPS(professorId));
  }

  async getGroupDetails(groupId) {
    return this.request(API_ENDPOINTS.GROUP_DETAILS(groupId));
  }

  async getGroupProfessors(groupId) {
    return this.request(API_ENDPOINTS.GROUP_PROFESSORS(groupId));
  }

  async getSubjectDetails(subjectId) {
    return this.request(API_ENDPOINTS.SUBJECT_DETAILS(subjectId));
  }

  // Attendance Service Methods
  async createSession(sessionData) {
    return this.request(API_ENDPOINTS.SESSIONS, {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  }

  async getSessionWithDetails(sessionId) {
    return this.request(API_ENDPOINTS.SESSION_BY_ID(sessionId));
  }

  async updateAttendanceRecords(sessionId, records) {
    return this.request(API_ENDPOINTS.SESSION_RECORDS(sessionId), {
      method: 'PUT',
      body: JSON.stringify({ records }),
    });
  }

  async closeSession(sessionId) {
    return this.request(API_ENDPOINTS.CLOSE_SESSION(sessionId), {
      method: 'PUT',
    });
  }

  async getStudentAttendance(studentId, subjectId = null) {
    const endpoint = subjectId 
      ? `${API_ENDPOINTS.STUDENT_ATTENDANCE(studentId)}/${subjectId}`
      : API_ENDPOINTS.STUDENT_ATTENDANCE(studentId);
    
    return this.request(endpoint);
  }

  async getProfessorSessions(professorId) {
    return this.request(API_ENDPOINTS.PROFESSOR_SESSIONS(professorId));
  }

  async getGroupSessions(groupId) {
    return this.request(API_ENDPOINTS.GROUP_SESSIONS(groupId));
  }

  // User Service group methods
  async getStudentProfile(studentId) {
    return this.request(API_ENDPOINTS.STUDENT_PROFILE(studentId));
  }

  async getStudentGroups(studentId) {
    return this.request(API_ENDPOINTS.STUDENT_GROUPS(studentId));
  }

  async getGroupStudents(groupId) {
    return this.request(API_ENDPOINTS.GROUP_STUDENTS(groupId));
  }
}

export const apiService = new ApiService();
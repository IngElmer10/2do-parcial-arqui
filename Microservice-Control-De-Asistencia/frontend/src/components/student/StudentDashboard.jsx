import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import AttendanceHistory from './AttendanceHistory';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [attendanceStats, setAttendanceStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudentData();
  }, [user]);

  const loadStudentData = async () => {
    try {
      const [enrollments, statsData] = await Promise.all([
        apiService.getStudentGroups(user.id),
        apiService.getStudentAttendance(user.id)
      ]);

      const groupEntries = await Promise.all(enrollments.map(async (enrollment) => {
        const groupDetails = await apiService.getGroupDetails(enrollment.group_id);
        const subject = await apiService.getSubjectDetails(groupDetails.subject_id);
        return {
          group: groupDetails,
          subject,
          enrollment,
          displayName: `${subject.name} - ${groupDetails.code}`
        };
      }));

      setGroups(groupEntries);
      setAttendanceStats(statsData);
    } catch (error) {
      console.error('Error loading student data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Cargando información...</div>;
  }

  return (
    <div className="student-dashboard">
      <header className="dashboard-header">
        <h1>Panel del Estudiante</h1>
        <p>Bienvenido, {user.full_name}</p>
      </header>

      <div className="dashboard-content">
        <section className="attendance-overview">
          <h2>Resumen de Asistencia</h2>
          <div className="stats-grid">
            {attendanceStats.map(stat => (
              <div key={`${stat.subject_id}-${stat.group_id}`} className="stat-card">
                <h3>{stat.subject_name}</h3>
                <p className="stat-group">Grupo: {stat.group_code}</p>
                <div className="stat-numbers">
                  <span>Asistencias: {stat.present_count}/{stat.total_sessions}</span>
                  <span className={`percentage ${stat.attendance_percentage >= 80 ? 'good' : 'warning'}`}>
                    {stat.attendance_percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="subjects-section">
          <h2>Mis Grupos</h2>
          <div className="subjects-list">
            {groups.map(entry => (
              <div key={entry.group.id} className="subject-card">
                <h3>{entry.subject.name}</h3>
                <p className="group-code">Grupo {entry.group.code}</p>
                <button 
                  onClick={() => setSelectedGroup(entry)}
                  className="view-details-btn"
                >
                  Ver Detalles de Asistencia
                </button>
              </div>
            ))}
          </div>
        </section>

        {selectedGroup && (
          <AttendanceHistory 
            group={selectedGroup}
            studentId={user.id}
            onClose={() => setSelectedGroup(null)}
          />
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;

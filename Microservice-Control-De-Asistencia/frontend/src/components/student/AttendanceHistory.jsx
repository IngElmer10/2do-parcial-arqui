import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import Loading from '../common/Loading';
import Modal from '../common/Modal';
import './AttendanceHistory.css';

const AttendanceHistory = ({ group, studentId, onClose }) => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadAttendanceHistory();
  }, [group, studentId]);

  const loadAttendanceHistory = async () => {
    try {
      const [attendanceData, statsData] = await Promise.all([
        apiService.getStudentAttendance(studentId, group.subject.id),
        apiService.getStudentAttendance(studentId)
      ]);
      
      setAttendance(attendanceData);
      const subjectStats = statsData.find(s => s.subject_id === group.subject.id && s.group_id === group.group.id);
      setStats(subjectStats);
    } catch (error) {
      console.error('Error loading attendance history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    return status === 'present' ? '✅' : '❌';
  };

  const getStatusText = (status) => {
    return status === 'present' ? 'Presente' : 'Ausente';
  };

  if (loading) {
    return (
      <Modal isOpen onClose={onClose} title={`Asistencia - ${group.subject.name} (${group.group.code})`}>
        <Loading message="Cargando historial de asistencia..." />
      </Modal>
    );
  }

  return (
    <Modal isOpen onClose={onClose} title={`Asistencia - ${group.subject.name} (${group.group.code})`} size="medium">
      <div className="attendance-history">
        {stats && (
          <div className="attendance-stats">
            <div className="stat-item">
              <span className="stat-label">Total de Clases:</span>
              <span className="stat-value">{stats.total_sessions}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Asistencias:</span>
              <span className="stat-value present">{stats.present_count}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Porcentaje:</span>
              <span className={`stat-value percentage ${stats.attendance_percentage >= 80 ? 'good' : 'warning'}`}>
                {stats.attendance_percentage}%
              </span>
            </div>
          </div>
        )}

        <div className="attendance-list">
          <h3>Registro Detallado</h3>
          {attendance.length === 0 ? (
            <p className="no-records">No hay registros de asistencia.</p>
          ) : (
            <div className="records-container">
              {attendance.map((record) => (
                <div key={record.id} className="attendance-record">
                  <div className="record-date">
                    {new Date(record.session_date).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  <div className={`record-status ${record.status}`}>
                    {getStatusIcon(record.status)} {getStatusText(record.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="close-btn">
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AttendanceHistory;
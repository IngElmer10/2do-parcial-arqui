import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { apiService } from '../../services/api';
import './AttendanceSession.css';

const AttendanceSession = ({ subject, activeSession, onSessionCreated, onSessionClosed }) => {
  const [students, setStudents] = useState([]);
  const [session, setSession] = useState(activeSession);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [sessionType, setSessionType] = useState('normal');
  const [examTitle, setExamTitle] = useState('');
  const [examDuration, setExamDuration] = useState(120);

  useEffect(() => {
    if (session) {
      loadSessionDetails();
    }
  }, [session]);

  const loadSessionDetails = async () => {
    try {
      setLoading(true);
      const sessionDetails = await apiService.getSessionWithDetails(session.id);
      setStudents(sessionDetails.records);

      const initialAttendance = {};
      sessionDetails.records.forEach(record => {
        initialAttendance[record.student_id] = record.status;
      });
      setAttendance(initialAttendance);
    } catch (error) {
      setMessage('Error cargando la sesión: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const createNewSession = async () => {
    try {
      setLoading(true);
      const newSession = await apiService.createSession({
        group_id: subject.group.id,
        professor_id: subject.assignment.professor_id,
        session_date: new Date().toISOString().split('T')[0],
        session_type: sessionType,
        ...(sessionType === 'exam' ? {
          start_time: subject.group.default_start_time || '09:00',
          end_time: subject.group.default_end_time || '11:00',
          exam_title: examTitle || `${subject.subject.name} - Evaluación`,
          exam_duration_minutes: Number(examDuration)
        } : {})
      });
      
      setSession(newSession);
      onSessionCreated(newSession);
      setMessage('Sesión creada exitosamente');
    } catch (error) {
      setMessage('Error creando sesión: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateAttendance = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const saveAttendance = async () => {
    try {
      setSaving(true);
      const records = Object.entries(attendance).map(([studentId, status]) => ({
        student_id: parseInt(studentId),
        status
      }));

      await apiService.updateAttendanceRecords(session.id, records);
      setMessage('Asistencia guardada exitosamente');
    } catch (error) {
      setMessage('Error guardando asistencia: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const closeSession = async () => {
    try {
      setSaving(true);
      await apiService.closeSession(session.id);
      setMessage('Sesión cerrada exitosamente');
      onSessionClosed();
    } catch (error) {
      setMessage('Error cerrando sesión: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (!session) {
    return (
      <div className="attendance-session">
        <h2>Nueva Sesión de Asistencia - {subject.subject.name}</h2>
        <p>Grupo {subject.group.code}</p>

        <div className="session-type-selector">
          <label htmlFor="session-type">Tipo de sesión</label>
          <Select
            inputId="session-type"
            value={{ value: sessionType, label: sessionType === 'exam' ? 'Examen' : 'Normal' }}
            onChange={(option) => setSessionType(option.value)}
            options={[
              { value: 'normal', label: 'Normal' },
              { value: 'exam', label: 'Examen' }
            ]}
            className="session-type-select"
          />
        </div>

        {sessionType === 'exam' && (
          <div className="exam-settings">
            <div className="form-group">
              <label htmlFor="exam-title">Título del examen</label>
              <input
                id="exam-title"
                type="text"
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
                placeholder="Ej. Examen Parcial"
              />
            </div>
            <div className="form-group">
              <label htmlFor="exam-duration">Duración (minutos)</label>
              <input
                id="exam-duration"
                type="number"
                min="30"
                step="5"
                value={examDuration}
                onChange={(e) => setExamDuration(e.target.value)}
              />
            </div>
            <p className="exam-hint">La sesión de examen requiere horario definido y asistencia estricta.</p>
          </div>
        )}
        
        <button 
          onClick={createNewSession} 
          disabled={loading}
          className="create-session-btn"
        >
          {loading ? 'Creando Sesión...' : 'Crear Sesión de Asistencia'}
        </button>
        
        {message && <div className="message">{message}</div>}
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Cargando sesión...</div>;
  }

  return (
    <div className="attendance-session">
      <div className="session-header">
        <h2>Sesión de Asistencia - {subject.subject.name}</h2>
        <div className="session-info">
          <span>Grupo: {subject.group.code}</span>
          <span>Fecha: {new Date(session.session_date).toLocaleDateString()}</span>
          <span className={`status ${session.status}`}>
            Estado: {session.status === 'open' ? 'Abierta' : 'Cerrada'}
          </span>
          <span className="session-type">
            Tipo: {session.session_type === 'exam' ? 'Examen' : 'Normal'}
          </span>
        </div>
      </div>

      {session.session_type === 'exam' && session.exam_metadata && (
        <div className="exam-summary">
          <h3>Detalles del Examen</h3>
          <p><strong>Título:</strong> {session.exam_metadata.title}</p>
          <p><strong>Duración:</strong> {session.exam_metadata.duration_minutes} minutos</p>
          <p><strong>Control de asistencia:</strong> {session.exam_metadata.strict_attendance ? 'Estricto' : 'Flexible'}</p>
        </div>
      )}

      {message && <div className="message">{message}</div>}

      <div className="attendance-list">
        <h3>Lista de Estudiantes ({students.length})</h3>
        
        <div className="students-grid">
          {students.map(student => (
            <div key={student.student_id} className="student-card">
              <div className="student-info">
                <strong>{student.student_name}</strong>
                <span>ID: {student.student_id}</span>
              </div>
              
              <div className="attendance-controls">
                <button
                  onClick={() => updateAttendance(student.student_id, 'present')}
                  disabled={session.status !== 'open' || saving}
                  className={`present-btn ${attendance[student.student_id] === 'present' ? 'active' : ''}`}
                >
                  ✅ Presente
                </button>
                <button
                  onClick={() => updateAttendance(student.student_id, 'absent')}
                  disabled={session.status !== 'open' || saving}
                  className={`absent-btn ${attendance[student.student_id] === 'absent' ? 'active' : ''}`}
                >
                  ❌ Ausente
                </button>
              </div>
              
              <div className="current-status">
                Estado actual: <span className={attendance[student.student_id]}>
                  {attendance[student.student_id] === 'present' ? 'Presente' : 'Ausente'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {session.status === 'open' && (
        <div className="session-actions">
          <button 
            onClick={saveAttendance} 
            disabled={saving}
            className="save-btn"
          >
            {saving ? 'Guardando...' : 'Guardar Asistencia'}
          </button>
          
          <button 
            onClick={closeSession} 
            disabled={saving}
            className="close-btn"
          >
            {saving ? 'Cerrando...' : 'Cerrar Sesión'}
          </button>
        </div>
      )}
    </div>
  );
};

export default AttendanceSession;
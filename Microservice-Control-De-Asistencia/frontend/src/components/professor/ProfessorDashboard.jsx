import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import SubjectList from './SubjectList';
import AttendanceSession from './AttendanceSession';
import SessionHistory from './SessionHistory';
import './ProfessorDashboard.css';

const ProfessorDashboard = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [view, setView] = useState('subjects'); // 'subjects', 'session', 'history'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfessorGroups();
  }, [user]);

  const loadProfessorGroups = async () => {
    try {
      setLoading(true);
      const assignments = await apiService.getProfessorGroups(user.id);

      const normalizedGroups = await Promise.all(assignments.map(async ({ assignment, group, subject }) => {
        const roster = await apiService.getGroupStudents(group.id);
        return {
          assignment,
          group,
          subject,
          roster,
          displayName: `${subject.name} - ${group.code}`
        };
      }));

      setGroups(normalizedGroups);
    } catch (error) {
      console.error('Error loading professor groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupSelect = async (groupEntry) => {
    setSelectedGroup(groupEntry);

    try {
      const sessions = await apiService.getGroupSessions(groupEntry.group.id);
      const openSession = sessions.find(s => s.status === 'open');
      setActiveSession(openSession || null);
      setView('session');
    } catch (error) {
      console.error('Error checking sessions:', error);
    }
  };

  const handleSessionCreated = (session) => {
    setActiveSession(session);
    setView('session');
  };

  const handleSessionClosed = () => {
    setActiveSession(null);
    setView('history');
  };

  if (loading) {
    return <div className="loading">Cargando materias...</div>;
  }

  return (
    <div className="professor-dashboard">
      <header className="dashboard-header">
        <h1>Panel del Profesor</h1>
        <p>Bienvenido, {user.full_name}</p>
      </header>

      <nav className="dashboard-nav">
        <button 
          onClick={() => setView('subjects')} 
          className={view === 'subjects' ? 'active' : ''}
        >
          Mis Grupos
        </button>
        <button 
          onClick={() => setView('history_all')} 
          className={view === 'history_all' ? 'active' : ''}
        >
          Historial General
        </button>
        {selectedGroup && (
          <>
            <button 
              onClick={() => setView('session')} 
              className={view === 'session' ? 'active' : ''}
            >
              {activeSession ? 'Sesión Activa' : 'Nueva Sesión'}
            </button>
            <button 
              onClick={() => setView('history')} 
              className={view === 'history' ? 'active' : ''}
            >
              Historial del Grupo
            </button>
          </>
        )}
      </nav>

      <main className="dashboard-content">
        {view === 'subjects' && (
          <SubjectList 
            subjects={groups} 
            onSubjectSelect={handleGroupSelect}
          />
        )}

        {view === 'session' && selectedGroup && (
          <AttendanceSession
            subject={selectedGroup}
            activeSession={activeSession}
            onSessionCreated={handleSessionCreated}
            onSessionClosed={handleSessionClosed}
          />
        )}

        {view === 'history' && selectedGroup && (
          <SessionHistory groupId={selectedGroup.group.id} />
        )}

        {view === 'history_all' && (
          <SessionHistory professorId={user.id} />
        )}
      </main>
    </div>
  );
};

export default ProfessorDashboard;

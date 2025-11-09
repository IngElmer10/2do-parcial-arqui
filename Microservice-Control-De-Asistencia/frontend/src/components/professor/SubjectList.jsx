import React from 'react';
import './SubjectList.css';

const SubjectList = ({ subjects, onSubjectSelect }) => {
  if (!subjects || subjects.length === 0) {
    return (
      <div className="subjects-container">
        <div className="no-subjects">
          <h3>No tienes grupos asignados</h3>
          <p>Contacta al administrador para que te asigne un grupo.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="subjects-container">
      <h2>Mis Grupos</h2>
      <p>Selecciona un grupo para gestionar la asistencia</p>
      
      <div className="subjects-grid">
        {subjects.map((entry) => (
          <div 
            key={`${entry.group.id}`} 
            className="subject-card"
            onClick={() => onSubjectSelect(entry)}
          >
            <div className="subject-info">
              <h3>{entry.subject.name}</h3>
              <span className="subject-code">{entry.group.code}</span>
              {entry.group.schedule && (
                <p className="subject-description">{entry.group.schedule}</p>
              )}
            </div>
            <div className="subject-actions">
              <button className="select-btn">
                Gestionar Asistencia →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubjectList;
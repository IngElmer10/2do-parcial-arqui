import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();

  const getRoleName = () => {
    switch (user.role) {
      case 'professor': return 'Profesor';
      case 'student': return 'Estudiante';
      default: return 'Usuario';
    }
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-brand">
          <h1>🎓 Control de Asistencia</h1>
          <span className="user-info">
            {user.full_name} ({getRoleName()})
          </span>
        </div>
        
        <nav className="header-nav">
          <button onClick={logout} className="logout-btn">
            Cerrar Sesión
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
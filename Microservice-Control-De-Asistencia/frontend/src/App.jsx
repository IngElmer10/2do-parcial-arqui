import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/auth/Login';
import ProfessorDashboard from './components/professor/ProfessorDashboard';
import StudentDashboard from './components/student/StudentDashboard';

import Header from './components/common/Header';
import './App.css';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppContent = () => {
  const { user, isAuthenticated } = useAuth();

  const getDashboard = () => {
    if (!user) return null;
    
    switch (user.role) {
      case 'professor':
        return <ProfessorDashboard />;
      case 'student':
        return <StudentDashboard />;
      default:
        return <div>Rol no reconocido</div>;
    }
  };

  return (
    <Router>
      <div className="app">
        {isAuthenticated && <Header />}
        
        <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated ? <Navigate to="/" replace /> : <Login />
            } 
          />
          
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                {getDashboard()}
              </ProtectedRoute>
            } 
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
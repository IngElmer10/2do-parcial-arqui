import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const normalizeUser = (rawUser) => {
    if (!rawUser) return null;

    return {
      ...rawUser,
      account_id: rawUser.account_id ?? rawUser.id,
      professorId: rawUser.professorId ?? rawUser.professor_profile?.id,
      studentId: rawUser.studentId ?? rawUser.student_profile?.id
    };
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(normalizeUser(parsed));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await apiService.login(username, password);
      const { user: userData } = response;

      const normalizedUser = {
        ...userData,
        account_id: userData.id,
        professorId: userData.role === 'professor' ? userData.professor_profile?.id : undefined,
        studentId: userData.role === 'student' ? userData.student_profile?.id : undefined
      };

      const safeUser = normalizeUser(normalizedUser);

      setUser(safeUser);
      localStorage.setItem('user', JSON.stringify(safeUser));

      return { success: true, user: safeUser };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    isProfessor: user?.role === 'professor',
    isStudent: user?.role === 'student'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
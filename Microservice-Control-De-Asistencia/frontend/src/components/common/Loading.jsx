import React from 'react';
import './Loading.css';

const Loading = ({ message = "Cargando..." }) => {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p className="loading-message">{message}</p>
    </div>
  );
};

export const InlineLoading = () => (
  <div className="inline-loading">
    <div className="spinner-small"></div>
  </div>
);

export default Loading;
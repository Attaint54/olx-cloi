'use client';

import React from 'react';
import { useAppContext } from '../context/AppContext';

export default function ToastContainer() {
  const { toasts } = useAppContext();

  if (toasts.length === 0) return null;

  return (
    <div id="toast-container">
      {toasts.map((toast) => {
        let iconClass = 'fa-circle-check';
        if (toast.type === 'error') iconClass = 'fa-circle-xmark';
        if (toast.type === 'warning') iconClass = 'fa-circle-exclamation';
        if (toast.type === 'info') iconClass = 'fa-circle-info';

        return (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <i className={`fa-solid ${iconClass} toast-icon`}></i>
            <span className="toast-message">{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
}

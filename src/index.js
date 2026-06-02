import './i18n';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { IconModeProvider } from './config/icons';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <IconModeProvider>
      <App />
    </IconModeProvider>
  </React.StrictMode>
);

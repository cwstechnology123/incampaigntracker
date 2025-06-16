import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import ErrorBoundary from './components/ErrorBoundary';

// Add global error handling for unhandled rejections and exceptions
window.addEventListener('unhandledrejection', event => {
  console.error('Unhandled rejection:', event.reason);
});

window.addEventListener('error', event => {
  console.error('Unhandled exception:', event.error);
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)
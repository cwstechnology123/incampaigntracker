import React from 'react';
import SettingsDisplay from '../components/Settings/SettingsDisplay';

export const SettingsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8">Settings</h1>
      <SettingsDisplay />
    </div>
  );
};
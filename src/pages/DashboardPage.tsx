import React from 'react';
import { DashboardSummary } from '../components/Dashboard/DashboardSummary';

export const DashboardPage: React.FC = () => {

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-neutral-900">Dashboard</h1>
      <DashboardSummary />
    </div>
  );
};
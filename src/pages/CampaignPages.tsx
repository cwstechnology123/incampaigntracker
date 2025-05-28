import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { CampaignList } from '../components/Campaign/CampaignList';
import { CampaignForm } from '../components/Campaign/CampaignForm';
import { CampaignDetail } from '../components/Campaign/CampaignDetail';

export const CampaignsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Routes>
        <Route index element={<CampaignList />} />
        <Route path="new" element={<CampaignForm />} />
        <Route path=":id" element={<CampaignDetail />} />
      </Routes>
    </div>
  );
};
import React from 'react';
import { Linkedin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-neutral-200 bg-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
          <div className="flex items-center space-x-2">
            <Linkedin className="h-6 w-6 text-primary-500" />
            <span className="text-lg font-semibold text-primary-800">Campaign Tracker</span>
          </div>
          
          <div className="flex space-x-6">
            <a href="#" className="text-sm text-neutral-600 hover:text-primary-600">
              Terms of Service
            </a>
            <a href="#" className="text-sm text-neutral-600 hover:text-primary-600">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-neutral-600 hover:text-primary-600">
              Help Center
            </a>
          </div>
          
          <div className="text-sm text-neutral-500">
            © {new Date().getFullYear()} Campaign Tracker. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};
// components/ui/SkeletonStatCard.tsx
import React from 'react';
import { Skeleton } from './Skeleton'; // or use from shadcn/ui if installed

export const SkeletonStatCard: React.FC = () => (
  <div className="card flex items-center space-x-4">
    <Skeleton className="h-12 w-12 rounded-full" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-6 w-16" />
    </div>
  </div>
);
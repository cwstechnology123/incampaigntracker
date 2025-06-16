// components/ui/SkeletonDashboard.tsx
import React from 'react';
import { SkeletonStatCard } from './SkeletonStatCard';
import { Skeleton } from './Skeleton';

export const SkeletonDashboard: React.FC = () => (
    <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold text-neutral-900">Dashboard</h1>
        <div className="text-sm text-neutral-500">Loading... Please wait...</div>
        <div className="space-y-6 px-4 py-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
                <SkeletonStatCard key={i} />
            ))}
            </div>
            <div className="card p-6 space-y-4">
            <Skeleton className="h-5 w-40" />
            {[...Array(3)].map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                </div>
                <div className="text-right space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-3 w-24" />
                </div>
                </div>
            ))}
            </div>
        </div>
    </div>
);
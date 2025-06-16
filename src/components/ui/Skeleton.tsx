// components/ui/Skeleton.tsx
export const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-neutral-200 rounded ${className}`} />
);
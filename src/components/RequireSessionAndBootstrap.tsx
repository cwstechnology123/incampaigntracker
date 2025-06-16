// src/components/RequireSessionAndBootstrap.tsx
import React from 'react';
import { useSessionStore } from '../states/stores/useSessionStore';
import { useBootstrapDataStore } from '../states/stores/useBootstrapDataStore';

type Props = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode | ((args: { error: unknown; refresh: () => void }) => React.ReactNode);
};

const RequireSessionAndBootstrap: React.FC<Props> = ({
  children,
  fallback = <div>Loading...</div>,
  errorFallback = <div>Something went wrong. Please try reloading.</div>,
}) => {
  const { session } = useSessionStore();
  const {
    user,
    settings,
    campaigns,
    posts,
    isLoading,
    error,
    refresh,
  } = useBootstrapDataStore() ?? {};

  const isReady =
    session && user && settings && campaigns && posts && !isLoading && !error;

  if (error) {
    console.error("Bootstrap error:", error);
    return (
      <>
        {typeof errorFallback === 'function'
          ? errorFallback({ error, refresh })
          : errorFallback}
      </>
    );
  }

  if (!isReady) return fallback;

  return <>{children}</>;
};

export default RequireSessionAndBootstrap;
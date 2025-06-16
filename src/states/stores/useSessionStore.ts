import { getSupabaseSession } from '../../lib/getSupabaseSession';
import localStoragePersistor from '../persistors/local-storage';
import useStore from 'swr-global-state';

export const useSessionStore = () => {
  const [session, setSession] = useStore(
    {
      key: '@app/session',
      initial: null,
      persistor: {
        onSet: localStoragePersistor.onSet,
        onGet: getSupabaseSession,
      }
    },
    { revalidateOnFocus: false }
  );

  return { session, setSession };
};
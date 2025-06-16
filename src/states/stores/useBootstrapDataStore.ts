import { fetchWithAuthJson } from "../../utils/fetchWithAuth";
import useStore from "swr-global-state";
import localStoragePersistor from '../persistors/local-storage';
import {
  BootstrapDataType,
  IntegrationSettings,
  Campaign,
  Post,
  CampaignSummary
} from "../../types";

const KEY = "@app/bootstrap-data";

const getStoredSession = () => {
  const sessionStr = localStorage.getItem('@app/session');
  return sessionStr ? JSON.parse(sessionStr) : null;
};

export const useBootstrapDataStore = () => {
  const [loading, setLoading] = useStore({
    key: `${KEY}-loading`,
    initial: true
  });

  const [bootstrap, setBootstrap, swrDefaultResponse] = useStore(
    {
      key: KEY,
      initial: null,
      persistor: {
        onSet: localStoragePersistor.onSet,
        onGet: async (key) => {
          try {
            const session = getStoredSession();
            if (!session) {
              throw new Error('User is not authenticated');
            }

            if (window.navigator.onLine) {
              const remoteBootstrap = await fetchWithAuthJson(
                `/api/bootstrap`,
                { method: 'GET' },
                session
              );

              if (remoteBootstrap?.data) {
                localStoragePersistor.onSet(key, remoteBootstrap.data);
                return remoteBootstrap.data;
              }

              throw new Error(remoteBootstrap?.error || 'No data returned from server');
            }

            const cachedBootstrap = localStoragePersistor.onGet(key);
            return cachedBootstrap;

          } catch (err: any) {
            console.warn('Error during bootstrap fetch:', err);
            const cachedBootstrap = localStoragePersistor.onGet(key);
            return cachedBootstrap;
          } finally {
            setLoading(false);
          }
        }
      }
    },
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      shouldRetryOnError: true,
    }
  );

  const { mutate, error } = swrDefaultResponse;

  // Get posts for a campaign
  const getCampaignPosts = (campaignId: string): Post[] => {
    if (!campaignId || !bootstrap?.posts) return [];
    return bootstrap.posts.filter(
      (post: Post) => String(post.campaign_id) === String(campaignId)
    );
  };

  // Get campaign summary
  const getCampaignSummary = (campaignId: string): CampaignSummary => {
    const posts = getCampaignPosts(campaignId);
    const totalLikes = posts.reduce((sum, p) => sum + (p.likes || 0), 0);
    const totalComments = posts.reduce((sum, p) => sum + (p.comments || 0), 0);
    const totalShares = posts.reduce((sum, p) => sum + (p.shares || 0), 0);
    const totalEngagement = totalLikes + totalComments + totalShares;

    return {
      campaignId,
      postsCount: posts.length,
      totalLikes,
      totalComments,
      totalShares,
      totalEngagement,
      lastUpdated: new Date().toISOString(),
    };
  };

  const updateSettings = async (newSettings: IntegrationSettings): Promise<void> => {
    setBootstrap((prev: BootstrapDataType | null) => ({
      ...(prev || {}),
      settings: newSettings,
    }));
  };

  const updateCampaigns = (updater: (prev: Campaign[]) => Campaign[]) => {
    if (!bootstrap) return;
    const updatedCampaigns = updater(bootstrap.campaigns || []);
    const updatedBootstrap = { ...bootstrap, campaigns: updatedCampaigns };

    localStoragePersistor.onSet(KEY, updatedBootstrap);
    setBootstrap(updatedBootstrap);
    mutate();
  };

  const destroyBootstrapData = async () => {
    setLoading(true);
    localStorage.removeItem(KEY);
    mutate(null);
    setLoading(false);
  };

  return {
    user: bootstrap?.user,
    settings: bootstrap?.settings || {},
    campaigns: bootstrap?.campaigns || [],
    posts: bootstrap?.posts || [],
    isLoading: loading,
    error,
    getCampaignPosts,
    getCampaignSummary,
    updateSettings,
    updateCampaigns,
    refresh: () => mutate(),
    destroyBootstrapData,
  } satisfies BootstrapDataType;
};
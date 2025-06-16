import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AlertCircle, Save, Key, Cookie } from 'lucide-react';
import { useSessionStore } from '../../states/stores/useSessionStore';
import { fetchWithAuthJson } from '../../utils/fetchWithAuth';
import { useBootstrapDataStore } from '../../states/stores/useBootstrapDataStore';

type SettingsFormValues = {
  apifyToken: string;
  liAtCookie: string;
  jsessionId: string;
};

const SettingsDisplay = () => {
  const { session } = useSessionStore();
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<SettingsFormValues>();

  const [success, setSuccess] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const {
    settings,
    isLoading,
    error,
    refresh,
  } = useBootstrapDataStore() ?? {};

  useEffect(() => {
    const settingsObj = Array.isArray(settings) ? settings[0] : settings;

    // Early return if no settings available yet
    if (!settingsObj || Object.keys(settingsObj).length === 0) return;

    const currentValues = {
      apifyToken: settingsObj.apify_api_token || '',
      liAtCookie: settingsObj.li_at || '',
      jsessionId: settingsObj.jsessionid || '',
    };

    const formValues = getValues();
    const isDifferent =
      formValues.apifyToken !== currentValues.apifyToken ||
      formValues.liAtCookie !== currentValues.liAtCookie ||
      formValues.jsessionId !== currentValues.jsessionId;

    if (isDifferent) {
      reset(currentValues);
    }
  }, [settings, reset]);

  const onSubmit = async (data: SettingsFormValues) => {
    setSuccess(false);
    setLocalError(null);
    try {
      const accessToken = session?.access_token;
      if (!accessToken) {
        throw new Error('User is not authenticated');
      }

      const response = await fetchWithAuthJson(`/api/settings`, {
          method: 'POST',
          body: JSON.stringify({
            apify_api_token: data.apifyToken,
            li_at: data.liAtCookie,
            jsessionid: data.jsessionId,
          }),
        }, session);

      if (response?.error) throw new Error(response.error);
      
      await refresh(); 

      setSuccess(true);
    } catch (err: any) {
      setLocalError(err?.message || 'Failed to save settings');
    }
  };

  const formUI = useMemo(() => {
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="apifyToken" className="label">
            Apify API Token
          </label>
          <div className="relative">
            <Key className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
            <input
              id="apifyToken"
              type="password"
              className="input w-full pl-10"
              placeholder="Enter your Apify API token"
              {...register('apifyToken', { required: 'API token is required' })}
            />
          </div>
          {errors.apifyToken && (
            <p className="text-sm text-red-600 mt-1">{errors.apifyToken.message}</p>
          )}
          <p className="mt-1 text-sm text-neutral-500">
              Get your API token from the{' '}
              <a
              href="https://console.apify.com/account#/integrations"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700"
              >
              Apify Console
              </a>
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">LinkedIn Cookies</h3>
          <div className="text-sm text-neutral-600">
            <p>To get your LinkedIn cookies:</p>
            <ol className="mt-2 list-decimal pl-5 text-sm">
              <li>Log into LinkedIn in your browser</li>
              <li>Open Developer Tools (F12)</li>
              <li>Go to Application → Cookies → www.linkedin.com</li>
              <li>Find and copy the required cookie values</li>
            </ol>
          </div>

          <div>
            <label htmlFor="liAtCookie" className="label">li_at Cookie</label>
            <div className="relative">
              <Cookie className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
              <input
                id="liAtCookie"
                type="password"
                className="input w-full pl-10"
                placeholder="Enter li_at cookie"
                {...register('liAtCookie', { required: 'li_at cookie is required' })}
              />
            </div>
            {errors.liAtCookie && (
              <p className="text-sm text-red-600 mt-1">{errors.liAtCookie.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="jsessionId" className="label">jsessionid</label>
            <input
              id="jsessionId"
              type="password"
              className="input w-full"
              placeholder="Enter jsessionid cookie"
              {...register('jsessionId', { required: 'jsessionid is required' })}
            />
            {errors.jsessionId && (
              <p className="text-sm text-red-600 mt-1">{errors.jsessionId.message}</p>
            )}
          </div>
        </div>

        {(error || localError) && (
        <div className="mb-4 flex items-start rounded-md bg-error-50 p-3 text-error-700">
            <AlertCircle className="mr-2 h-5 w-5 flex-shrink-0" />
            <span>{error || localError}</span>
        </div>
        )}

        {success && (
          <div className="rounded-md bg-green-50 p-3 text-green-700">
            Settings saved successfully!
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary w-full flex items-center justify-center"
          disabled={isSubmitting}
        >
          <Save className="h-5 w-5 mr-2" />
          {isSubmitting ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    );
  }, [handleSubmit, onSubmit, errors, isSubmitting, localError, success]);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="card">
        <h2 className="mb-6 text-xl font-semibold">API Credentials</h2>
        {isLoading ? <p>Loading settings...</p> : formUI}
      </div>
    </div>
  );
};

export default SettingsDisplay;
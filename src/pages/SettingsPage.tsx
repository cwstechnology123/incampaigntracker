import React, { useState, useEffect } from 'react';
import { AlertCircle, Save, Key, Cookie } from 'lucide-react';
import { fetchIntegrationSettings, upsertIntegrationSettings } from '../lib/integrationSettingsQueries';

export const SettingsPage: React.FC = () => {
  const [apifyToken, setApifyToken] = useState('');
  const [liAtCookie, setLiAtCookie] = useState('');
  const [jsessionId, setJsessionId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await fetchIntegrationSettings();
        if (settings) {
          setApifyToken(settings.apify_api_token || '');
          setLiAtCookie(settings.li_at || '');
          setJsessionId(settings.jsessionid || '');
        }
      } catch (err) {
        setError('Failed to load settings');
      }
    };
    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSaving(true);

    try {
      if (!apifyToken || !liAtCookie || !jsessionId) {
        throw new Error('All fields are required');
      }
      // Upsert the integration settings
      await upsertIntegrationSettings({
        li_at: liAtCookie,
        jsessionid: jsessionId,
        apify_api_token: apifyToken,
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8">Settings</h1>

      <div className="mx-auto max-w-2xl">
        <div className="card">
          <h2 className="mb-6 text-xl font-semibold">API Credentials</h2>

          {error && (
            <div className="mb-4 flex items-start rounded-md bg-error-50 p-3 text-error-700">
              <AlertCircle className="mr-2 h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-md bg-success-50 p-3 text-success-700">
              Settings saved successfully!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="apifyToken" className="label">
                Apify API Token
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                <input
                  id="apifyToken"
                  type="password"
                  value={apifyToken}
                  onChange={(e) => setApifyToken(e.target.value)}
                  className="input w-full pl-10"
                  placeholder="Enter your Apify API token"
                />
              </div>
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
              <p className="text-sm text-neutral-600">
                To get your LinkedIn cookies:
                <ol className="mt-2 list-decimal pl-5 text-sm">
                  <li>Log into LinkedIn in your browser</li>
                  <li>Open Developer Tools (F12)</li>
                  <li>Go to Application → Cookies → www.linkedin.com</li>
                  <li>Find and copy the required cookie values</li>
                </ol>
              </p>

              <div>
                <label htmlFor="liAtCookie" className="label">
                  li_at Cookie
                </label>
                <div className="relative">
                  <Cookie className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                  <input
                    id="liAtCookie"
                    type="password"
                    value={liAtCookie}
                    onChange={(e) => setLiAtCookie(e.target.value)}
                    className="input w-full pl-10"
                    placeholder="Enter your li_at cookie value"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="jsessionId" className="label">
                  JSESSIONID Cookie
                </label>
                <div className="relative">
                  <Cookie className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                  <input
                    id="jsessionId"
                    type="password"
                    value={jsessionId}
                    onChange={(e) => setJsessionId(e.target.value)}
                    className="input w-full pl-10"
                    placeholder="Enter your JSESSIONID cookie value"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="btn btn-primary flex items-center space-x-2"
                disabled={isSaving}
              >
                <Save className="h-4 w-4" />
                <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
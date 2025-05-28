import React from 'react';
import { Link } from 'react-router-dom';
import { Linkedin, BarChart as ChartBar, Search, BarChart2, Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-50 to-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
            <div className="space-y-6 md:pr-12">
              <h1 className="text-4xl font-bold leading-tight text-neutral-900 md:text-5xl">
                Track Your LinkedIn <span className="text-primary-600">Campaign Performance</span>
              </h1>
              <p className="text-lg text-neutral-700">
                Monitor hashtag engagement, track performance metrics, and export reports with our 
                powerful LinkedIn campaign tracker.
              </p>
              <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                {isAuthenticated ? (
                  <Link to="/dashboard" className="btn btn-primary px-8 py-3 text-base">
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="btn btn-primary px-8 py-3 text-base">
                      Get Started
                    </Link>
                    <Link to="/login" className="btn btn-outline px-8 py-3 text-base">
                      Log In
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute -top-6 -left-6 h-24 w-24 rounded-lg bg-primary-100"></div>
                <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-lg bg-accent-100"></div>
                <div className="relative rounded-lg bg-white p-6 shadow-xl">
                  <div className="mb-4 flex items-center space-x-3">
                    <Linkedin className="h-8 w-8 text-primary-500" />
                    <h3 className="text-xl font-semibold text-primary-900">Campaign Analytics</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="h-40 rounded-md bg-neutral-100 p-4">
                      <div className="flex h-full items-center justify-center">
                        <ChartBar className="h-20 w-20 text-neutral-300" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-md bg-primary-50 p-3">
                        <p className="text-xs text-neutral-500">Likes</p>
                        <p className="text-lg font-bold text-primary-700">1,234</p>
                      </div>
                      <div className="rounded-md bg-secondary-50 p-3">
                        <p className="text-xs text-neutral-500">Comments</p>
                        <p className="text-lg font-bold text-secondary-700">568</p>
                      </div>
                      <div className="rounded-md bg-accent-50 p-3">
                        <p className="text-xs text-neutral-500">Shares</p>
                        <p className="text-lg font-bold text-accent-700">327</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-neutral-900">
              Powerful Campaign Tracking Tools
            </h2>
            <p className="mx-auto max-w-3xl text-lg text-neutral-600">
              Everything you need to monitor, analyze, and optimize your LinkedIn marketing campaigns.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="card-hover flex flex-col items-center text-center transition-all hover:translate-y-[-5px]">
              <div className="mb-4 rounded-full bg-primary-100 p-4">
                <Search className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Track Hashtags</h3>
              <p className="text-neutral-600">
                Monitor posts with specific hashtags to track the reach and impact of your LinkedIn campaigns.
              </p>
            </div>

            <div className="card-hover flex flex-col items-center text-center transition-all hover:translate-y-[-5px]">
              <div className="mb-4 rounded-full bg-secondary-100 p-4">
                <BarChart2 className="h-8 w-8 text-secondary-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Engagement Analytics</h3>
              <p className="text-neutral-600">
                Get comprehensive analytics on likes, comments, and shares to measure campaign performance.
              </p>
            </div>

            <div className="card-hover flex flex-col items-center text-center transition-all hover:translate-y-[-5px]">
              <div className="mb-4 rounded-full bg-accent-100 p-4">
                <Download className="h-8 w-8 text-accent-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Export Reports</h3>
              <p className="text-neutral-600">
                Download campaign data as CSV for detailed analysis and stakeholder reporting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-900 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-white">Ready to Boost Your LinkedIn Marketing?</h2>
            <p className="mb-8 text-lg text-primary-200">
              Start tracking your LinkedIn campaigns today and gain valuable insights into your social media performance.
            </p>
            <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
              {isAuthenticated ? (
                <Link 
                  to="/campaigns/new" 
                  className="btn w-full bg-white px-8 py-3 text-base font-semibold text-primary-900 hover:bg-neutral-100 sm:w-auto"
                >
                  Create New Campaign
                </Link>
              ) : (
                <>
                  <Link 
                    to="/register" 
                    className="btn w-full bg-white px-8 py-3 text-base font-semibold text-primary-900 hover:bg-neutral-100 sm:w-auto"
                  >
                    Create Free Account
                  </Link>
                  <Link 
                    to="/login"
                    className="btn w-full border border-white bg-transparent px-8 py-3 text-base font-semibold text-white hover:bg-primary-800 sm:w-auto"
                  >
                    Log In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { Loader, AlertCircle, Linkedin } from 'lucide-react';

type LoginFormInputs = {
  email: string;
  password: string;
};

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormInputs>();
  const [serverError, setServerError] = useState<string | null>(null);

  const onSubmit = async (data: LoginFormInputs) => {
    setServerError(null);
    try {
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      const message = err instanceof Error ? err.message.toLowerCase() : '';
      if (message.includes('invalid login credentials')) {
        setServerError('Invalid email or password');
      } else if (message.includes('email not confirmed')) {
        setServerError('Please confirm your email address');
      } else {
        setServerError('An error occurred during login. Please try again');
      }
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-neutral-50 px-4 py-12">
      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-6 text-center">
          <Linkedin className="mx-auto mb-2 h-12 w-12 text-primary-500" />
          <h1 className="text-2xl font-bold text-neutral-900">Log in to Campaign Tracker</h1>
          <p className="mt-2 text-neutral-600">Monitor your LinkedIn campaign performance</p>
        </div>

        <div className="card">
          {serverError && (
            <div className="mb-4 flex items-start rounded-md bg-error-50 p-3 text-error-700">
              <AlertCircle className="mr-2 h-5 w-5 flex-shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="email" className="label">Email address</label>
              <input
                id="email"
                type="email"
                className="input w-full"
                placeholder="Enter your email"
                {...register('email', { required: 'Email is required' })}
                disabled={isSubmitting}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && (
                <p id="email-error" className="text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="label">Password</label>
              <input
                id="password"
                type="password"
                className="input w-full"
                placeholder="Enter your password"
                {...register('password', { required: 'Password is required' })}
                disabled={isSubmitting}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
              />
              {errors.password && (
                <p id="password-error" className="text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Log In'
              )}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-neutral-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-700">
              Register now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};


type RegisterFormInputs = {
  name: string;
  email: string;
  password: string;
};

export const RegisterPage: React.FC = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormInputs>();
  const [serverError, setServerError] = useState<string | null>(null);

  const onSubmit = async (data: RegisterFormInputs) => {
    setServerError(null);

    try {
      await registerUser(data.name, data.email, data.password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);

      // Normalize error message string for easier checks
      const message = err instanceof Error ? err.message.toLowerCase() : '';

      if (
        message.includes('user_already_exists') ||
        message.includes('already registered') ||
        message.includes('user already registered')
      ) {
        setServerError('This email is already registered. Please log in instead');
      } else if (message.includes('invalid email')) {
        setServerError('Please enter a valid email address');
      } else {
        setServerError('An error occurred during registration. Please try again');
      }
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-neutral-50 px-4 py-12">
      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-6 text-center">
          <Linkedin className="mx-auto mb-2 h-12 w-12 text-primary-500" />
          <h1 className="text-2xl font-bold text-neutral-900">Create your account</h1>
          <p className="mt-2 text-neutral-600">Start tracking your LinkedIn campaigns</p>
        </div>

        <div className="card">
          {serverError && (
            <div className="mb-4 flex items-start rounded-md bg-error-50 p-3 text-error-700">
              <AlertCircle className="mr-2 h-5 w-5 flex-shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="name" className="label">Full name</label>
              <input
                id="name"
                type="text"
                placeholder="Enter your full name"
                className="input w-full"
                {...register('name', { required: 'Full name is required' })}
                disabled={isSubmitting}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
              {errors.name && (
                <p id="name-error" className="text-sm text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="label">Email address</label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="input w-full"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Enter a valid email address',
                  },
                })}
                disabled={isSubmitting}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && (
                <p id="email-error" className="text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="label">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Create a password"
                className="input w-full"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters long',
                  },
                })}
                disabled={isSubmitting}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
              />
              {errors.password && (
                <p id="password-error" className="text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
              <p className="mt-1 text-xs text-neutral-500">Must be at least 6 characters</p>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Register'
              )}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-neutral-600">
            Already have an account?{' '}
            <a href="/login" className="font-medium text-primary-600 hover:text-primary-700">
              Log in here
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
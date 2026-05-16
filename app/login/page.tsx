import { login, signup, forgotPassword, updatePassword } from './actions';
import { SubmitButton } from '@/components/auth/SubmitButton';
import Link from 'next/link';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; mode?: string; message?: string }>;
}) {
  const params = await searchParams;
  const isSignUp = params.mode === 'signup';
  const isForgot = params.mode === 'forgot';
  const isReset = params.mode === 'reset';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-10 px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-[#171717] border border-[#262626] rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-on-surface">
            {isReset ? 'Update Password' : isForgot ? 'Reset Password' : isSignUp ? 'Create an Account' : 'Welcome Back'}
          </h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            {isReset
              ? 'Enter your new password below'
              : isForgot 
                ? 'Enter your email to receive a reset link' 
                : isSignUp 
                  ? 'Join us to start tracking your eco-impact' 
                  : 'Sign in to access your dashboard'}
          </p>
        </div>

        <form 
          className="space-y-4"
          action={isReset ? updatePassword : isForgot ? forgotPassword : isSignUp ? signup : login}
        >
          {!isReset && (
            <div className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1" htmlFor="name">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-[#262626] rounded-md bg-[#1C1C1C] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="John Doe"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-2 border border-[#262626] rounded-md bg-[#1C1C1C] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>
          )}

          {(isSignUp || !isForgot) && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-on-surface" htmlFor="password">
                  {isReset ? 'New Password' : 'Password'}
                </label>
                {(!isSignUp && !isReset) && (
                  <Link href="/login?mode=forgot" className="text-xs text-primary hover:underline font-semibold">
                    Forgot password?
                  </Link>
                )}
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                className="w-full px-4 py-2 border border-[#262626] rounded-md bg-[#1C1C1C] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="••••••••"
              />
              {isSignUp && (
                <p className="text-xs text-on-surface-variant mt-1">Must be at least 6 characters.</p>
              )}
            </div>
          )}
          
          {params?.error && (
            <p className="text-sm text-red-500 bg-red-500/10 p-3 rounded-md border border-red-500/20">
              {params.error}
            </p>
          )}

          {params?.message && (
            <p className="text-sm text-primary bg-primary/10 p-3 rounded-md border border-primary/20">
              {params.message}
            </p>
          )}

          <div className="pt-2">
            <SubmitButton isSignUp={isSignUp} isForgot={isForgot} isReset={isReset} />
          </div>
        </form>

        <div className="text-center text-sm text-on-surface-variant mt-6 pt-6 border-t border-[#262626]">
          {isForgot ? (
            <p>
              Remember your password?{' '}
              <Link href="/login" className="text-primary hover:underline font-semibold">
                Sign in
              </Link>
            </p>
          ) : isSignUp ? (
            <p>
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline font-semibold">
                Sign in
              </Link>
            </p>
          ) : (
            <p>
              Don't have an account?{' '}
              <Link href="/login?mode=signup" className="text-primary hover:underline font-semibold">
                Sign up
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

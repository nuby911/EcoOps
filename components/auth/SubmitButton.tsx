'use client';

import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';

interface SubmitButtonProps {
  isSignUp?: boolean;
  isForgot?: boolean;
  isReset?: boolean;
}

export function SubmitButton({ isSignUp, isForgot, isReset }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-[#0A0A0A] bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? 'Processing...' : (
        isReset ? 'Update Password' : isForgot ? 'Send Reset Link' : isSignUp ? 'Create Account' : 'Sign In'
      )}
    </button>
  );
}

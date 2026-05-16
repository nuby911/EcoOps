'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: {
        full_name: formData.get('name') as string,
      }
    }
  };

  const origin = (await cookies()).get('origin')?.value || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const { data: authData, error } = await supabase.auth.signUp({
    ...data,
    options: {
      ...data.options,
      emailRedirectTo: `${origin}/auth/callback`,
    }
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}&mode=signup`);
  }
  
  // User record will be created in auth callback after email confirmation
  redirect('/login?message=Check your email to confirm your account.');
}

export async function forgotPassword(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get('email') as string;
  const origin = (await cookies()).get('origin')?.value || ''; // fallback or use headers

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/login?mode=reset`,
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}&mode=forgot`);
  }

  redirect('/login?message=Password reset link sent to your email.&mode=forgot');
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const password = formData.get('password') as string;

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}&mode=reset`);
  }

  redirect('/login?message=Password updated successfully. You can now sign in.');
}

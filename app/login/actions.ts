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

  const { data: authData, error } = await supabase.auth.signUp(data);

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}&mode=signup`);
  }
  
  if (authData.user) {
      // Note: With real email confirmation, the user is created in public.users 
      // but they might not be able to log in until confirmed.
      try {
        await db.insert(users).values({
          id: authData.user.id,
          name: (formData.get('name') as string) || authData.user.email?.split('@')[0] || 'User',
          points: 0,
          totalCo2: 0,
        });
      } catch (e) {
          console.error("User record creation note:", e);
      }
  }

  redirect('/login?message=Check your email to confirm your account.');
}

export async function forgotPassword(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get('email') as string;
  const origin = (await cookies()).get('origin')?.value || ''; // fallback or use headers

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/login?mode=reset`,
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

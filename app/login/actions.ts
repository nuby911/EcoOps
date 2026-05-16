'use server';

import { revalidatePath } from 'next/cache';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { users, wasteLogs } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

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
  try {
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

  console.log('Signup attempt for:', data.email);
  
  const headerList = await headers();
  const host = headerList.get('host') || 'localhost:3000';
  const protocol = headerList.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
  const origin = `${protocol}://${host}`;
  
  console.log('Detected origin:', origin);

    const { data: authData, error } = await supabase.auth.signUp({
      ...data,
      options: {
        ...data.options,
        emailRedirectTo: `${origin}/auth/callback`,
      }
    });

    if (error) {
      console.error('Supabase Auth Error:', error.message);
      return redirect(`/login?error=${encodeURIComponent(error.message)}&mode=signup`);
    }
    
    console.log('Signup successful, redirecting...');
    return redirect('/login?message=Check your email to confirm your account.');
  } catch (err: any) {
    if (err.digest?.startsWith('NEXT_REDIRECT')) throw err;
    console.error('Unexpected Signup Error:', err);
    return redirect(`/login?error=An unexpected error occurred. Please try again.&mode=signup`);
  }
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

export async function forgotPassword(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get('email') as string;
  const headerList = await headers();
  const host = headerList.get('host');
  const protocol = host?.includes('localhost') ? 'http' : 'https';
  const origin = `${protocol}://${host}`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/login?mode=reset`,
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
export async function getProfileStats() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Unauthorized' };

  try {
    const [userData] = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
    if (!userData) return { success: false, error: 'User not found' };

    const logs = await db.select()
      .from(wasteLogs)
      .where(eq(wasteLogs.userId, user.id))
      .orderBy(desc(wasteLogs.createdAt));

    const totalWaste = logs.reduce((sum, log) => sum + log.weight, 0);
    const avgConfidence = logs.length > 0 
      ? logs.reduce((sum, log) => sum + log.aiConfidenceScore, 0) / logs.length 
      : 0;

    return {
      success: true,
      data: {
        user: userData,
        stats: {
          totalWaste,
          avgConfidence,
          logCount: logs.length
        },
        wasteLogs: logs
      }
    };
  } catch (error) {
    console.error('Error fetching profile stats:', error);
    return { success: false, error: 'Failed to fetch data' };
  }
}

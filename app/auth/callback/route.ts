import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/';
  
  // Deteksi origin yang benar (https untuk production)
  const host = request.headers.get('host');
  const protocol = host?.includes('localhost') ? 'http' : 'https';
  const origin = `${protocol}://${host}`;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        try {
          const existingUser = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
          if (existingUser.length === 0) {
            await db.insert(users).values({
              id: user.id,
              name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
              points: 0,
              totalCo2: 0,
            });
          }
        } catch (dbError) {
          console.error('Database sync error in callback:', dbError);
          // Kita tetap lanjut redirect karena user sudah ter-auth di Supabase
        }
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=Could not verify email or link expired`);
}

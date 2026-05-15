'use server';

import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateProfileAction(name: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await db.update(users)
      .set({ name, updatedAt: new Date() })
      .where(eq(users.id, user.id));

    revalidatePath('/profile');
    return { success: true };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { success: false, error: 'Failed to update profile' };
  }
}

export async function getProfileStats() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Unauthorized' };

  try {
    // Fetch User
    const { data: userData } = await supabase
      .from('users')
      .select('id, name, points, total_co2, location')
      .eq('id', user.id)
      .single();

    if (!userData) return { success: false, error: 'User not found' };

    // Fetch Waste Logs for stats and history
    const { data: logs } = await supabase
      .from('waste_logs')
      .select('id, category, weight, points_earned, ai_confidence_score, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    const wasteLogs = logs || [];
    
    const totalWaste = wasteLogs.reduce((sum, log) => sum + log.weight, 0);
    const avgConfidence = wasteLogs.length > 0 
      ? wasteLogs.reduce((sum, log) => sum + log.ai_confidence_score, 0) / wasteLogs.length 
      : 0;

    return {
      success: true,
      data: {
        user: userData,
        stats: {
          totalWaste,
          avgConfidence,
          logCount: wasteLogs.length
        },
        wasteLogs: wasteLogs
      }
    };
  } catch (error) {
    console.error('Error fetching profile stats:', error);
    return { success: false, error: 'Failed to fetch data' };
  }
}

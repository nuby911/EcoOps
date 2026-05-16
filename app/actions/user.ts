'use server';

import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function deleteAccountAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const adminClient = await createAdminClient();

    // 1. Delete from public.users (this will cascade to logs and transactions)
    await db.delete(users).where(eq(users.id, user.id));

    // 2. Delete from auth.users (requires service_role)
    const { error: authError } = await adminClient.auth.admin.deleteUser(user.id);
    
    if (authError) {
      console.error('Error deleting auth user:', authError);
      // Even if auth delete fails, we've deleted their data
    }

    // 3. Sign out the user
    await supabase.auth.signOut();

    return { success: true };
  } catch (error) {
    console.error('Error in deleteAccountAction:', error);
    return { success: false, error: 'Gagal menghapus akun. Pastikan SERVICE_ROLE_KEY sudah terpasang.' };
  }
}
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

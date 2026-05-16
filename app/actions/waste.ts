'use server';

import { db } from '@/lib/db';
import { users, wasteLogs, wasteCategories } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

interface LogWasteParams {
  category: string;
  weight: number;
  aiConfidenceScore: number;
}

export async function logWasteAction(params: LogWasteParams) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized. Please login to scan.' };
  }

  const userId = user.id;
  const { category, weight, aiConfidenceScore } = params;

  // Anti-Fraud Cooldown Check (1 minute)
  const lastLog = await db.select().from(wasteLogs)
    .where(eq(wasteLogs.userId, userId))
    .orderBy(desc(wasteLogs.createdAt))
    .limit(1);

  if (lastLog.length > 0) {
    const timeSinceLastLog = new Date().getTime() - lastLog[0].createdAt.getTime();
    if (timeSinceLastLog < 60000) { // 60,000 ms = 1 minute
      return { success: false, error: 'Anti-fraud cooldown active. Please wait 1 minute between scans.' };
    }
  }

  // Fetch Category Info from DB (Dynamic)
  const [categoryInfo] = await db.select()
    .from(wasteCategories)
    .where(eq(wasteCategories.name, category))
    .limit(1);

  // Fallback multipliers if category not in DB yet
  const multiplier = categoryInfo?.co2Multiplier || 0.1;
  const pointsPerKg = categoryInfo?.pointsPerKg || 5;

  const carbonFootprint = weight * multiplier;
  const pointsEarned = Math.round(weight * pointsPerKg);

  try {
    // 1. Insert waste log
    await db.insert(wasteLogs).values({
      userId,
      category,
      weight,
      carbonFootprint,
      pointsEarned,
      aiConfidenceScore,
    });

    // 2. Fetch & Update user stats using a single transaction-like approach
    const [currentUser] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    if (!currentUser) {
      // Emergency fallback if user not synced yet
      await db.insert(users).values({
        id: userId,
        name: user.email?.split('@')[0] || 'User',
        points: pointsEarned,
        totalCo2: carbonFootprint,
      });
    } else {
      await db.update(users)
        .set({ 
          points: currentUser.points + pointsEarned, 
          totalCo2: currentUser.totalCo2 + carbonFootprint, 
          updatedAt: new Date() 
        })
        .where(eq(users.id, userId));
    }

    // 3. Clear cache to reflect changes immediately
    revalidatePath('/');
    revalidatePath('/profile');
    revalidatePath('/inventory');

    return { success: true, carbonFootprint, pointsEarned };
  } catch (error) {
    console.error('Error logging waste:', error);
    return { success: false, error: 'Gagal mencatat data sampah ke database.' };
  }
}


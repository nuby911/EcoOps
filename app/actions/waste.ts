'use server';

import { db } from '@/lib/db';
import { users, wasteLogs, wasteCategories } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';

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

  // Calculate metrics based on category
  let multiplier = 0;
  let basePoints = 0;

  switch (category.toLowerCase()) {
    case 'plastic':
      multiplier = 1.02;
      basePoints = 15;
      break;
    case 'paper':
      multiplier = 0.46;
      basePoints = 20;
      break;
    case 'metal':
      multiplier = 5.86;
      basePoints = 30;
      break;
    case 'glass':
      multiplier = 0.31;
      basePoints = 10;
      break;
    case 'organic':
      multiplier = 0.12;
      basePoints = 5;
      break;
    default:
      multiplier = 0.1;
      basePoints = 5;
  }

  const carbonFootprint = weight * multiplier;
  const pointsEarned = basePoints;

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

    // 2. Fetch current user stats to increment
    let currentUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    // We expect the user to exist due to the signup action, but just in case:
    if (currentUser.length === 0) {
        await db.insert(users).values({
          id: userId,
          name: user.email?.split('@')[0] || 'User',
          points: 0,
          totalCo2: 0,
        });
        currentUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    }

    const newPoints = currentUser[0].points + pointsEarned;
    const newTotalCo2 = currentUser[0].totalCo2 + carbonFootprint;

    // 3. Update user stats
    await db.update(users)
      .set({ points: newPoints, totalCo2: newTotalCo2, updatedAt: new Date() })
      .where(eq(users.id, userId));

    return { success: true, carbonFootprint, pointsEarned };
  } catch (error) {
    console.error('Error logging waste:', error);
    return { success: false, error: 'Failed to log waste' };
  }
}


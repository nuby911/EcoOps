'use client';

import { BentoCard } from '@/components/ui/BentoCard';
import { TrendingUp, Key, Recycle, TreePine, Leaf, Droplet, ListOrdered, Award, Star } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function Achievements() {
  const [points, setPoints] = useState(0);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchBadges = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // 1. Fetch user points
      const { data: userData } = await supabase
        .from('users')
        .select('points')
        .eq('id', session.user.id)
        .single();
      
      if (userData) setPoints(userData.points);

      // 2. Fetch global leaderboard for ranking
      const { data: leaders } = await supabase
        .from('users')
        .select('id, name, points')
        .order('points', { ascending: false });

      if (leaders) {
        setLeaderboard(leaders.slice(0, 5));
        const rankIndex = leaders.findIndex(l => l.id === session.user.id);
        setUserRank(rankIndex !== -1 ? rankIndex + 1 : null);
      }
    };

    fetchBadges();
  }, []);

  const badgeThresholds = {
    planter: 100,
    zeroWatts: 500,
    loopMaster: 1000,
    aquaSaver: 2500
  };

  const isUnlocked = (threshold: number) => points >= threshold;
  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Header */}
      <div>
        <h2 className="text-4xl font-bold tracking-tight text-on-surface mb-2">Achievements</h2>
        <p className="text-on-surface-variant">Track your resource recovery impact and earn eco perks.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Progress Module */}
        <BentoCard className="md:col-span-8 flex flex-col justify-between">
          <h3 className="text-xl font-semibold text-on-surface mb-8 flex items-center gap-2">
            <TrendingUp className="text-primary-container w-6 h-6" />
            Impact Progression
          </h3>
          
          <div className="space-y-8">
            {/* Progress Item 1 */}
            <div>
              <div className="flex justify-between items-end mb-3">
                <div>
                  <div className="font-jetbrains text-[10px] uppercase text-primary-container mb-1 tracking-widest font-bold">NEXT GOAL</div>
                  <h4 className="text-xl font-semibold text-on-surface">Waste Warrior</h4>
                </div>
                <div className="font-jetbrains text-xs uppercase text-on-surface-variant">{points} / 500 PTS</div>
              </div>
              <div className="h-4 w-full bg-[#262626] rounded-full overflow-hidden">
                <div className="h-full bg-primary-container rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (points / 500) * 100)}%` }}></div>
              </div>
            </div>

            {/* Progress Item 2 */}
            <div>
              <div className="flex justify-between items-end mb-3">
                <div>
                  <div className="font-jetbrains text-[10px] uppercase text-tertiary-container mb-1 tracking-widest font-bold">TOTAL PROGRESS</div>
                  <h4 className="text-xl font-semibold text-on-surface">Carbon Neutral Journey</h4>
                </div>
                <div className="font-jetbrains text-xs uppercase text-on-surface-variant">{Math.min(100, (points / 5000) * 100).toFixed(1)}%</div>
              </div>
              <div className="h-4 w-full bg-[#262626] rounded-full overflow-hidden">
                <div className="h-full bg-tertiary-container rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (points / 5000) * 100)}%` }}></div>
              </div>
            </div>
          </div>
        </BentoCard>

        {/* Perks Module */}
        <BentoCard className="md:col-span-4 flex flex-col">
          <h3 className="text-xl font-semibold text-on-surface mb-6 flex items-center gap-2">
            <Key className="text-secondary-fixed w-6 h-6" />
            Unlocked Perks
          </h3>
          <ul className="space-y-4 flex-1">
            <li className="flex items-start gap-4 pb-4 border-b border-[#262626]">
              <div className="bg-primary-container/10 border border-primary-container p-2.5 rounded-lg flex-shrink-0">
                <Award className="text-primary-container w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-on-surface mb-1">Priority Pickup</p>
                <p className="text-sm text-on-surface-variant line-clamp-2">Guaranteed 24h response for high-volume logs.</p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="bg-primary-container/10 border border-primary-container p-2.5 rounded-lg flex-shrink-0">
                <TrendingUp className="text-primary-container w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-on-surface mb-1">Advanced Analytics</p>
                <p className="text-sm text-on-surface-variant line-clamp-2">Access to predictive waste stream modeling.</p>
              </div>
            </li>
          </ul>
        </BentoCard>

        {/* Eco Hero Badges Module */}
        <BentoCard className="md:col-span-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-semibold text-on-surface flex items-center gap-2">
              <Star className="text-primary-container w-6 h-6" fill="currentColor" />
              Eco Hero Badges
            </h3>
            <span className="font-jetbrains text-xs uppercase text-on-surface-variant">12 / 24 UNLOCKED</span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Loop Master */}
            <div className={`flex flex-col items-center p-6 bg-background border border-[#262626] rounded-xl transition-all cursor-default group ${!isUnlocked(badgeThresholds.loopMaster) && 'opacity-40 grayscale'}`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform ${isUnlocked(badgeThresholds.loopMaster) ? 'bg-primary-container/10 border-2 border-primary-container shadow-[0_0_15px_rgba(34,197,94,0.1)] group-hover:scale-110' : 'bg-[#262626] border-2 border-[#404040]'}`}>
                <Recycle className={`${isUnlocked(badgeThresholds.loopMaster) ? 'text-primary-container' : 'text-on-surface-variant'} w-8 h-8`} />
              </div>
              <p className="font-jetbrains text-[10px] uppercase text-on-surface text-center font-bold tracking-wider">Loop Master</p>
              {!isUnlocked(badgeThresholds.loopMaster) && <p className="text-[8px] text-on-surface-variant mt-1">1000 PTS</p>}
            </div>

            {/* Planter */}
            <div className={`flex flex-col items-center p-6 bg-background border border-[#262626] rounded-xl transition-all cursor-default group ${!isUnlocked(badgeThresholds.planter) && 'opacity-40 grayscale'}`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform ${isUnlocked(badgeThresholds.planter) ? 'bg-primary-container/10 border-2 border-primary-container shadow-[0_0_15px_rgba(34,197,94,0.1)] group-hover:scale-110' : 'bg-[#262626] border-2 border-[#404040]'}`}>
                <TreePine className={`${isUnlocked(badgeThresholds.planter) ? 'text-primary-container' : 'text-on-surface-variant'} w-8 h-8`} />
              </div>
              <p className="font-jetbrains text-[10px] uppercase text-on-surface text-center font-bold tracking-wider">Planter</p>
              {!isUnlocked(badgeThresholds.planter) && <p className="text-[8px] text-on-surface-variant mt-1">100 PTS</p>}
            </div>

            {/* Zero Watts */}
            <div className={`flex flex-col items-center p-6 bg-background border border-[#262626] rounded-xl transition-all cursor-default group ${!isUnlocked(badgeThresholds.zeroWatts) && 'opacity-40 grayscale'}`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform ${isUnlocked(badgeThresholds.zeroWatts) ? 'bg-tertiary-container/10 border-2 border-tertiary-container shadow-[0_0_15px_rgba(255,139,124,0.1)] group-hover:scale-110' : 'bg-[#262626] border-2 border-[#404040]'}`}>
                <Leaf className={`${isUnlocked(badgeThresholds.zeroWatts) ? 'text-tertiary-container' : 'text-on-surface-variant'} w-8 h-8`} />
              </div>
              <p className="font-jetbrains text-[10px] uppercase text-on-surface text-center font-bold tracking-wider">Zero Watts</p>
              {!isUnlocked(badgeThresholds.zeroWatts) && <p className="text-[8px] text-on-surface-variant mt-1">500 PTS</p>}
            </div>

            {/* Aqua Saver */}
            <div className={`flex flex-col items-center p-6 bg-background border border-[#262626] rounded-xl transition-all cursor-default group ${!isUnlocked(badgeThresholds.aquaSaver) && 'opacity-40 grayscale'}`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform ${isUnlocked(badgeThresholds.aquaSaver) ? 'bg-primary-container/10 border-2 border-primary-container shadow-[0_0_15px_rgba(34,197,94,0.1)] group-hover:scale-110' : 'bg-[#262626] border-2 border-[#404040]'}`}>
                <Droplet className={`${isUnlocked(badgeThresholds.aquaSaver) ? 'text-primary-container' : 'text-on-surface-variant'} w-8 h-8`} />
              </div>
              <p className="font-jetbrains text-[10px] uppercase text-on-surface text-center font-bold tracking-wider">Aqua Saver</p>
              {!isUnlocked(badgeThresholds.aquaSaver) && <p className="text-[8px] text-on-surface-variant mt-1">2500 PTS</p>}
            </div>
          </div>
        </BentoCard>

        {/* Leaderboard Module */}
        <BentoCard className="md:col-span-4 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-on-surface flex items-center gap-2">
              <ListOrdered className="text-secondary-fixed w-6 h-6" />
              Facility Rank
            </h3>
            <button className="font-jetbrains text-[10px] uppercase font-bold text-primary-container hover:text-primary transition-colors tracking-widest">FULL LIST</button>
          </div>
          
          <div className="flex-1 flex flex-col gap-3">
            {leaderboard.length === 0 ? (
              <p className="text-sm text-on-surface-variant py-8 text-center">Loading leaderboard...</p>
            ) : (
              leaderboard.map((user, index) => (
                <div key={user.id} className={`flex items-center gap-4 p-3 rounded-xl border ${userRank === index + 1 ? 'bg-primary-container/10 border-primary-container/30' : 'bg-background border-[#262626]'}`}>
                  <div className={`font-bold w-6 text-center text-lg ${index === 0 ? 'text-primary-container' : 'text-on-surface-variant'}`}>{index + 1}</div>
                  <div className="w-10 h-10 rounded-full bg-surface-variant overflow-hidden border border-[#262626] flex items-center justify-center text-on-surface font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-on-surface leading-tight">{userRank === index + 1 ? 'You' : user.name}</p>
                    <p className="font-jetbrains text-[10px] uppercase text-on-surface-variant mt-0.5">Eco Hero</p>
                  </div>
                  <div className={`font-jetbrains text-xs font-bold ${index === 0 ? 'text-primary-container' : 'text-on-surface'}`}>{user.points} pts</div>
                </div>
              ))
            )}
          </div>
        </BentoCard>

      </div>
    </div>
  );
}

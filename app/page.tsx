'use client';

import { BentoCard } from '@/components/ui/BentoCard';
import { Camera, Cloud, Star, ArrowRight, CupSoda, Sprout, Package, Award, User, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function Dashboard() {
  const [totalCo2, setTotalCo2] = useState<number>(0);
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const supabase = createClient();

  const getEcoLevel = (points: number) => {
    if (points >= 2500) return 'Circular Master';
    if (points >= 1000) return 'Eco Hero';
    if (points >= 500) return 'Waste Warrior';
    if (points >= 100) return 'Eco Starter';
    return 'Novice';
  };

  useEffect(() => {
    const fetchStats = async () => {
      // 1. Fetch personal stats
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user) {
        const { data: myData } = await supabase
          .from('users')
          .select('points, total_co2')
          .eq('id', sessionData.session.user.id)
          .single();
        
        if (myData) {
          setTotalCo2(Math.round(myData.total_co2 || 0));
          setTotalPoints(myData.points || 0);
        }
      }

      // 2. Fetch Leaderboard (Top 5 users)
      const { data: topUsers } = await supabase
        .from('users')
        .select('name, points')
        .order('points', { ascending: false })
        .limit(5);

      if (topUsers) {
        setLeaderboard(topUsers);
      }
    };

    fetchStats();

    // Subscribe to realtime changes on users table
    const channel = supabase
      .channel('users-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        (_payload: any) => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  return (
    <div className="flex flex-col gap-8 pb-8">
      <div>
        <h2 className="text-4xl font-bold tracking-tight text-on-surface mb-2">Overview</h2>
        <p className="text-on-surface-variant">Monitor your resource recovery and environmental impact.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Central Camera Scanner */}
        <BentoCard interactive className="md:col-span-8 flex flex-col group min-h-[400px]">
          <div className="flex justify-between items-start mb-4 z-10 relative">
            <div>
              <h3 className="text-xl font-semibold text-on-surface">AI Vision Scanner</h3>
              <p className="text-sm text-on-surface-variant">Live waste classification</p>
            </div>
            <Camera className="w-6 h-6 text-on-surface-variant group-hover:text-primary transition-colors" />
          </div>

          <div className="flex-1 bg-surface-container-low rounded-xl border border-border-bento relative flex items-center justify-center overflow-hidden">
            {/* Simulated Camera Feed Background */}
            <div 
              className="absolute inset-0 opacity-30 bg-cover bg-center grayscale mix-blend-luminosity" 
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=2070&auto=format&fit=crop')" }}
            ></div>
            
            {/* Scanning Reticle */}
            <div className="w-48 h-48 border-2 border-primary/50 relative z-10 flex items-center justify-center">
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary"></div>
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary"></div>
              {/* Scanning Line */}
              <div className="w-full h-0.5 bg-primary/80 absolute top-1/2 left-0 shadow-[0_0_8px_#22c55e]"></div>
            </div>

            {/* Overlay UI */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end z-10">
              <div className="glass border border-border-bento rounded-lg px-4 py-2.5 shadow-lg">
                <p className="font-jetbrains text-[10px] uppercase tracking-wider text-primary font-bold">System Status</p>
                <p className="text-sm font-medium text-on-surface">Ready to classify</p>
              </div>
              <Link 
                href="/scanner"
                className="bg-primary text-on-primary-container font-bold py-2.5 px-8 rounded-full hover:bg-primary-hover transition-all hover:scale-105 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
              >
                Launch Scanner
              </Link>
            </div>
          </div>
        </BentoCard>

        {/* Right Column Stack */}
        <div className="md:col-span-4 flex flex-col gap-3">
          {/* CO2 Saved */}
          <BentoCard className="flex-1 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-on-surface">CO₂ Saved</h3>
                <p className="text-sm text-on-surface-variant">This month</p>
              </div>
              <Cloud className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="text-4xl font-bold tracking-tight text-on-surface mb-4 transition-all">
                {totalCo2.toLocaleString()} <span className="text-base font-normal text-on-surface-variant">kg</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between font-jetbrains text-[10px] uppercase tracking-wider text-on-surface-variant">
                  <span>Target: 200kg</span>
                  <span>{Math.min(100, (totalCo2 / 200) * 100).toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-border-bento rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(34,197,94,0.4)]" style={{ width: `${Math.min(100, (totalCo2 / 200) * 100)}%` }}></div>
                </div>
              </div>
            </div>
          </BentoCard>

          {/* Recovery Points */}
          <BentoCard className="flex-1 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-on-surface">Recovery Points</h3>
                <p className="text-sm text-on-surface-variant">All time</p>
              </div>
              <Star className="w-6 h-6 text-primary" fill="currentColor" />
            </div>
            <div className="flex items-end justify-between">
              <div className="text-4xl font-bold tracking-tight text-on-surface transition-all">
                {totalPoints.toLocaleString()}
              </div>
              <div className="bg-primary-dim border border-primary text-primary inline-flex items-center px-3 py-1 rounded-full font-jetbrains text-xs uppercase tracking-wider mb-1">
                <Award className="w-4 h-4 mr-1" />
                {getEcoLevel(totalPoints)}
              </div>
            </div>
          </BentoCard>
        </div>

        {/* Top Eco Heroes Leaderboard */}
        <BentoCard className="md:col-span-12">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-semibold text-on-surface">Top Eco Heroes</h3>
              <p className="text-sm text-on-surface-variant">Community leaderboard</p>
            </div>
            <Trophy className="w-5 h-5 text-primary" />
          </div>
          
          <div className="flex flex-col">
            {leaderboard.length === 0 ? (
              <p className="text-sm text-on-surface-variant py-4 text-center">No data yet</p>
            ) : (
              leaderboard.map((user, index) => (
                <div key={index} className="border-b border-border-bento py-4 flex items-center justify-between group px-2 hover:bg-surface-container transition-colors rounded-lg last:border-b-0">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-surface-container border border-border-bento flex items-center justify-center text-on-surface-variant group-hover:text-primary group-hover:border-primary/30 transition-all">
                      <span className="text-xs font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-on-surface">{user.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-jetbrains text-sm font-bold text-primary tracking-wider">{user.points} pts</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </BentoCard>
      </div>
    </div>
  );
}

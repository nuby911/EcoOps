'use client';

import { BentoCard } from '@/components/ui/BentoCard';
import { Search, Truck, ArrowUp, AlertTriangle, Recycle, Wine, Wrench, Sprout, ArrowRight, Package } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function Inventory() {
  const [stats, setStats] = useState({
    plastic: 0,
    glass: 0,
    metal: 0,
    organic: 0,
    paper: 0,
    total: 0
  });
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: logs } = await supabase
        .from('waste_logs')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (logs) {
        const newStats = logs.reduce((acc, log) => {
          const cat = log.category.toLowerCase();
          if (acc[cat] !== undefined) {
            acc[cat] += log.weight;
          }
          acc.total += log.weight;
          return acc;
        }, { plastic: 0, glass: 0, metal: 0, organic: 0, paper: 0, total: 0 });

        setStats(newStats);
        setRecentLogs(logs.slice(0, 5));
      }
    };

    fetchData();
  }, []);
  return (
    <div className="flex flex-col gap-8 pb-8">
      {/* Page Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-bold tracking-tight text-on-surface">Inventory Status</h2>
          <p className="text-on-surface-variant mt-1">Real-time overview of categorized waste stock.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-grow sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search inventory..." 
              className="w-full bg-surface-container-lowest border border-[#262626] rounded-lg py-2.5 pl-10 pr-4 text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-on-surface-variant outline-none"
            />
          </div>
          <button className="bg-primary-container text-[#0A0A0A] font-jetbrains text-xs uppercase tracking-wider font-bold py-3 px-6 rounded-lg hover:bg-primary transition-colors flex items-center justify-center gap-2 whitespace-nowrap">
            <Truck className="w-5 h-5" />
            Request Pickup
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Total Storage Card */}
        <BentoCard className="md:col-span-8 relative hover:border-primary-dim transition-colors">
          <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-primary-dim to-transparent pointer-events-none"></div>
          <div className="flex flex-col h-full justify-between relative z-10">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h3 className="font-jetbrains text-xs uppercase tracking-wider text-on-surface-variant mb-1">Total Weight in Storage</h3>
                <div className="text-4xl font-bold tracking-tight text-on-surface flex items-baseline gap-2">
                  {stats.total.toFixed(2)} <span className="text-xl font-semibold text-primary">kg</span>
                </div>
              </div>
              <div className="bg-primary-dim border border-primary px-3 py-1 rounded-full flex items-center gap-1">
                <ArrowUp className="text-primary w-4 h-4" />
                <span className="font-jetbrains text-[10px] text-primary font-bold">12%</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm text-on-surface-variant mb-2">
                <span>Personal Goal Progress</span>
                <span>{Math.min(100, (stats.total / 100) * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full h-2 bg-[#262626] rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (stats.total / 100) * 100)}%` }}></div>
              </div>
            </div>
          </div>
        </BentoCard>

        {/* Urgent Actions */}
        <BentoCard className="md:col-span-4 flex flex-col hover:border-tertiary-container/50 transition-colors">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="text-tertiary-container w-6 h-6" />
            <h3 className="text-xl font-semibold text-on-surface">Action Required</h3>
          </div>
          <div className="flex-grow flex flex-col gap-3">
            <div className="bg-surface border border-[#262626] rounded-lg p-3">
              <p className="text-sm text-on-surface">You have recovered {stats.total.toFixed(1)}kg of resources so far!</p>
              <Link href="/scanner" className="font-jetbrains text-xs uppercase text-primary mt-2 flex hover:underline">Scan More</Link>
            </div>
            {stats.plastic > 10 && (
              <div className="bg-surface border border-[#262626] rounded-lg p-3">
                <p className="text-sm text-on-surface">Plastic stock is ready for a bulk request.</p>
                <Link href="#" className="font-jetbrains text-xs uppercase text-tertiary-container mt-2 flex hover:underline">Request Pickup</Link>
              </div>
            )}
          </div>
        </BentoCard>

        {/* Categorized Waste Stock */}
        <BentoCard interactive className="md:col-span-3 flex flex-col gap-4 group">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center group-hover:bg-primary-dim transition-colors">
              <Recycle className="text-on-surface-variant group-hover:text-primary w-5 h-5 transition-colors" />
            </div>
            <span className="font-jetbrains text-[10px] uppercase text-on-surface-variant">Zone A</span>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-on-surface mb-1">Plastic</h4>
            <div className="text-3xl font-bold tracking-tight text-on-surface">{stats.plastic.toFixed(1)} <span className="text-sm font-normal text-on-surface-variant">kg</span></div>
          </div>
        </BentoCard>

        <BentoCard interactive className="md:col-span-3 flex flex-col gap-4 group">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center group-hover:bg-primary-dim transition-colors">
              <Wine className="text-on-surface-variant group-hover:text-primary w-5 h-5 transition-colors" />
            </div>
            <span className="font-jetbrains text-[10px] uppercase text-on-surface-variant">Zone C</span>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-on-surface mb-1">Glass</h4>
            <div className="text-3xl font-bold tracking-tight text-on-surface">{stats.glass.toFixed(1)} <span className="text-sm font-normal text-on-surface-variant">kg</span></div>
          </div>
        </BentoCard>

        <BentoCard interactive className="md:col-span-3 flex flex-col gap-4 group">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center group-hover:bg-primary-dim transition-colors">
              <Wrench className="text-on-surface-variant group-hover:text-primary w-5 h-5 transition-colors" />
            </div>
            <span className="font-jetbrains text-[10px] uppercase text-on-surface-variant">Zone D</span>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-on-surface mb-1">Metal</h4>
            <div className="text-3xl font-bold tracking-tight text-on-surface">{stats.metal.toFixed(1)} <span className="text-sm font-normal text-on-surface-variant">kg</span></div>
          </div>
        </BentoCard>

        <BentoCard interactive className="md:col-span-3 flex flex-col gap-4 group">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center group-hover:bg-primary-dim transition-colors">
              <Sprout className="text-on-surface-variant group-hover:text-primary w-5 h-5 transition-colors" />
            </div>
            <span className="font-jetbrains text-[10px] uppercase text-on-surface-variant">Zone B</span>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-on-surface mb-1">Organic</h4>
            <div className="text-3xl font-bold tracking-tight text-on-surface">{stats.organic.toFixed(1)} <span className="text-sm font-normal text-on-surface-variant">kg</span></div>
          </div>
        </BentoCard>

        {/* Recent Inventory Logs */}
        <BentoCard className="md:col-span-12 hover:border-outline-variant transition-colors">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#262626]">
            <h3 className="text-xl font-semibold text-on-surface">Recent Scans</h3>
            <Link href="#" className="font-jetbrains text-xs uppercase tracking-wider text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="flex flex-col gap-1">
            {recentLogs.length === 0 ? (
              <p className="text-sm text-on-surface-variant py-8 text-center">No scans recorded yet.</p>
            ) : (
              recentLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-[#1C1C1C] transition-colors border-b border-[#262626] last:border-b-0">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded bg-background border border-[#262626] flex items-center justify-center">
                      {log.category.toLowerCase() === 'plastic' && <Recycle className="text-primary w-5 h-5" />}
                      {log.category.toLowerCase() === 'glass' && <Wine className="text-primary w-5 h-5" />}
                      {log.category.toLowerCase() === 'metal' && <Wrench className="text-primary w-5 h-5" />}
                      {log.category.toLowerCase() === 'organic' && <Sprout className="text-primary w-5 h-5" />}
                      {log.category.toLowerCase() === 'paper' && <Package className="text-primary w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-medium text-on-surface capitalize">{log.category} Scan</p>
                      <p className="font-jetbrains text-[10px] uppercase text-on-surface-variant mt-1">
                        {new Date(log.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">+ {log.weight.toFixed(2)} kg</p>
                    <p className="font-jetbrains text-[10px] uppercase text-on-surface-variant mt-1">Confirmed</p>
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

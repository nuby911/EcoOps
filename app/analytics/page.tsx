'use client';

import { BentoCard } from '@/components/ui/BentoCard';
import { Target, Recycle, Cloud, TrendingUp, MoreVertical, Factory, Building, Warehouse } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRecovered: 0,
    co2Offset: 0,
    targetRate: 0,
    trendData: [] as any[],
    breakdownData: [] as any[],
    barData: [] as any[]
  });

  const supabase = createClient();

  useEffect(() => {
    const fetchAnalytics = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Fetch last 7 days of logs
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: logs } = await supabase
        .from('waste_logs')
        .select('*')
        .eq('user_id', session.user.id)
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      if (logs) {
        // 1. Calculate KPIs
        const totalWeight = logs.reduce((acc, log) => acc + log.weight, 0);
        const totalCo2 = logs.reduce((acc, log) => acc + (log.carbon_footprint || 0), 0);
        
        // 2. Material Breakdown (Donut)
        const breakdown = logs.reduce((acc: any, log) => {
          const cat = log.category;
          acc[cat] = (acc[cat] || 0) + log.weight;
          return acc;
        }, {});

        const colors: any = { plastic: '#22c55e', metal: '#4be277', glass: '#869585', organic: '#3d4a3d', paper: '#4ade80' };
        const breakdownArray = Object.keys(breakdown).map(key => ({
          name: key.charAt(0).toUpperCase() + key.slice(1),
          value: Math.round((breakdown[key] / totalWeight) * 100),
          color: colors[key.toLowerCase()] || '#555'
        }));

        // 3. Trend Data (Last 7 days)
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const trendMap = logs.reduce((acc: any, log) => {
          const day = days[new Date(log.created_at).getDay()];
          acc[day] = (acc[day] || 0) + log.weight;
          return acc;
        }, {});

        const last7DaysTrend = days.map(day => ({
          name: day,
          value: trendMap[day] || 0
        }));

        setStats({
          totalRecovered: totalWeight,
          co2Offset: totalCo2,
          targetRate: Math.min(100, (totalWeight / 50) * 100), // Target 50kg/week
          trendData: last7DaysTrend,
          breakdownData: breakdownArray,
          barData: last7DaysTrend.map(d => ({ name: d.name.charAt(0), value: d.value / 10 })) // Normalized for bar
        });
      }
      setLoading(false);
    };

    fetchAnalytics();
  }, []);
  return (
    <div className="flex flex-col gap-8 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-bold tracking-tight text-on-surface">Analytics Overview</h2>
          <p className="text-on-surface-variant mt-1">System-wide performance metrics and recovery trends.</p>
        </div>
        <div className="flex items-center gap-3 bg-surface-container border border-[#262626] rounded-lg p-2">
          <button className="px-3 py-1.5 text-on-surface-variant hover:text-on-surface font-jetbrains text-xs rounded transition-colors">7D</button>
          <button className="px-3 py-1.5 bg-[#353534] text-on-surface font-jetbrains text-xs rounded border border-[#262626]">30D</button>
          <button className="px-3 py-1.5 text-on-surface-variant hover:text-on-surface font-jetbrains text-xs rounded transition-colors">YTD</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* KPI 1 */}
        <BentoCard className="md:col-span-4 hover:border-outline-variant transition-colors group">
          <div className="flex justify-between items-start mb-4">
            <span className="font-jetbrains text-xs text-on-surface-variant uppercase tracking-wider">Total Recovered</span>
            <Recycle className="text-primary w-5 h-5" />
          </div>
          <div className="text-4xl font-bold tracking-tight text-on-surface mb-2">{stats.totalRecovered.toFixed(1)} <span className="text-xl font-semibold text-on-surface-variant">kg</span></div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-primary/10 border border-primary/30 text-primary font-jetbrains text-[10px] rounded flex items-center gap-1 font-bold">
              <TrendingUp className="w-3 h-3" /> Live
            </span>
            <span className="text-sm text-on-surface-variant">Real-time recovery</span>
          </div>
        </BentoCard>

        {/* KPI 2 */}
        <BentoCard className="md:col-span-4 hover:border-outline-variant transition-colors group">
          <div className="flex justify-between items-start mb-4">
            <span className="font-jetbrains text-xs text-on-surface-variant uppercase tracking-wider">CO2 Offset</span>
            <Cloud className="text-primary w-5 h-5" />
          </div>
          <div className="text-4xl font-bold tracking-tight text-on-surface mb-2">{stats.co2Offset.toFixed(1)} <span className="text-xl font-semibold text-on-surface-variant">kg</span></div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-primary/10 border border-primary/30 text-primary font-jetbrains text-[10px] rounded flex items-center gap-1 font-bold">
              <TrendingUp className="w-3 h-3" /> Calculated
            </span>
            <span className="text-sm text-on-surface-variant">Environmental impact</span>
          </div>
        </BentoCard>

        {/* KPI 3 */}
        <BentoCard className="md:col-span-4 hover:border-outline-variant transition-colors group flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="font-jetbrains text-xs text-on-surface-variant uppercase tracking-wider">Target Rate</span>
            <Target className="text-primary w-5 h-5" />
          </div>
          <div className="flex items-end gap-4">
            <div className="text-4xl font-bold tracking-tight text-on-surface">{stats.targetRate.toFixed(1)}<span className="text-xl font-semibold text-on-surface-variant">%</span></div>
            <div className="flex-1 h-2 bg-background rounded-full mb-3 overflow-hidden border border-[#262626]">
              <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{width: `${stats.targetRate}%`}}></div>
            </div>
          </div>
        </BentoCard>

        {/* Main Line Chart */}
        <BentoCard className="md:col-span-8 flex flex-col min-h-[350px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-on-surface">Recovery Trends</h3>
            <button className="text-on-surface-variant hover:text-on-surface"><MoreVertical className="w-5 h-5" /></button>
          </div>
          <div className="flex-1 w-full h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#bccbb9', fontSize: 12, fontFamily: 'monospace' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#bccbb9', fontSize: 12, fontFamily: 'monospace' }}
                  tickFormatter={(val) => `${val/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '8px' }}
                  itemStyle={{ color: '#22c55e', fontWeight: 'bold' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#4be277" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#131313', strokeWidth: 2, stroke: '#4be277' }} 
                  activeDot={{ r: 6, fill: '#4be277', stroke: '#131313', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </BentoCard>

        {/* Donut Chart */}
        <BentoCard className="md:col-span-4 flex flex-col min-h-[350px]">
          <h3 className="text-xl font-semibold text-on-surface mb-2">Material Breakdown</h3>
          <div className="flex-1 w-full relative min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.breakdownData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {stats.breakdownData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '8px' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-4">
              <span className="text-2xl font-bold text-on-surface">{stats.totalRecovered.toFixed(0)}</span>
              <span className="text-[10px] font-jetbrains uppercase text-on-surface-variant">Total kg</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 mt-4">
            {stats.breakdownData.map((item: any) => (
              <div key={item.name} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-on-surface">{item.name}</span>
                </div>
                <span className="text-on-surface-variant font-jetbrains text-xs">{item.value}%</span>
              </div>
            ))}
          </div>
        </BentoCard>

        {/* Facility Rankings */}
        <BentoCard className="md:col-span-6">
          <h3 className="text-xl font-semibold text-on-surface mb-6">Facility Rankings</h3>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between py-3 border-b border-[#262626]">
              <div className="flex items-center gap-4">
                <span className="font-jetbrains text-xs text-on-surface-variant w-4">01</span>
                <div className="w-10 h-10 rounded bg-background border border-[#262626] flex items-center justify-center">
                  <Factory className="text-primary w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-on-surface">Sector Alpha</h4>
                  <p className="text-sm text-on-surface-variant">Industrial Zone</p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-primary">94%</div>
                <div className="font-jetbrains text-[10px] uppercase text-on-surface-variant">Efficiency</div>
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-[#262626]">
              <div className="flex items-center gap-4">
                <span className="font-jetbrains text-xs text-on-surface-variant w-4">02</span>
                <div className="w-10 h-10 rounded bg-background border border-[#262626] flex items-center justify-center">
                  <Building className="text-primary-container w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-on-surface">Hub Beta</h4>
                  <p className="text-sm text-on-surface-variant">Commercial District</p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-primary-container">88%</div>
                <div className="font-jetbrains text-[10px] uppercase text-on-surface-variant">Efficiency</div>
              </div>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-4">
                <span className="font-jetbrains text-xs text-on-surface-variant w-4">03</span>
                <div className="w-10 h-10 rounded bg-background border border-[#262626] flex items-center justify-center">
                  <Warehouse className="text-[#869585] w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-on-surface">Outpost Gamma</h4>
                  <p className="text-sm text-on-surface-variant">Logistics Park</p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-[#869585]">72%</div>
                <div className="font-jetbrains text-[10px] uppercase text-on-surface-variant">Efficiency</div>
              </div>
            </div>
          </div>
        </BentoCard>

        {/* Daily Offset Activity Bar chart */}
        <BentoCard className="md:col-span-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-semibold text-on-surface">Daily Offset Activity</h3>
              <p className="text-sm text-on-surface-variant mt-1">Volume of processed materials</p>
            </div>
            <span className="px-3 py-1 bg-surface-variant border border-[#262626] rounded-full text-on-surface font-jetbrains text-[10px] uppercase">
              Avg {(stats.totalRecovered / 7).toFixed(1)}kg / day
            </span>
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.barData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} barSize={32}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#bccbb9', fontSize: 12, fontFamily: 'monospace' }}
                  dy={10}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                  contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '8px' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {stats.barData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.value > 1 ? '#4be277' : entry.value > 0.5 ? '#22c55e' : '#3d4a3d'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </BentoCard>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { BentoCard } from '@/components/ui/BentoCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { 
  Wallet, 
  Trash2, 
  Leaf, 
  Award, 
  History, 
  Recycle,
  TreePine,
  Droplet,
  Zap,
  Edit2,
  Share2,
  MapPin,
  BrainCircuit,
  Info,
  CheckCircle2,
  AlertCircle,
  LogOut
} from 'lucide-react';
import { format } from 'date-fns';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { updateProfileAction, deleteAccountAction } from '@/app/actions/user';
import { getProfileStats, logoutAction } from '@/app/login/actions';
import { toast } from 'sonner';

interface ProfileData {
  user: {
    id: string;
    name: string;
    points: number;
    totalCo2: number;
    location: string | null;
    role?: string;
  };
  stats: {
    totalWaste: number;
    avgConfidence: number;
    logCount: number;
  };
  wasteLogs: any[];
}

export default function ProfilePage() {
  const router = useRouter();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsAccountDeleteDialogOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      const result = await getProfileStats();
      if (result.success && result.data) {
        setData(result.data);
        setNewName(result.data.user.name);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const getEcoLevel = (points: number) => {
    if (points >= 2500) return { name: 'Circular Master', min: 2500, max: 5000, color: 'bg-primary-container text-on-primary-container' };
    if (points >= 1000) return { name: 'Eco Hero', min: 1000, max: 2500, color: 'bg-tertiary-container text-on-tertiary-container' };
    if (points >= 500) return { name: 'Waste Warrior', min: 500, max: 1000, color: 'bg-secondary-container text-on-secondary-container' };
    if (points >= 100) return { name: 'Eco Starter', min: 100, max: 500, color: 'bg-surface-variant text-on-surface-variant' };
    return { name: 'Novice', min: 0, max: 100, color: 'bg-surface-container-high text-on-surface-variant' };
  };

  const handleUpdateProfile = async () => {
    if (!newName.trim()) return;
    setIsUpdating(true);
    const result = await updateProfileAction(newName);
    
    if (result.success) {
      setData(prev => prev ? { ...prev, user: { ...prev.user, name: newName } } : null);
      toast.success('Profil berhasil diperbarui');
      setIsEditDialogOpen(false);
    } else {
      toast.error(result.error || 'Gagal memperbarui profil');
    }
    setIsUpdating(false);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logoutAction();
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    const result = await deleteAccountAction();
    if (result.success) {
      toast.success('Akun berhasil dihapus');
      router.push('/login');
      router.refresh();
    } else {
      toast.error(result.error || 'Gagal menghapus akun');
      setIsDeleting(false);
    }
  };

  const handleShare = async (platform: string) => {
    if (!data) return;
    
    const text = `Saya telah menyelamatkan ${data.user.totalCo2.toFixed(1)} kg CO2 dan mengumpulkan ${data.user.points.toLocaleString()} Poin di EcoOps! Jadilah pahlawan lingkungan bersama saya. 🌍♻️`;
    
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://circularmetric.app';
    const ogUrl = new URL('/api/og', baseUrl);
    ogUrl.searchParams.set('name', data.user.name);
    ogUrl.searchParams.set('points', data.user.points.toLocaleString());
    ogUrl.searchParams.set('co2', data.user.totalCo2.toFixed(1));
    ogUrl.searchParams.set('level', getEcoLevel(data.user.points).name);
    
    const url = ogUrl.toString();

    if (navigator.share && platform === 'Network') {
      try {
        await navigator.share({
          title: 'Dampak Lingkungan Saya',
          text: text,
          url: url
        });
        toast.success('Berhasil dibagikan!');
        return;
      } catch (error) {
        // User cancelled share or failed
        console.log('Error sharing:', error);
      }
    }

    let shareUrl = '';
    switch (platform) {
      case 'Twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'LinkedIn':
        // LinkedIn share-offsite doesn't support custom text well, but URL works.
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'WhatsApp':
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`;
        break;
      default:
        // Fallback copy to clipboard
        navigator.clipboard.writeText(text + ' ' + url);
        toast.success('Teks disalin ke clipboard!');
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-on-surface-variant">Data profil tidak ditemukan atau sesi berakhir.</p>
        <Button 
          variant="outline" 
          onClick={handleLogout}
          className="gap-2 bg-error/10 border-error/30 text-error hover:bg-error/20"
        >
          <LogOut className="w-4 h-4" />
          Keluar & Login Kembali
        </Button>
      </div>
    );
  }

  const { user, stats, wasteLogs } = data;
  const ecoLevel = getEcoLevel(user.points);
  const progressPercent = Math.min(100, Math.max(0, ((user.points - ecoLevel.min) / (ecoLevel.max - ecoLevel.min)) * 100));

  return (
    <div className="flex flex-col gap-6 pb-8 max-w-7xl mx-auto">
      {/* 1. Header Akun & Gamifikasi */}
      <BentoCard className="flex flex-col md:flex-row items-start md:items-center gap-6 p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 z-0"></div>
        
        <Avatar className="w-28 h-28 border-4 border-background shadow-xl z-10 relative">
          <AvatarImage src="https://picsum.photos/seed/manager1/200/200" />
          <AvatarFallback className="bg-primary text-on-primary text-4xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </AvatarFallback>
          {/* Status Indicator */}
          <span className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-background rounded-full"></span>
        </Avatar>

        <div className="flex-1 z-10 w-full space-y-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-on-surface">{user.name}</h1>
              <div className="flex items-center gap-2 mt-1.5 text-on-surface-variant">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{user.location || 'Indonesia'}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger render={
                  <Button variant="outline" className="gap-2 bg-surface/50 backdrop-blur-md border-border-bento">
                    <Edit2 className="w-4 h-4" /> Edit
                  </Button>
                } />
                <DialogContent className="glass border-border-bento sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit Profil</DialogTitle>
                    <DialogDescription>Ubah informasi profil Anda.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Nama Lengkap</Label>
                      <Input id="name" value={newName} onChange={(e) => setNewName(e.target.value)} className="bg-surface-container" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleUpdateProfile} disabled={isUpdating} className="bg-primary text-on-primary-container">
                      {isUpdating ? 'Menyimpan...' : 'Simpan'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <DropdownMenu>
                <DropdownMenuTrigger render={
                  <Button className="gap-2 bg-primary text-on-primary-container shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                    <Share2 className="w-4 h-4" /> Bagikan
                  </Button>
                } />
                <DropdownMenuContent align="end" className="w-48 bg-surface border-border-bento">
                  <DropdownMenuLabel>Bagikan Dampak</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleShare('Twitter')}>Twitter / X</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare('LinkedIn')}>LinkedIn</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare('WhatsApp')}>WhatsApp</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>


              <Button
                variant="outline"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="gap-2 bg-error/10 border-error/30 text-error hover:bg-error/20 hover:text-error"
              >
                <LogOut className="w-4 h-4" />
                {isLoggingOut ? 'Keluar...' : 'Keluar'}
              </Button>

              <Dialog open={isDeleteDialogOpen} onOpenChange={setIsAccountDeleteDialogOpen}>
                <DialogTrigger render={
                  <Button
                    variant="outline"
                    className="gap-2 bg-error/5 border-error/20 text-error hover:bg-error/10 hover:text-error"
                  >
                    <Trash2 className="w-4 h-4" /> Hapus Akun
                  </Button>
                } />
                <DialogContent className="glass border-error/20 sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="text-error flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" /> Konfirmasi Penghapusan Akun
                    </DialogTitle>
                    <DialogDescription className="pt-2">
                      Apakah Anda yakin ingin menghapus akun? Tindakan ini **permanen** dan akan menghapus:
                      <ul className="list-disc list-inside mt-2 space-y-1 text-xs">
                        <li>Semua poin dan peringkat Anda</li>
                        <li>Riwayat log sampah dan kontribusi CO2</li>
                        <li>Akses login ke aplikasi EcoOps</li>
                      </ul>
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="ghost" onClick={() => setIsAccountDeleteDialogOpen(false)} disabled={isDeleting}>
                      Batal
                    </Button>
                    <Button 
                      onClick={handleDeleteAccount} 
                      disabled={isDeleting} 
                      className="bg-error text-white hover:bg-error/90"
                    >
                      {isDeleting ? 'Menghapus...' : 'Ya, Hapus Permanen'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="pt-2">
            <div className="flex justify-between items-end mb-2">
              <div className="flex items-center gap-2">
                <Badge className={`${ecoLevel.color} px-3 py-1 text-xs rounded-md shadow-sm`}>
                  {ecoLevel.name}
                </Badge>
                <span className="text-xs font-medium text-on-surface-variant font-jetbrains">LEVEL {Math.floor(user.points / 500) + 1}</span>
              </div>
              <div className="text-xs font-jetbrains font-semibold text-primary">{user.points} / {ecoLevel.max} PTS</div>
            </div>
            <Progress value={progressPercent} className="h-2.5 bg-surface-variant" />
          </div>
        </div>
      </BentoCard>

      {/* 2. Bento Grid Statistik Dampak */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sampah */}
        <BentoCard className="flex flex-col justify-between p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="p-2.5 bg-tertiary-container/20 rounded-xl">
              <Trash2 className="w-5 h-5 text-tertiary-container" />
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-on-surface-variant/50" />
                </TooltipTrigger>
                <TooltipContent>Total berat sampah yang dikumpulkan</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div>
            <p className="text-3xl font-bold tracking-tight text-on-surface">{stats.totalWaste.toFixed(1)} <span className="text-lg text-on-surface-variant font-normal">kg</span></p>
            <p className="text-[11px] uppercase font-jetbrains font-bold tracking-widest text-on-surface-variant mt-1">Total Sampah</p>
          </div>
        </BentoCard>

        {/* Total Poin */}
        <BentoCard className="flex flex-col justify-between p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="p-2.5 bg-primary/20 rounded-xl">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold tracking-tight text-on-surface">{user.points.toLocaleString()}</p>
            <p className="text-[11px] uppercase font-jetbrains font-bold tracking-widest text-on-surface-variant mt-1">Total Poin</p>
          </div>
        </BentoCard>

        {/* CO2 Diselamatkan */}
        <BentoCard className="flex flex-col justify-between p-6 bg-gradient-to-br from-surface-bento to-primary/5 border-primary/20">
          <div className="flex justify-between items-start mb-6">
            <div className="p-2.5 bg-primary/20 rounded-xl">
              <Leaf className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold tracking-tight text-on-surface">{user.totalCo2.toFixed(1)} <span className="text-lg text-on-surface-variant font-normal">kg</span></p>
            <p className="text-[11px] uppercase font-jetbrains font-bold tracking-widest text-on-surface-variant mt-1">CO₂ Diselamatkan</p>
          </div>
        </BentoCard>

        {/* Performa AI */}
        <BentoCard className="flex flex-col justify-between p-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-blue-500/5 opacity-50"></div>
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="p-2.5 bg-blue-500/20 rounded-xl">
              <BrainCircuit className="w-5 h-5 text-blue-500" />
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-on-surface-variant/50" />
                </TooltipTrigger>
                <TooltipContent>Rata-rata akurasi deteksi AI dari semua pindaian Anda</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="relative z-10">
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold tracking-tight text-on-surface">{(stats.avgConfidence * 100).toFixed(1)}%</p>
              {stats.avgConfidence > 0.85 ? (
                <CheckCircle2 className="w-5 h-5 text-primary mb-1.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-500 mb-1.5" />
              )}
            </div>
            <p className="text-[11px] uppercase font-jetbrains font-bold tracking-widest text-on-surface-variant mt-1">Performa AI</p>
          </div>
        </BentoCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 3. Riwayat Aktivitas Cerdas */}
        <BentoCard className="lg:col-span-2 flex flex-col p-0 overflow-hidden">
          <div className="p-6 pb-4 border-b border-border-bento flex items-center justify-between">
            <h3 className="text-lg font-semibold text-on-surface flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              Aktivitas Cerdas
            </h3>
            <Badge variant="outline" className="font-jetbrains text-xs rounded-md bg-surface-container">
              {stats.logCount} Logs
            </Badge>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-surface-container-low/50">
                <TableRow className="border-border-bento hover:bg-transparent">
                  <TableHead className="font-jetbrains text-xs uppercase tracking-widest py-4 pl-6">Tanggal & Waktu</TableHead>
                  <TableHead className="font-jetbrains text-xs uppercase tracking-widest py-4">Kategori</TableHead>
                  <TableHead className="font-jetbrains text-xs uppercase tracking-widest py-4">Berat</TableHead>
                  <TableHead className="font-jetbrains text-xs uppercase tracking-widest py-4">Poin</TableHead>
                  <TableHead className="font-jetbrains text-xs uppercase tracking-widest py-4 pr-6 text-right">Skor AI</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wasteLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-on-surface-variant">Belum ada riwayat pindaian sampah.</TableCell>
                  </TableRow>
                ) : (
                  wasteLogs.map((log) => {
                    // Tag Visual Logic for AI Confidence
                    const conf = log.ai_confidence_score * 100;
                    let tagClass = "bg-red-500/10 text-red-500 border-red-500/20";
                    if (conf >= 90) tagClass = "bg-primary/10 text-primary border-primary/20";
                    else if (conf >= 75) tagClass = "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";

                    return (
                      <TableRow key={log.id} className="border-border-bento hover:bg-surface-container/50 transition-colors">
                        <TableCell className="font-medium text-on-surface pl-6 py-4">
                          <div className="flex flex-col">
                            <span>{format(new Date(log.created_at), 'dd MMM yyyy')}</span>
                            <span className="text-xs text-on-surface-variant">{format(new Date(log.created_at), 'HH:mm')}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary" />
                            <span className="capitalize text-on-surface font-medium">{log.category}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-on-surface">{log.weight} kg</TableCell>
                        <TableCell className="font-bold text-primary">+{log.points_earned}</TableCell>
                        <TableCell className="pr-6 text-right">
                          <Badge variant="outline" className={`font-jetbrains text-xs ${tagClass}`}>
                            {conf.toFixed(0)}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </BentoCard>

        {/* 4. Komunitas & Sosial (Pencapaian) */}
        <BentoCard className="flex flex-col p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-on-surface flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Pencapaian
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {[
              { id: 'planter', name: 'Planter', icon: TreePine, threshold: 100, color: 'text-green-500' },
              { id: 'zero', name: 'Zero Watts', icon: Zap, threshold: 500, color: 'text-yellow-500' },
              { id: 'loop', name: 'Loop Master', icon: Recycle, threshold: 1000, color: 'text-primary' },
              { id: 'aqua', name: 'Aqua Saver', icon: Droplet, threshold: 2500, color: 'text-blue-500' }
            ].map((badge) => {
              const unlocked = user.points >= badge.threshold;
              const Icon = badge.icon;
              return (
                <div key={badge.id} className={`flex flex-col items-center justify-center p-4 border rounded-2xl transition-all duration-300 ${unlocked ? 'bg-surface border-border-bento shadow-sm hover:border-primary/50 hover:-translate-y-1' : 'opacity-40 grayscale bg-surface-container-low border-transparent'}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${unlocked ? 'bg-surface-container shadow-inner' : 'bg-surface-container-high'}`}>
                    <Icon className={`w-6 h-6 ${unlocked ? badge.color : 'text-on-surface-variant'}`} />
                  </div>
                  <p className="text-[10px] uppercase font-jetbrains font-bold text-center text-on-surface tracking-wider leading-tight">{badge.name}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-auto">
            <Separator className="bg-border-bento mb-4" />
            <div className="p-4 bg-primary-container/10 rounded-xl border border-primary-container/20 text-center">
              <p className="text-sm font-medium text-on-surface mb-1">Inspirasi Komunitas</p>
              <p className="text-xs text-on-surface-variant mb-4">Bagikan progres Anda dan ajak teman untuk ikut mendaur ulang!</p>
              <Button onClick={() => handleShare('Network')} className="w-full bg-primary text-on-primary-container shadow-md hover:bg-primary-hover hover:scale-[1.02] transition-all">
                <Share2 className="w-4 h-4 mr-2" />
                Sebarkan Dampak
              </Button>
            </div>
          </div>
        </BentoCard>
      </div>
    </div>
  );
}

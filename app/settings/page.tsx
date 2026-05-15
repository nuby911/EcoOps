'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useSettings } from '@/components/providers/SettingsProvider';
import { Settings, Cpu, Accessibility, ShieldCheck, Download, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

import { createClient } from '@/lib/supabase/client';
import { getWasteCategories, updateWastePoints } from '@/app/actions/waste';

export default function SettingsPage() {
  const { 
    aiConfidenceThreshold, 
    scanCooldown, 
    theme, 
    textSize, 
    hapticEnabled, 
    updateSettings,
    isLoaded
  } = useSettings();

  const [isAdmin, setIsAdmin] = useState(false);
  const [wastePoints, setWastePoints] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function init() {
      // Check role
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();
        
        const adminStatus = userData?.role === 'admin';
        setIsAdmin(adminStatus);

        // Fetch categories if admin
        if (adminStatus) {
          const categories = await getWasteCategories();
          setWastePoints(categories.map(c => ({ id: c.id, name: c.name, points: c.pointsPerKg })));
        }
      }
    }
    init();
  }, [supabase]);

  if (!isLoaded) return null;

  const handleExportCSV = () => {
    const data = [
      ['Date', 'Category', 'Weight', 'Points'],
      ['2026-05-14', 'Plastic', '0.5kg', '10'],
      ['2026-05-14', 'Paper', '1.2kg', '6'],
    ];
    const csvContent = "data:text/csv;charset=utf-8," + data.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "compliance_report.csv");
    document.body.appendChild(link);
    link.click();
    toast.success('Laporan kepatuhan berhasil diekspor ke CSV.');
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    const result = await updateWastePoints(wastePoints);
    if (result.success) {
      toast.success('Berhasil!', {
        description: 'Perubahan poin kategori sampah telah disimpan ke database.',
      });
    } else {
      toast.error('Gagal!', {
        description: 'Terjadi kesalahan: ' + result.error,
      });
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Pengaturan</h1>
        <p className="text-muted-foreground">
          Kelola preferensi aplikasi dan konfigurasi sistem.
        </p>
      </header>

      <Tabs defaultValue="ai" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            <span>AI & Kamera</span>
          </TabsTrigger>
          <TabsTrigger value="accessibility" className="flex items-center gap-2">
            <Accessibility className="w-4 h-4" />
            <span>Aksesibilitas</span>
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Admin</span>
            </TabsTrigger>
          )}
        </TabsList>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <TabsContent value="ai" className="space-y-4 mt-6">
            <Card className="glass border-none shadow-xl">
              <CardHeader>
                <CardTitle>Pengaturan AI & Kamera</CardTitle>
                <CardDescription>
                  Konfigurasi ambang batas deteksi dan perilaku pemindai.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Label htmlFor="sensitivity">Sensitivitas Pemindai AI</Label>
                    <span className="text-sm font-medium text-primary">
                      {Math.round(aiConfidenceThreshold * 100)}%
                    </span>
                  </div>
                  <Slider
                    id="sensitivity"
                    min={0.1}
                    max={0.9}
                    step={0.05}
                    value={[aiConfidenceThreshold]}
                    onValueChange={(val) => {
                      const value = Array.isArray(val) ? val[0] : val;
                      updateSettings({ aiConfidenceThreshold: value });
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Semakin tinggi nilai, semakin ketat AI dalam mengklasifikasikan sampah.
                  </p>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="cooldown">Jeda Waktu Pindaian (Detik)</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="cooldown"
                      type="number"
                      min={0}
                      max={60}
                      value={scanCooldown}
                      onChange={(e) => updateSettings({ scanCooldown: parseInt(e.target.value) || 0 })}
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">detik</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Fitur anti-kecurangan untuk mencegah pemindaian berulang dalam waktu singkat.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accessibility" className="space-y-4 mt-6">
            <Card className="glass border-none shadow-xl">
              <CardHeader>
                <CardTitle>Aksesibilitas & Tampilan</CardTitle>
                <CardDescription>
                  Sesuaikan antarmuka agar nyaman digunakan oleh siapa saja.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Mode Gelap</Label>
                    <p className="text-xs text-muted-foreground">
                      Gunakan tema gelap atau terang.
                    </p>
                  </div>
                  <Switch
                    checked={theme === 'dark'}
                    onCheckedChange={(checked) => updateSettings({ theme: checked ? 'dark' : 'light' })}
                  />
                </div>

                <div className="space-y-4">
                  <Label htmlFor="text-size">Ukuran Teks</Label>
                  <Select
                    value={textSize}
                    onValueChange={(val: any) => updateSettings({ textSize: val })}
                  >
                    <SelectTrigger id="text-size" className="w-[180px]">
                      <SelectValue placeholder="Pilih ukuran" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Kecil</SelectItem>
                      <SelectItem value="medium">Sedang</SelectItem>
                      <SelectItem value="large">Besar</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Menyesuaikan skala teks di seluruh aplikasi (mendukung zoom hingga 200%).
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Umpan Balik Haptic/Suara</Label>
                    <p className="text-xs text-muted-foreground">
                      Memberikan notifikasi fisik/suara saat deteksi berhasil.
                    </p>
                  </div>
                  <Switch
                    checked={hapticEnabled}
                    onCheckedChange={(checked) => updateSettings({ hapticEnabled: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="admin" className="space-y-4 mt-6">
            <Card className="glass border-none shadow-xl">
              <CardHeader>
                <CardTitle>Admin / Operasional</CardTitle>
                <CardDescription>
                  Konfigurasi parameter ekonomi dan ekspor data kepatuhan.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Nilai Poin Kategori Sampah</Label>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2" 
                      onClick={handleSaveChanges}
                      disabled={isSaving}
                    >
                      {isSaving ? 'Menyimpan...' : (
                        <>
                          <Save className="w-4 h-4" /> Simpan Perubahan
                        </>
                      )}
                    </Button>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kategori</TableHead>
                        <TableHead className="w-[150px]">Poin / kg</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {wastePoints.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={2} className="text-center text-muted-foreground">
                            Memuat data kategori...
                          </TableCell>
                        </TableRow>
                      ) : (
                        wastePoints.map((item, idx) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={item.points}
                                onChange={(e) => {
                                  const newPoints = [...wastePoints];
                                  newPoints[idx].points = parseInt(e.target.value) || 0;
                                  setWastePoints(newPoints);
                                }}
                                className="h-8"
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                <div className="pt-4 border-t border-border/50">
                  <Label>Laporan Kepatuhan</Label>
                  <p className="text-xs text-muted-foreground mb-4">
                    Unduh semua log transaksi sampah dalam format CSV untuk pelaporan.
                  </p>
                  <Button onClick={handleExportCSV} className="gap-2">
                    <Download className="w-4 h-4" /> Ekspor Laporan (.CSV)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </motion.div>
      </Tabs>
    </div>
  );
}

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
import { useSettings } from '@/components/providers/SettingsProvider';
import { Settings, Cpu, Accessibility } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

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

  if (!isLoaded) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Pengaturan</h1>
        <p className="text-muted-foreground">
          Kelola preferensi aplikasi dan konfigurasi sistem.
        </p>
      </header>

      <Tabs defaultValue="ai" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[300px]">
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            <span>AI & Kamera</span>
          </TabsTrigger>
          <TabsTrigger value="accessibility" className="flex items-center gap-2">
            <Accessibility className="w-4 h-4" />
            <span>Aksesibilitas</span>
          </TabsTrigger>
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

        </motion.div>
      </Tabs>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import {
  Palette,
  Sparkles,
  Layers,
  CircleDot,
  Smile,
  Sliders,
  ChevronDown,
  ChevronUp,
  Check,
  Zap,
} from 'lucide-react';
import { DecorationState, BackdropShape, BalloonFinish } from '@/types/decoration';
import { THEME_PRESETS, COLOR_PALETTES, DEFAULT_DECORATION } from '@/lib/constants';

interface CustomizerPanelProps {
  state: DecorationState;
  onCollapsedChange: (collapsed: boolean) => void;
  onChange: (updates: Partial<DecorationState>) => void;
}

type TabType = 'presets' | 'backdrop' | 'balloons' | 'characters' | 'props';

export const CustomizerPanel: React.FC<CustomizerPanelProps> = ({ state, onChange, onCollapsedChange }) => {
  const [activeTab, setActiveTab] = useState<TabType>('presets');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'presets', label: 'Tema', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'backdrop', label: 'Backdrop', icon: <Layers className="w-4 h-4" /> },
    { id: 'balloons', label: 'Balon', icon: <CircleDot className="w-4 h-4" /> },
    { id: 'characters', label: 'Karakter', icon: <Smile className="w-4 h-4" /> },
    { id: 'props', label: 'Props & Meja', icon: <Sliders className="w-4 h-4" /> },
  ];

  return (
    <div
      className={`customizer-panel fixed right-3 sm:right-6 bottom-3 sm:bottom-6 z-20 w-[calc(100vw-24px)] sm:w-[420px] max-h-[82vh] bg-neutral-900/90 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col text-white transition-all duration-300 ${
        isCollapsed ? 'translate-y-[calc(100%-56px)]' : 'translate-y-0'
      }`}
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-white/10 select-none">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-amber-400" />
          <span className="font-semibold text-sm sm:text-base">Kustomisasi 3D Dekor</span>
        </div>
        <button
          onClick={() => { setIsCollapsed(!isCollapsed); onCollapsedChange(!isCollapsed); }}
          aria-expanded={!isCollapsed}
          className="p-1 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
          title={isCollapsed ? 'Buka Panel' : 'Kecilkan Panel'}
        >
          {isCollapsed ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation Tabs */}
      <div hidden={isCollapsed} className="panel-tabs flex items-center gap-1 px-3 py-2 border-b border-white/5 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            aria-pressed={activeTab === tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              if (isCollapsed) { setIsCollapsed(false); onCollapsedChange(false); }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-amber-500 text-neutral-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-neutral-300 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-5 text-xs sm:text-sm" hidden={isCollapsed}>
        {/* ================= TAB 1: THEME PRESETS ================= */}
        {activeTab === 'presets' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-neutral-200 mb-1">Preset Tema Populer</h3>
              <p className="text-neutral-400 text-xs">Pilih tema siap pakai sekali klik:</p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {THEME_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => onChange({ ...DEFAULT_DECORATION, ...preset.config, titleText: state.titleText, subtitleText: state.subtitleText, marqueeNumber: state.marqueeNumber })}
                  className="flex items-start gap-3 p-3 rounded-xl bg-neutral-800/60 hover:bg-neutral-800 border border-white/5 hover:border-amber-400/40 text-left transition-all group"
                >
                  <div className="text-2xl p-2 rounded-xl bg-neutral-700/50 group-hover:scale-110 transition-transform">
                    {preset.thumbnail}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="font-semibold text-white group-hover:text-amber-300 transition-colors">
                        {preset.name}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20">
                        {preset.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 line-clamp-1">{preset.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 2: BACKDROP ================= */}
        {activeTab === 'backdrop' && (
          <div className="space-y-4">
            {/* Shape selection */}
            <div>
              <label className="block font-semibold text-neutral-300 mb-2">Model Backdrop</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'double-arch', label: 'Double Arch' },
                  { id: 'single-arch', label: 'Single Arch' },
                  { id: 'wavy', label: 'Wavy Arch' },
                  { id: 'round', label: 'Round Panel' },
                  { id: 'half-arch', label: 'Half Arch' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onChange({ backdropShape: item.id as BackdropShape })}
                    className={`py-2 px-2 text-center rounded-xl border text-xs font-medium transition-all ${
                      state.backdropShape === item.id
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                        : 'bg-neutral-800/60 border-white/5 text-neutral-300 hover:bg-neutral-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-neutral-300 mb-1.5">
                  Warna Arch Utama
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={state.backdropMainColor}
                    onChange={(e) => onChange({ backdropMainColor: e.target.value })}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <div className="flex-1 flex gap-1.5 flex-wrap">
                    {COLOR_PALETTES.slice(0, 6).map((c) => (
                      <button
                        key={c.hex}
                        onClick={() => onChange({ backdropMainColor: c.hex })}
                        style={{ backgroundColor: c.hex }}
                        className={`w-6 h-6 rounded-full border transition-transform ${
                          state.backdropMainColor.toLowerCase() === c.hex.toLowerCase()
                            ? 'scale-110 border-white ring-2 ring-amber-400'
                            : 'border-white/20'
                        }`}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {state.backdropShape === 'double-arch' && (
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1.5">
                    Warna Arch Kiri (Secondary)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={state.backdropSecondaryColor}
                      onChange={(e) => onChange({ backdropSecondaryColor: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <div className="flex-1 flex gap-1.5 flex-wrap">
                      {COLOR_PALETTES.slice(0, 6).map((c) => (
                        <button
                          key={c.hex}
                          onClick={() => onChange({ backdropSecondaryColor: c.hex })}
                          style={{ backgroundColor: c.hex }}
                          className={`w-6 h-6 rounded-full border transition-transform ${
                            state.backdropSecondaryColor.toLowerCase() === c.hex.toLowerCase()
                              ? 'scale-110 border-white ring-2 ring-amber-400'
                              : 'border-white/20'
                          }`}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* LED Neon Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-800/60 border border-white/5">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <div>
                  <span className="font-semibold block">LED Neon Strip Outline</span>
                  <span className="text-[11px] text-neutral-400">Efek glow menyala di tepian arch</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={state.backdropLedGlow}
                onChange={(e) => onChange({ backdropLedGlow: e.target.checked })}
                className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
              />
            </div>

            {state.backdropLedGlow && <label className="flex items-center justify-between text-neutral-300">
              Warna LED
              <input aria-label="Warna LED" type="color" value={state.backdropLedColor} onChange={e => onChange({ backdropLedColor: e.target.value })} className="w-8 h-8 bg-transparent" />
            </label>}
            {/* Custom Board Text */}
            <div className="space-y-2 pt-1 border-t border-white/10">
              <label className="block font-semibold text-neutral-300">Tulisan Nama & Acara</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-neutral-400 block mb-1">Nama Utama</span>
                  <input
                    type="text"
                    aria-label="Nama Utama"
                    maxLength={32}
                    value={state.titleText}
                    onChange={(e) => onChange({ titleText: e.target.value })}
                    placeholder="Noah's"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 block mb-1">Subjudul / Usia</span>
                  <input
                    type="text"
                    aria-label="Subjudul / Usia"
                    maxLength={48}
                    value={state.subtitleText}
                    onChange={(e) => onChange({ subtitleText: e.target.value })}
                    placeholder="WILD ONE"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-neutral-300">Warna Tulisan</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={state.textColor}
                    onChange={(e) => onChange({ textColor: e.target.value })}
                    className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                  />
                  <span className="text-xs font-mono text-neutral-400">{state.textColor}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: BALLOONS ================= */}
        {activeTab === 'balloons' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-neutral-200 mb-1">Palet Warna Balon Garland</h3>
              <p className="text-neutral-400 text-xs">Kombinasi 3 warna balon organik + motif:</p>
            </div>

            {/* Primary Balloon Color */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-300 font-medium">Warna Utama (Primary)</span>
                <span className="text-[11px] font-mono text-neutral-400">{state.balloonPrimary}</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={state.balloonPrimary}
                  onChange={(e) => onChange({ balloonPrimary: e.target.value })}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <div className="flex-1 flex gap-1.5 flex-wrap">
                  {COLOR_PALETTES.map((c) => (
                    <button
                      key={c.hex}
                      onClick={() => onChange({ balloonPrimary: c.hex })}
                      style={{ backgroundColor: c.hex }}
                      className={`w-5 h-5 rounded-full border ${
                        state.balloonPrimary.toLowerCase() === c.hex.toLowerCase()
                          ? 'ring-2 ring-amber-400 scale-110'
                          : 'border-white/20'
                      }`}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Secondary Balloon Color */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-300 font-medium">Warna Kedua (Secondary)</span>
                <span className="text-[11px] font-mono text-neutral-400">{state.balloonSecondary}</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={state.balloonSecondary}
                  onChange={(e) => onChange({ balloonSecondary: e.target.value })}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <div className="flex-1 flex gap-1.5 flex-wrap">
                  {COLOR_PALETTES.map((c) => (
                    <button
                      key={c.hex}
                      onClick={() => onChange({ balloonSecondary: c.hex })}
                      style={{ backgroundColor: c.hex }}
                      className={`w-5 h-5 rounded-full border ${
                        state.balloonSecondary.toLowerCase() === c.hex.toLowerCase()
                          ? 'ring-2 ring-amber-400 scale-110'
                          : 'border-white/20'
                      }`}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Accent Balloon Color */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-300 font-medium">Warna Aksen (Accent)</span>
                <span className="text-[11px] font-mono text-neutral-400">{state.balloonAccent}</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={state.balloonAccent}
                  onChange={(e) => onChange({ balloonAccent: e.target.value })}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <div className="flex-1 flex gap-1.5 flex-wrap">
                  {COLOR_PALETTES.map((c) => (
                    <button
                      key={c.hex}
                      onClick={() => onChange({ balloonAccent: c.hex })}
                      style={{ backgroundColor: c.hex }}
                      className={`w-5 h-5 rounded-full border ${
                        state.balloonAccent.toLowerCase() === c.hex.toLowerCase()
                          ? 'ring-2 ring-amber-400 scale-110'
                          : 'border-white/20'
                      }`}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Pattern Balloons Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-800/60 border border-white/5">
              <div>
                <span className="font-semibold block">Balon Motif Bintik Dalmatian / Safari</span>
                <span className="text-[11px] text-neutral-400">Motif bintik hewan seperti pada foto</span>
              </div>
              <input
                type="checkbox"
                checked={state.showPatternBalloons}
                onChange={(e) => onChange({ showPatternBalloons: e.target.checked })}
                className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
              />
            </div>

            <label className="block space-y-2">
              <span className="font-semibold text-neutral-300">Motif balon</span>
              <select aria-label="Motif balon" value={state.balloonPatternType} onChange={e => onChange({ balloonPatternType: e.target.value as DecorationState['balloonPatternType'], showPatternBalloons: e.target.value !== 'none' })} className="w-full bg-neutral-800 rounded-lg p-2.5">
                <option value="dalmatian">Bintik safari</option><option value="polka">Polka dot</option><option value="none">Tanpa motif</option>
              </select>
            </label>
            <label className="flex items-center justify-between text-neutral-300">
              Warna dasar motif
              <input aria-label="Warna dasar motif" type="color" value={state.balloonPattern} onChange={e => onChange({ balloonPattern: e.target.value })} className="w-8 h-8 bg-transparent" />
            </label>
            {/* Balloon Finish */}
            <div>
              <label className="block font-semibold text-neutral-300 mb-2">Finishing Material Balon</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'glossy', label: 'Glossy Latex' },
                  { id: 'matte', label: 'Matte Pastel' },
                  { id: 'metallic', label: 'Chrome Metallic' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => onChange({ balloonFinish: f.id as BalloonFinish })}
                    className={`py-2 px-2 text-center rounded-xl border text-xs font-medium transition-all ${
                      state.balloonFinish === f.id
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                        : 'bg-neutral-800/60 border-white/5 text-neutral-300 hover:bg-neutral-800'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: CHARACTERS ================= */}
        {activeTab === 'characters' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-neutral-200 mb-1">Karakter Cutout Standee</h3>
              <p className="text-neutral-400 text-xs">Pilih boneka / karakter hewan 2.5D di panggung:</p>
            </div>

            {/* Left Character */}
            <div>
              <label className="block font-semibold text-neutral-300 mb-1.5">
                Karakter Sisi Kiri (Tinggi)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'giraffe', label: '🦒 Jerapah' },
                  { id: 'dino', label: '🦖 Dinosaurus' },
                  { id: 'bear', label: '🧸 Beruang' },
                  { id: 'astronaut', label: '👨‍🚀 Astronaut' },
                  { id: 'none', label: '❌ Kosong' },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onChange({ leftCharacter: c.id as any })}
                    className={`p-2 rounded-xl border text-xs font-medium transition-all ${
                      state.leftCharacter === c.id
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                        : 'bg-neutral-800/60 border-white/5 text-neutral-300 hover:bg-neutral-800'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Center-Left Character */}
            <div>
              <label className="block font-semibold text-neutral-300 mb-1.5">
                Karakter Tengah Kiri
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'lion', label: '🦁 Anak Singa' },
                  { id: 'tiger', label: '🐯 Harimau' },
                  { id: 'rabbit', label: '🐰 Kelinci' },
                  { id: 'none', label: '❌ Kosong' },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onChange({ centerLeftCharacter: c.id as any })}
                    className={`p-2 rounded-xl border text-xs font-medium transition-all ${
                      state.centerLeftCharacter === c.id
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                        : 'bg-neutral-800/60 border-white/5 text-neutral-300 hover:bg-neutral-800'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Center-Right Character */}
            <div>
              <label className="block font-semibold text-neutral-300 mb-1.5">
                Karakter Tengah Kanan
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'elephant', label: '🐘 Anak Gajah' },
                  { id: 'koala', label: '🐨 Koala' },
                  { id: 'fox', label: '🦊 Rubah' },
                  { id: 'none', label: '❌ Kosong' },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onChange({ centerRightCharacter: c.id as any })}
                    className={`p-2 rounded-xl border text-xs font-medium transition-all ${
                      state.centerRightCharacter === c.id
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                        : 'bg-neutral-800/60 border-white/5 text-neutral-300 hover:bg-neutral-800'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 5: PROPS & TABLE ================= */}
        {activeTab === 'props' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-neutral-200 mb-1">Lampu Marquee & Meja Kue</h3>
              <p className="text-neutral-400 text-xs">Atur aksesoris panggung dan lampu:</p>
            </div>

            {/* Marquee Number */}
            <div className="p-3 rounded-xl bg-neutral-800/60 border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold block">Lampu Angka Marquee 3D</span>
                  <span className="text-[11px] text-neutral-400">Angka umur ulang tahun berlampu</span>
                </div>
                {/* Lit Switch */}
                <button
                  onClick={() => onChange({ marqueeLit: !state.marqueeLit })}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                    state.marqueeLit
                      ? 'bg-amber-400 text-neutral-950 border-amber-300 shadow-md shadow-amber-400/20'
                      : 'bg-neutral-700 text-neutral-300 border-white/10'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{state.marqueeLit ? 'Nyala' : 'Mati'}</span>
                </button>
              </div>

              {/* Number Selector */}
              <div className="grid grid-cols-5 gap-1.5">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    aria-label={`Angka ${num}`}
                    aria-pressed={state.marqueeNumber === num}
                    onClick={() => onChange({ marqueeNumber: num })}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                      state.marqueeNumber === num
                        ? 'bg-amber-500 text-neutral-950 border-amber-400'
                        : 'bg-neutral-800 text-neutral-300 border-white/5 hover:bg-neutral-700'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Pedestal & Cake */}
            <div className="p-3 rounded-xl bg-neutral-800/60 border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Meja Silinder Kue (Pedestal)</span>
                <input
                  type="checkbox"
                  checked={state.showPedestal}
                  onChange={(e) => onChange({ showPedestal: e.target.checked })}
                  className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                />
              </div>

              {state.showPedestal && (
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-400">Warna Meja</span>
                    <input
                      type="color"
                      value={state.pedestalColor}
                      onChange={(e) => onChange({ pedestalColor: e.target.value })}
                      className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-400">Kue Ulang Tahun + Lilin</span>
                    <input
                      type="checkbox"
                      checked={state.showCake}
                      onChange={(e) => onChange({ showCake: e.target.checked })}
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            <label className="block space-y-2">
              <span className="font-semibold text-neutral-300">Finishing meja</span>
              <select aria-label="Finishing meja" value={state.pedestalStyle} onChange={e => onChange({ pedestalStyle: e.target.value as DecorationState['pedestalStyle'] })} className="w-full bg-neutral-800 rounded-lg p-2.5">
                <option value="smooth">Halus</option><option value="ribbed">Beralur / fluted</option>
              </select>
            </label>
            <label className="block space-y-2">
              <span className="font-semibold text-neutral-300">Lantai studio</span>
              <select aria-label="Lantai studio" value={state.floorType} onChange={e => onChange({ floorType: e.target.value as DecorationState['floorType'] })} className="w-full bg-neutral-800 rounded-lg p-2.5">
                <option value="wood">Kayu hangat</option><option value="marble">Batu krem poles</option><option value="checkered">Kotak klasik</option>
              </select>
            </label>
            <label className="block space-y-2">
              <span className="flex justify-between text-neutral-300">Cahaya utama <span>{state.spotlightIntensity.toFixed(1)}×</span></span>
              <input aria-label="Cahaya utama" type="range" min="0.3" max="3" step="0.1" value={state.spotlightIntensity} onChange={e => onChange({ spotlightIntensity: Number(e.target.value) })} className="w-full accent-amber-400" />
            </label>
            {/* Tropical Foliage Leaves */}
            <div className="p-3 rounded-xl bg-neutral-800/60 border border-white/5 space-y-2.5">
              <span className="font-semibold block">Hiasan Daun Tropis</span>
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-300">Daun Monstera Deliciosa</span>
                <input
                  type="checkbox"
                  checked={state.showMonstera}
                  onChange={(e) => onChange({ showMonstera: e.target.checked })}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-300">Daun Palem Hijau</span>
                <input
                  type="checkbox"
                  checked={state.showPalms}
                  onChange={(e) => onChange({ showPalms: e.target.checked })}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

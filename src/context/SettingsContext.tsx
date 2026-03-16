import React, { createContext, useContext, useState, useEffect } from 'react';

export type GasSetting = 'standard' | 'fast' | 'instant' | 'custom';
export type Language    = 'en' | 'zh' | 'es' | 'fr' | 'de' | 'ja' | 'ko' | 'pt' | 'ru' | 'tr' | 'vi';
export type ChainMode   = 'pancakeswap' | 'tatum';

export interface GlobalSettings {
  // Swap
  slippage:           number;
  deadline:           number;       // minutes
  gasSpeed:           GasSetting;
  customGasPrice:     string;
  expertMode:         boolean;
  singleHop:          boolean;
  // Display
  language:           Language;
  showTestnets:       boolean;
  audioEffects:       boolean;
  // Chain
  activeChainId:      number;
  chainMode:          ChainMode;
}

const DEFAULTS: GlobalSettings = {
  slippage:       0.5,
  deadline:       20,
  gasSpeed:       'standard',
  customGasPrice: '',
  expertMode:     false,
  singleHop:      false,
  language:       'en',
  showTestnets:   false,
  audioEffects:   false,
  activeChainId:  56,
  chainMode:      'pancakeswap',
};

interface SettingsCtx {
  settings:    GlobalSettings;
  update:      (patch: Partial<GlobalSettings>) => void;
  resetAll:    () => void;
}

const SettingsContext = createContext<SettingsCtx>({
  settings: DEFAULTS,
  update:   () => {},
  resetAll: () => {},
});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<GlobalSettings>(DEFAULTS);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pcs-settings');
      if (saved) setSettings({ ...DEFAULTS, ...JSON.parse(saved) });
    } catch {}
  }, []);

  // Load chainMode from admin settings (overrides localStorage)
  useEffect(() => {
    fetch('/api/admin/data?section=siteSettings')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.chainMode) {
          setSettings(prev => ({ ...prev, chainMode: d.chainMode }));
        }
      })
      .catch(() => {});
  }, []);

  const update = (patch: Partial<GlobalSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...patch };
      try { localStorage.setItem('pcs-settings', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const resetAll = () => {
    setSettings(DEFAULTS);
    try { localStorage.removeItem('pcs-settings'); } catch {}
  };

  return (
    <SettingsContext.Provider value={{ settings, update, resetAll }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: 'en', label: 'English',    flag: '🇺🇸' },
  { code: 'zh', label: '中文',        flag: '🇨🇳' },
  { code: 'es', label: 'Español',    flag: '🇪🇸' },
  { code: 'fr', label: 'Français',   flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch',    flag: '🇩🇪' },
  { code: 'ja', label: '日本語',      flag: '🇯🇵' },
  { code: 'ko', label: '한국어',      flag: '🇰🇷' },
  { code: 'pt', label: 'Português',  flag: '🇧🇷' },
  { code: 'ru', label: 'Русский',    flag: '🇷🇺' },
  { code: 'tr', label: 'Türkçe',     flag: '🇹🇷' },
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
];

export const GAS_LABELS: Record<GasSetting, { label: string; gwei: string }> = {
  standard: { label: 'Standard',  gwei: '5'   },
  fast:     { label: 'Fast',      gwei: '6'   },
  instant:  { label: 'Instant',   gwei: '7'   },
  custom:   { label: 'Custom',    gwei: ''    },
};

import React from 'react';

export const PancakeLogo: React.FC<{ size?: number }> = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <circle cx="20" cy="20" r="20" fill="#1FC7D4"/>
    <path d="M20 8C13.373 8 8 13.373 8 20C8 26.627 13.373 32 20 32C26.627 32 32 26.627 32 20C32 13.373 26.627 8 20 8Z" fill="#fff" fillOpacity="0.2"/>
    <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="18" fontWeight="700" fontFamily="Kanit,sans-serif">🥞</text>
  </svg>
);

export const BunnyIcon: React.FC<{ size?: number }> = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <ellipse cx="20" cy="28" rx="12" ry="8" fill="#D5B8FF"/>
    <ellipse cx="14" cy="12" rx="4" ry="8" fill="#D5B8FF"/>
    <ellipse cx="26" cy="12" rx="4" ry="8" fill="#D5B8FF"/>
    <ellipse cx="14" cy="11" rx="2" ry="6" fill="#ED4B9E"/>
    <ellipse cx="26" cy="11" rx="2" ry="6" fill="#ED4B9E"/>
    <ellipse cx="20" cy="24" rx="10" ry="8" fill="#F5E6FF"/>
    <circle cx="16" cy="23" r="2" fill="#280D5F"/>
    <circle cx="24" cy="23" r="2" fill="#280D5F"/>
    <circle cx="16.8" cy="22.2" r="0.8" fill="white"/>
    <circle cx="24.8" cy="22.2" r="0.8" fill="white"/>
    <ellipse cx="20" cy="27" rx="3" ry="2" fill="#ED4B9E"/>
    <path d="M17 29 Q20 31 23 29" stroke="#ED4B9E" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
  </svg>
);

export const CakeIcon: React.FC<{ size?: number }> = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="16" fill="#1FC7D4"/>
    <text x="50%" y="56%" dominantBaseline="middle" textAnchor="middle" fontSize="18">🥞</text>
  </svg>
);

export const SwapIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/>
    <path d="M7 16V4m0 0L3 8m4-4l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <path d="M17 8v12m0 0l4-4m-4 4l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
);

export const WalletIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-1V5a1 1 0 00-1-1H4zm9 1v1H6V5h7zm-1 8a1 1 0 110-2 1 1 0 010 2z"/>
  </svg>
);

export const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
  </svg>
);

export const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
);

export const ExternalLinkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
    <path d="M5 2H2v10h10V9M7 2h5v5M12 2L6 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
);

export const InfoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <path d="M8 7v4M8 5.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

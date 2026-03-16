import React from 'react';
import styled from 'styled-components';

/* ─── Section Card ─────────────────────────────────────────────────────── */
export const Section = styled.div`
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 18px;
  padding: 24px;
  margin-bottom: 20px;
`;

export const SectionTitle = styled.h2`
  font-size: 16px;
  font-weight: 700;
  color: white;
  margin: 0 0 18px;
  font-family: 'Kanit', sans-serif;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const SectionDesc = styled.p`
  font-size: 13px;
  color: rgba(255,255,255,0.45);
  margin: -12px 0 18px;
`;

/* ─── Form row ─────────────────────────────────────────────────────────── */
export const FormRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
`;

export const FormRowHoriz = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

export const FormGrid = styled.div<{ cols?: number }>`
  display: grid;
  grid-template-columns: repeat(${({ cols }) => cols || 2}, 1fr);
  gap: 16px;
  margin-bottom: 16px;

  @media (max-width: 640px) { grid-template-columns: 1fr; }
`;

export const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: rgba(255,255,255,0.7);
  font-family: 'Kanit', sans-serif;
`;

export const Hint = styled.div`
  font-size: 11px;
  color: rgba(255,255,255,0.35);
  margin-top: 4px;
`;

/* ─── Inputs ───────────────────────────────────────────────────────────── */
export const Input = styled.input`
  width: 100%;
  padding: 11px 14px;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 12px;
  color: white;
  font-size: 14px;
  font-family: 'Kanit', sans-serif;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
  &:focus { border-color: #1FC7D4; }
  &::placeholder { color: rgba(255,255,255,0.28); }
`;

export const Textarea = styled.textarea`
  width: 100%;
  padding: 11px 14px;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 12px;
  color: white;
  font-size: 14px;
  font-family: 'Kanit', sans-serif;
  outline: none;
  resize: vertical;
  min-height: 90px;
  transition: border-color 0.2s;
  box-sizing: border-box;
  &:focus { border-color: #1FC7D4; }
  &::placeholder { color: rgba(255,255,255,0.28); }
`;

export const Select = styled.select`
  width: 100%;
  padding: 11px 14px;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 12px;
  color: white;
  font-size: 14px;
  font-family: 'Kanit', sans-serif;
  outline: none;
  cursor: pointer;
  transition: border-color 0.2s;
  box-sizing: border-box;
  &:focus { border-color: #1FC7D4; }
  option { background: #1a1720; color: white; }
`;

/* ─── Color picker wrapper ──────────────────────────────────────────────── */
export const ColorPickerWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const ColorSwatch = styled.div<{ $color: string }>`
  width: 36px; height: 36px; border-radius: 10px;
  background: ${({ $color }) => $color};
  border: 2px solid rgba(255,255,255,0.2);
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  input[type="color"] {
    position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%;
  }
`;

/* ─── Buttons ──────────────────────────────────────────────────────────── */
export const SaveBtn = styled.button<{ $loading?: boolean }>`
  padding: 12px 28px;
  background: linear-gradient(135deg, #1FC7D4, #7645D9);
  border: none; border-radius: 14px;
  color: white; font-size: 15px; font-weight: 700;
  font-family: 'Kanit', sans-serif; cursor: pointer;
  transition: all 0.2s; opacity: ${({ $loading }) => $loading ? 0.7 : 1};
  &:hover { transform: ${({ $loading }) => $loading ? 'none' : 'translateY(-2px)'}; }
`;

export const DangerBtn = styled.button`
  padding: 10px 20px;
  background: rgba(237,75,158,0.15);
  border: 1px solid rgba(237,75,158,0.35);
  border-radius: 12px;
  color: #ED4B9E; font-size: 14px; font-weight: 600;
  font-family: 'Kanit', sans-serif; cursor: pointer;
  transition: all 0.15s;
  &:hover { background: rgba(237,75,158,0.25); }
`;

export const SecondaryBtn = styled.button`
  padding: 10px 20px;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 12px;
  color: rgba(255,255,255,0.7); font-size: 14px; font-weight: 600;
  font-family: 'Kanit', sans-serif; cursor: pointer;
  transition: all 0.15s;
  &:hover { background: rgba(255,255,255,0.12); color: white; }
`;

/* ─── Toggle ───────────────────────────────────────────────────────────── */
const ToggleTrack = styled.div<{ $on: boolean }>`
  width: 44px; height: 24px; border-radius: 12px;
  background: ${({ $on }) => $on ? '#1FC7D4' : 'rgba(255,255,255,0.15)'};
  position: relative; cursor: pointer; transition: background 0.2s; flex-shrink: 0;
`;
const ToggleThumb = styled.div<{ $on: boolean }>`
  width: 20px; height: 20px; border-radius: 50%; background: white;
  position: absolute; top: 2px;
  left: ${({ $on }) => $on ? '22px' : '2px'};
  transition: left 0.2s; box-shadow: 0 1px 4px rgba(0,0,0,0.3);
`;

interface ToggleProps { value: boolean; onChange: (v: boolean) => void; }
export const Toggle: React.FC<ToggleProps> = ({ value, onChange }) => (
  <ToggleTrack $on={value} onClick={() => onChange(!value)}>
    <ToggleThumb $on={value} />
  </ToggleTrack>
);

export const ToggleRow = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  &:last-child { border-bottom: none; }
  gap: 12px;
`;

export const ToggleInfo = styled.div`flex: 1;`;
export const ToggleLabel = styled.div`font-size: 14px; font-weight: 600; color: white; margin-bottom: 2px;`;
export const ToggleDesc  = styled.div`font-size: 12px; color: rgba(255,255,255,0.4);`;

/* ─── Toast notification ───────────────────────────────────────────────── */
const ToastEl = styled.div<{ $visible: boolean; $type: 'success' | 'error' }>`
  position: fixed; bottom: 24px; right: 24px; z-index: 9999;
  padding: 14px 20px; border-radius: 14px;
  background: ${({ $type }) => $type === 'success' ? 'rgba(49,208,170,0.15)' : 'rgba(237,75,158,0.15)'};
  border: 1px solid ${({ $type }) => $type === 'success' ? 'rgba(49,208,170,0.4)' : 'rgba(237,75,158,0.4)'};
  color: ${({ $type }) => $type === 'success' ? '#31D0AA' : '#ED4B9E'};
  font-size: 14px; font-weight: 600; font-family: 'Kanit', sans-serif;
  opacity: ${({ $visible }) => $visible ? 1 : 0};
  transform: ${({ $visible }) => $visible ? 'translateY(0)' : 'translateY(12px)'};
  transition: all 0.3s; pointer-events: none;
`;

export const useAdminToast = () => {
  const [toast, setToast] = React.useState<{ msg: string; type: 'success'|'error'; visible: boolean } | null>(null);
  const show = (msg: string, type: 'success'|'error' = 'success') => {
    setToast({ msg, type, visible: true });
    setTimeout(() => setToast(t => t ? { ...t, visible: false } : null), 2500);
    setTimeout(() => setToast(null), 3000);
  };
  const ToastEl2 = toast ? (
    <ToastEl $visible={toast.visible} $type={toast.type}>
      {toast.type === 'success' ? '✓ ' : '✗ '}{toast.msg}
    </ToastEl>
  ) : null;
  return { showToast: show, ToastComponent: ToastEl2 };
};

/* ─── Badge ────────────────────────────────────────────────────────────── */
export const Badge = styled.span<{ $color?: string }>`
  display: inline-block;
  padding: 3px 10px; border-radius: 20px;
  font-size: 11px; font-weight: 700;
  background: ${({ $color }) => ($color || '#1FC7D4') + '20'};
  color: ${({ $color }) => $color || '#1FC7D4'};
  border: 1px solid ${({ $color }) => ($color || '#1FC7D4') + '40'};
`;

/* ─── Divider ──────────────────────────────────────────────────────────── */
export const Divider = styled.div`
  height: 1px;
  background: rgba(255,255,255,0.07);
  margin: 20px 0;
`;

/* ─── Page header ──────────────────────────────────────────────────────── */
export const PageDesc = styled.p`
  font-size: 14px; color: rgba(255,255,255,0.45); margin: -4px 0 24px;
`;

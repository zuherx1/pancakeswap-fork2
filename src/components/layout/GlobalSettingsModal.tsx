import React, { useState } from 'react';
import styled from 'styled-components';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';
import { Text } from '../ui/Typography';
import Toggle from '../ui/Toggle';
import Tooltip from '../ui/Tooltip';
import {
  useSettings,
  GasSetting, GAS_LABELS,
  LANGUAGES, Language,
} from '../../context/SettingsContext';
import { useThemeContext } from '../../context/ThemeContext';

/* ─── Styled ─────────────────────────────────────────────────────────────── */
const Sections = styled.div`display: flex; flex-direction: column; gap: 4px;`;

const Section = styled.div`
  background: ${({ theme }) => theme.colors.input};
  border-radius: 18px;
  padding: 16px 18px;
  margin-bottom: 8px;
`;

const SectionTitle = styled.div`
  font-size: 12px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.08em;
  color: ${({ theme }) => theme.colors.textSubtle};
  margin-bottom: 14px;
  display: flex; align-items: center; gap: 6px;
`;

const Row = styled.div`
  display: flex; align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder + '60'};
  &:last-child { border-bottom: none; }
  gap: 12px;
`;

const RowLabel = styled.div`
  display: flex; align-items: center; gap: 6px;
  flex: 1;
`;

const InfoIcon = styled.span`
  cursor: help; color: ${({ theme }) => theme.colors.textSubtle};
  font-size: 13px; flex-shrink: 0;
`;

const SlippageGroup = styled.div`
  display: flex; gap: 6px; align-items: center; flex-wrap: wrap;
`;

const SlipBtn = styled.button<{ $active?: boolean }>`
  padding: 5px 12px; border-radius: 10px;
  font-size: 13px; font-weight: 600; font-family: 'Kanit', sans-serif;
  cursor: pointer; transition: all 0.15s;
  border: 1px solid ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.cardBorder};
  background: ${({ $active, theme }) => $active ? theme.colors.primary + '20' : 'transparent'};
  color: ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.textSubtle};
  &:hover { border-color: ${({ theme }) => theme.colors.primary}; }
`;

const CustomInput = styled.input`
  width: 80px; padding: 5px 10px; border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  color: ${({ theme }) => theme.colors.text};
  font-size: 13px; font-weight: 600; font-family: 'Kanit', sans-serif;
  text-align: right; outline: none;
  &:focus { border-color: ${({ theme }) => theme.colors.primary}; }
`;

const GasGroup = styled.div`
  display: flex; gap: 4px; background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: 12px; padding: 3px;
`;

const GasBtn = styled.button<{ $active?: boolean }>`
  flex: 1; padding: 5px 8px; border-radius: 9px;
  font-size: 12px; font-weight: 600; font-family: 'Kanit', sans-serif;
  cursor: pointer; border: none; white-space: nowrap;
  background: ${({ $active, theme }) => $active ? theme.colors.primary : 'transparent'};
  color: ${({ $active, theme }) => $active ? 'white' : theme.colors.textSubtle};
  transition: all 0.15s;
`;

const ExpertWarning = styled.div`
  background: ${({ theme }) => theme.colors.warning + '20'};
  border: 1px solid ${({ theme }) => theme.colors.warning};
  border-radius: 12px; padding: 12px 14px; margin-top: 8px;
`;

const LangGrid = styled.div`
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 6px; margin-top: 8px;
  max-height: 200px; overflow-y: auto;
`;

const LangBtn = styled.button<{ $active?: boolean }>`
  display: flex; align-items: center; gap: 6px;
  padding: 8px 10px; border-radius: 10px;
  font-size: 13px; font-weight: 600; font-family: 'Kanit', sans-serif;
  cursor: pointer; border: none; text-align: left;
  background: ${({ $active, theme }) => $active ? theme.colors.primary + '20' : theme.colors.backgroundAlt};
  color: ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.text};
  border: 1px solid ${({ $active, theme }) => $active ? theme.colors.primary : 'transparent'};
  transition: all 0.15s;
  &:hover { border-color: ${({ theme }) => theme.colors.primary}; }
`;

const ThemeRow = styled.div`
  display: flex; gap: 8px;
`;

const ThemeBtn = styled.button<{ $active?: boolean }>`
  flex: 1; padding: 10px;
  border-radius: 12px; border: none; cursor: pointer;
  font-size: 14px; font-weight: 600; font-family: 'Kanit', sans-serif;
  border: 2px solid ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.cardBorder};
  background: ${({ $active, theme }) => $active ? theme.colors.primary + '15' : 'transparent'};
  color: ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.textSubtle};
  transition: all 0.15s;
`;

const WarningBadge = styled.span`
  font-size: 11px;
  background: ${({ theme }) => theme.colors.warning + '25'};
  color: ${({ theme }) => theme.colors.warning};
  padding: 2px 7px; border-radius: 6px;
  font-weight: 700;
`;

const ResetBtn = styled.button`
  background: none; border: none; cursor: pointer;
  color: ${({ theme }) => theme.colors.textSubtle};
  font-size: 12px; font-family: 'Kanit', sans-serif;
  text-decoration: underline; padding: 0;
  &:hover { color: ${({ theme }) => theme.colors.primary}; }
`;

const SLIP_PRESETS = [0.1, 0.5, 1.0];

interface Props { onDismiss: () => void; }

const GlobalSettingsModal: React.FC<Props> = ({ onDismiss }) => {
  const { settings, update, resetAll } = useSettings();
  const { isDark, toggleTheme }         = useThemeContext();

  const [activeTab,    setActiveTab]    = useState<'swap'|'global'>('swap');
  const [customSlip,   setCustomSlip]   = useState(
    SLIP_PRESETS.includes(settings.slippage) ? '' : String(settings.slippage)
  );
  const [customGas,    setCustomGas]    = useState(settings.customGasPrice);
  const [expertConfirm,setExpertConfirm]= useState(false);
  const [showLangs,    setShowLangs]    = useState(false);

  const isCustomSlip = !SLIP_PRESETS.includes(settings.slippage);

  const handleSlipPreset = (v: number) => {
    update({ slippage: v });
    setCustomSlip('');
  };

  const handleCustomSlip = (v: string) => {
    setCustomSlip(v);
    const n = parseFloat(v);
    if (!isNaN(n) && n > 0 && n <= 50) update({ slippage: n });
  };

  const handleExpertToggle = () => {
    if (!settings.expertMode) {
      setExpertConfirm(true);
    } else {
      update({ expertMode: false });
    }
  };

  return (
    <Modal title="⚙️ Settings" onDismiss={onDismiss}>
      {/* Tab row */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        <Button
          scale="sm" variant={activeTab === 'swap' ? 'primary' : 'tertiary'}
          onClick={() => setActiveTab('swap')} style={{ flex: 1 }}
        >
          🔄 Swaps
        </Button>
        <Button
          scale="sm" variant={activeTab === 'global' ? 'primary' : 'tertiary'}
          onClick={() => setActiveTab('global')} style={{ flex: 1 }}
        >
          🌐 Global
        </Button>
        <ResetBtn onClick={() => { resetAll(); setCustomSlip(''); }}>Reset</ResetBtn>
      </div>

      {/* ── Swap Settings ── */}
      {activeTab === 'swap' && (
        <Sections>
          <Section>
            <SectionTitle>💱 Swap Settings</SectionTitle>

            {/* Slippage */}
            <Row>
              <RowLabel>
                <Text small bold>Slippage Tolerance</Text>
                <Tooltip content="Your transaction will revert if the price changes by more than this percentage.">
                  <InfoIcon>ⓘ</InfoIcon>
                </Tooltip>
              </RowLabel>
              <SlippageGroup>
                {SLIP_PRESETS.map(p => (
                  <SlipBtn key={p} $active={!isCustomSlip && settings.slippage === p} onClick={() => handleSlipPreset(p)}>
                    {p}%
                  </SlipBtn>
                ))}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <CustomInput
                    placeholder="Custom"
                    value={customSlip}
                    onChange={e => handleCustomSlip(e.target.value)}
                    type="number" min="0.01" max="50"
                    style={{ borderColor: isCustomSlip ? '#1FC7D4' : undefined }}
                  />
                  <span style={{ position: 'absolute', right: 8, fontSize: 12, color: '#7A6EAA' }}>%</span>
                </div>
              </SlippageGroup>
            </Row>
            {settings.slippage > 1 && (
              <Text small color="warning" style={{ margin: '4px 0 8px' }}>⚠️ Your transaction may be frontrun</Text>
            )}
            {settings.slippage < 0.05 && (
              <Text small color="failure" style={{ margin: '4px 0 8px' }}>⚠️ Your transaction may fail</Text>
            )}

            {/* Deadline */}
            <Row>
              <RowLabel>
                <Text small bold>Tx Deadline</Text>
                <Tooltip content="Your transaction will revert if it is pending for more than this duration.">
                  <InfoIcon>ⓘ</InfoIcon>
                </Tooltip>
              </RowLabel>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CustomInput
                  style={{ width: 60 }}
                  type="number" min="1"
                  value={settings.deadline}
                  onChange={e => update({ deadline: parseInt(e.target.value) || 20 })}
                />
                <Text small color="textSubtle">mins</Text>
              </div>
            </Row>

            {/* Gas */}
            <Row>
              <RowLabel>
                <Text small bold>Default Gas Speed</Text>
                <Tooltip content="Adjusting gas price changes the speed of your transaction. Higher gas = faster, more expensive.">
                  <InfoIcon>ⓘ</InfoIcon>
                </Tooltip>
              </RowLabel>
              <GasGroup>
                {(['standard','fast','instant'] as GasSetting[]).map(g => (
                  <GasBtn key={g} $active={settings.gasSpeed === g} onClick={() => update({ gasSpeed: g })}>
                    {GAS_LABELS[g].label}
                  </GasBtn>
                ))}
              </GasGroup>
            </Row>
            <Row>
              <RowLabel>
                <Text small color="textSubtle">
                  {settings.gasSpeed === 'custom' ? 'Custom GWEI' : `${GAS_LABELS[settings.gasSpeed].gwei} GWEI`}
                </Text>
              </RowLabel>
              {settings.gasSpeed === 'custom' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CustomInput
                    placeholder="5"
                    value={customGas}
                    onChange={e => { setCustomGas(e.target.value); update({ customGasPrice: e.target.value }); }}
                    type="number" min="1"
                  />
                  <Text small color="textSubtle">GWEI</Text>
                </div>
              )}
            </Row>

            {/* Expert mode */}
            <Row>
              <RowLabel>
                <Text small bold>Expert Mode</Text>
                {settings.expertMode && <WarningBadge>ON</WarningBadge>}
                <Tooltip content="Allows high slippage trades and skips the confirmation screen. Use at your own risk.">
                  <InfoIcon>ⓘ</InfoIcon>
                </Tooltip>
              </RowLabel>
              <Toggle
                checked={settings.expertMode}
                onChange={handleExpertToggle}
                scale="sm"
              />
            </Row>

            {expertConfirm && !settings.expertMode && (
              <ExpertWarning>
                <Text small bold color="warning" style={{ marginBottom: 6 }}>⚠️ Expert Mode</Text>
                <Text small color="textSubtle" style={{ marginBottom: 10 }}>
                  Expert mode turns off the confirm transaction prompt and allows high slippage trades that can result in bad rates or lost funds.
                </Text>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button scale="sm" variant="danger" onClick={() => { update({ expertMode: true }); setExpertConfirm(false); }}>
                    Turn On
                  </Button>
                  <Button scale="sm" variant="tertiary" onClick={() => setExpertConfirm(false)}>
                    Cancel
                  </Button>
                </div>
              </ExpertWarning>
            )}

            {/* Single hop */}
            <Row>
              <RowLabel>
                <Text small bold>Disable Multihops</Text>
                <Tooltip content="Restricts swaps to direct pairs only. This may cause some swaps to fail.">
                  <InfoIcon>ⓘ</InfoIcon>
                </Tooltip>
              </RowLabel>
              <Toggle
                checked={settings.singleHop}
                onChange={e => update({ singleHop: e.target.checked })}
                scale="sm"
              />
            </Row>
          </Section>
        </Sections>
      )}

      {/* ── Global Settings ── */}
      {activeTab === 'global' && (
        <Sections>
          {/* Theme */}
          <Section>
            <SectionTitle>🎨 Appearance</SectionTitle>
            <ThemeRow>
              <ThemeBtn $active={!isDark} onClick={() => isDark && toggleTheme()}>
                ☀️ Light
              </ThemeBtn>
              <ThemeBtn $active={isDark} onClick={() => !isDark && toggleTheme()}>
                🌙 Dark
              </ThemeBtn>
            </ThemeRow>
          </Section>

          {/* Language */}
          <Section>
            <SectionTitle>🌐 Language</SectionTitle>
            <Button
              scale="sm" variant="tertiary" fullWidth
              onClick={() => setShowLangs(v => !v)}
              style={{ marginBottom: showLangs ? 8 : 0 }}
            >
              {LANGUAGES.find(l => l.code === settings.language)?.flag}{' '}
              {LANGUAGES.find(l => l.code === settings.language)?.label}
              {' '}{showLangs ? '▲' : '▼'}
            </Button>
            {showLangs && (
              <LangGrid>
                {LANGUAGES.map(l => (
                  <LangBtn
                    key={l.code}
                    $active={settings.language === l.code}
                    onClick={() => { update({ language: l.code as Language }); setShowLangs(false); }}
                  >
                    {l.flag} {l.label}
                  </LangBtn>
                ))}
              </LangGrid>
            )}
          </Section>

          {/* Audio */}
          <Section>
            <SectionTitle>🔊 Audio</SectionTitle>
            <Row>
              <RowLabel>
                <Text small bold>Flippy Sounds</Text>
                <Tooltip content="Fun sounds when you flip tokens or complete a swap.">
                  <InfoIcon>ⓘ</InfoIcon>
                </Tooltip>
              </RowLabel>
              <Toggle
                checked={settings.audioEffects}
                onChange={e => update({ audioEffects: e.target.checked })}
                scale="sm"
              />
            </Row>
          </Section>

          {/* Networks */}
          <Section>
            <SectionTitle>🌐 Networks</SectionTitle>
            <Row>
              <RowLabel>
                <Text small bold>Show Testnets</Text>
                <Tooltip content="Display testnet networks in the network switcher.">
                  <InfoIcon>ⓘ</InfoIcon>
                </Tooltip>
              </RowLabel>
              <Toggle
                checked={settings.showTestnets}
                onChange={e => update({ showTestnets: e.target.checked })}
                scale="sm"
              />
            </Row>
          </Section>
        </Sections>
      )}
    </Modal>
  );
};

export default GlobalSettingsModal;

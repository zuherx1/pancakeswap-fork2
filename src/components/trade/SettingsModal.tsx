import React, { useState } from 'react';
import styled from 'styled-components';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Text, Heading } from '../ui/Typography';
import Tooltip from '../ui/Tooltip';

const Section = styled.div`
  margin-bottom: 24px;
`;

const SlippageButtons = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
`;

const SlipBtn = styled.button<{ active?: boolean }>`
  padding: 6px 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Kanit', sans-serif;
  cursor: pointer;
  transition: all 0.15s;
  background: ${({ active, theme }) => active ? theme.colors.primary : theme.colors.input};
  color: ${({ active, theme }) => active ? 'white' : theme.colors.text};
  border: 1px solid ${({ active, theme }) => active ? theme.colors.primary : theme.colors.cardBorder};
  &:hover { border-color: ${({ theme }) => theme.colors.primary}; }
`;

const CustomInput = styled(Input)`
  width: 100px;
  text-align: right;
  padding-right: 28px;
`;

const InputWrap = styled.div`
  position: relative;
  width: 100px;
  .pct { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); color: ${({ theme }) => theme.colors.textSubtle}; font-size: 14px; }
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const WarningText = styled(Text)`
  color: ${({ theme }) => theme.colors.warning};
  font-size: 13px;
  margin-top: 6px;
`;

const SLIPPAGE_PRESETS = [0.1, 0.5, 1.0];

interface SettingsModalProps {
  onDismiss: () => void;
  slippage: number;
  deadline: number;
  onSlippageChange: (v: number) => void;
  onDeadlineChange: (v: number) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  onDismiss, slippage, deadline, onSlippageChange, onDeadlineChange,
}) => {
  const [customSlippage, setCustomSlippage] = useState(
    SLIPPAGE_PRESETS.includes(slippage) ? '' : String(slippage)
  );
  const [customDeadline, setCustomDeadline] = useState(String(deadline));
  const isCustom = !SLIPPAGE_PRESETS.includes(slippage);

  const handleCustomSlippage = (v: string) => {
    setCustomSlippage(v);
    const n = parseFloat(v);
    if (!isNaN(n) && n > 0 && n <= 50) onSlippageChange(n);
  };

  const handleDeadline = (v: string) => {
    setCustomDeadline(v);
    const n = parseInt(v);
    if (!isNaN(n) && n > 0) onDeadlineChange(n);
  };

  return (
    <Modal title="Settings" onDismiss={onDismiss}>
      <Section>
        <Row>
          <Heading scale="md" style={{ fontSize: 16 }}>Slippage Tolerance</Heading>
          <Tooltip content="Your transaction will revert if the price changes unfavorably by more than this percentage.">
            <span style={{ cursor: 'help', color: '#7A6EAA', fontSize: 14 }}>ⓘ</span>
          </Tooltip>
        </Row>
        <SlippageButtons>
          {SLIPPAGE_PRESETS.map(p => (
            <SlipBtn
              key={p}
              active={!isCustom && slippage === p}
              onClick={() => { onSlippageChange(p); setCustomSlippage(''); }}
            >
              {p}%
            </SlipBtn>
          ))}
          <InputWrap>
            <CustomInput
              placeholder="Custom"
              value={customSlippage}
              onChange={e => handleCustomSlippage(e.target.value)}
              type="number"
              min="0.01"
              max="50"
            />
            <span className="pct">%</span>
          </InputWrap>
        </SlippageButtons>
        {slippage > 1 && (
          <WarningText>⚠️ Your transaction may be frontrun</WarningText>
        )}
        {slippage < 0.05 && (
          <WarningText>⚠️ Transaction may fail</WarningText>
        )}
      </Section>

      <Section>
        <Row>
          <Heading scale="md" style={{ fontSize: 16 }}>Tx Deadline</Heading>
          <Tooltip content="Your transaction will revert if it is pending for more than this period of time.">
            <span style={{ cursor: 'help', color: '#7A6EAA', fontSize: 14 }}>ⓘ</span>
          </Tooltip>
        </Row>
        <Row>
          <Input
            style={{ width: 80 }}
            value={customDeadline}
            onChange={e => handleDeadline(e.target.value)}
            type="number"
            min="1"
          />
          <Text color="textSubtle">minutes</Text>
        </Row>
      </Section>

      <Button fullWidth onClick={onDismiss}>Save Settings</Button>
    </Modal>
  );
};

export default SettingsModal;

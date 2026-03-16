import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Button } from '../ui/Button';
import TokenLogo from '../ui/TokenLogo';
import { Text } from '../ui/Typography';
import Tooltip from '../ui/Tooltip';
import TokenSelectModal from './TokenSelectModal';
import SettingsModal from './SettingsModal';
import { useSwap } from '../../hooks/useSwap';
import { useWeb3 } from '../../context/Web3Context';
import { Token } from '../../constants/tokens';

/* ─── Animations ────────────────────────────────────────────────────────────── */
const spin = keyframes`from{transform:rotate(0deg)}to{transform:rotate(360deg)}`;
const pulse = keyframes`0%,100%{box-shadow:0 0 0 0 rgba(31,199,212,0.4)}50%{box-shadow:0 0 0 8px rgba(31,199,212,0)}`;

/* ─── Styled ────────────────────────────────────────────────────────────────── */
const Card = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 24px;
  padding: 0;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 4px 32px rgba(0,0,0,0.06);
`;

const CardTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 0;
`;

const CardTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const IconBtn = styled.button`
  width: 36px; height: 36px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.input};
  border: none;
  color: ${({ theme }) => theme.colors.textSubtle};
  font-size: 18px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
  &:hover { background: ${({ theme }) => theme.colors.inputSecondary}; }
`;

const CardBody = styled.div`
  padding: 16px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

/* Token input panel */
const TokenPanel = styled.div`
  background: ${({ theme }) => theme.colors.input};
  border-radius: 20px;
  padding: 16px;
  border: 1px solid transparent;
  transition: border-color 0.2s;
  &:focus-within { border-color: ${({ theme }) => theme.colors.primary}; }
`;

const PanelTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const PanelLabel = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSubtle};
  font-weight: 500;
`;

const BalanceText = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSubtle};
  cursor: pointer;
  &:hover { color: ${({ theme }) => theme.colors.primary}; }
`;

const PanelBottom = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const AmountInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 28px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  font-family: 'Kanit', sans-serif;
  min-width: 0;
  &::placeholder { color: ${({ theme }) => theme.colors.textDisabled}; }
`;

const UsdValue = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSubtle};
  margin-top: 4px;
  display: block;
`;

const TokenSelector = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 16px;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
  flex-shrink: 0;
  &:hover { border-color: ${({ theme }) => theme.colors.primary}; background: ${({ theme }) => theme.colors.input}; }
`;

const TokenSymbol = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`;

const Chevron = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSubtle};
`;

/* Switch button */
const SwitchWrap = styled.div`
  display: flex;
  justify-content: center;
  position: relative;
  z-index: 1;
  margin: -4px 0;
`;

const SwitchBtn = styled.button`
  width: 36px; height: 36px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.input};
  border: 4px solid ${({ theme }) => theme.colors.backgroundAlt};
  color: ${({ theme }) => theme.colors.primary};
  font-size: 20px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    transform: rotate(180deg);
  }
`;

/* Details panel */
const DetailsPanel = styled.div<{ visible: boolean }>`
  background: ${({ theme }) => theme.colors.input};
  border-radius: 16px;
  padding: ${({ visible }) => (visible ? '12px 16px' : '0')};
  max-height: ${({ visible }) => (visible ? '300px' : '0')};
  overflow: hidden;
  transition: all 0.3s ease;
  margin-top: ${({ visible }) => (visible ? '4px' : '0')};
  opacity: ${({ visible }) => (visible ? 1 : 0)};
`;

const DetailRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;
`;

const DetailLabel = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSubtle};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const DetailValue = styled.span<{ warning?: boolean; danger?: boolean }>`
  font-size: 14px;
  font-weight: 600;
  color: ${({ warning, danger, theme }) =>
    danger ? theme.colors.danger : warning ? theme.colors.warning : theme.colors.text};
`;

const RouteWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
`;

const RouteStep = styled.span`
  font-size: 12px;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  padding: 2px 8px;
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
`;

const RouteArrow = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSubtle};
`;

const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors.danger};
  font-size: 14px;
  text-align: center;
  padding: 8px;
  background: ${({ theme }) => theme.colors.danger}15;
  border-radius: 12px;
`;

/* ─── Component ─────────────────────────────────────────────────────────────── */
const MOCK_PRICES: Record<string, number> = {
  BNB: 580, WBNB: 580, CAKE: 2.4, BUSD: 1, USDT: 1,
  USDC: 1, ETH: 3200, BTCB: 67000, DAI: 1,
};

const SwapCard: React.FC = () => {
  const { isConnected, connect } = useWeb3();
  const { state, setInputToken, setOutputToken, setInputAmount, setSlippage, setDeadline, switchTokens, executeSwap } = useSwap();

  const [showInputModal,  setShowInputModal]  = useState(false);
  const [showOutputModal, setShowOutputModal] = useState(false);
  const [showSettings,    setShowSettings]    = useState(false);
  const [showDetails,     setShowDetails]     = useState(false);
  const [swapping,        setSwapping]        = useState(false);

  const inputUsd  = state.inputAmount
    ? (parseFloat(state.inputAmount) * (MOCK_PRICES[state.inputToken.symbol] || 0)).toFixed(2)
    : null;
  const outputUsd = state.outputAmount
    ? (parseFloat(state.outputAmount) * (MOCK_PRICES[state.outputToken.symbol] || 0)).toFixed(2)
    : null;

  const impactNum = parseFloat(state.priceImpact);
  const impactWarning = impactNum > 3;
  const impactDanger  = impactNum > 5;

  const handleSwap = async () => {
    setSwapping(true);
    const ok = await executeSwap();
    setSwapping(false);
    if (ok) setShowDetails(false);
  };

  const canSwap = isConnected && state.inputAmount && state.outputAmount && !state.loading;

  return (
    <>
      <Card>
        <CardTop>
          <CardTitle>Swap</CardTitle>
          <div style={{ display: 'flex', gap: 8 }}>
            <IconBtn onClick={() => setShowSettings(true)} title="Settings">⚙️</IconBtn>
            <IconBtn title="Recent transactions">🕐</IconBtn>
          </div>
        </CardTop>

        <CardBody>
          {/* Input Token */}
          <TokenPanel>
            <PanelTop>
              <PanelLabel>From</PanelLabel>
              <BalanceText onClick={() => setInputAmount('0.00')}>Balance: 0.00</BalanceText>
            </PanelTop>
            <PanelBottom>
              <div style={{ flex: 1, minWidth: 0 }}>
                <AmountInput
                  placeholder="0.0"
                  value={state.inputAmount}
                  onChange={e => {
                    const v = e.target.value;
                    if (v === '' || /^\d*\.?\d*$/.test(v)) {
                      setInputAmount(v);
                      setShowDetails(!!v);
                    }
                  }}
                  type="text"
                  inputMode="decimal"
                />
                {inputUsd && <UsdValue>≈ ${inputUsd}</UsdValue>}
              </div>
              <TokenSelector onClick={() => setShowInputModal(true)}>
                <TokenLogo src={state.inputToken.logoURI} symbol={state.inputToken.symbol} size={24} />
                <TokenSymbol>{state.inputToken.symbol}</TokenSymbol>
                <Chevron>▼</Chevron>
              </TokenSelector>
            </PanelBottom>
          </TokenPanel>

          {/* Switch */}
          <SwitchWrap>
            <SwitchBtn onClick={switchTokens} title="Switch tokens">⇅</SwitchBtn>
          </SwitchWrap>

          {/* Output Token */}
          <TokenPanel>
            <PanelTop>
              <PanelLabel>To</PanelLabel>
              <BalanceText>Balance: 0.00</BalanceText>
            </PanelTop>
            <PanelBottom>
              <div style={{ flex: 1, minWidth: 0 }}>
                <AmountInput
                  placeholder="0.0"
                  value={state.outputAmount}
                  readOnly
                  style={{ opacity: state.loading ? 0.5 : 1 }}
                />
                {outputUsd && <UsdValue>≈ ${outputUsd}</UsdValue>}
              </div>
              <TokenSelector onClick={() => setShowOutputModal(true)}>
                <TokenLogo src={state.outputToken.logoURI} symbol={state.outputToken.symbol} size={24} />
                <TokenSymbol>{state.outputToken.symbol}</TokenSymbol>
                <Chevron>▼</Chevron>
              </TokenSelector>
            </PanelBottom>
          </TokenPanel>

          {/* Exchange rate */}
          {state.exchangeRate !== '0' && state.inputAmount && (
            <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0' }}>
              <Text small color="textSubtle">
                1 {state.inputToken.symbol} = {state.exchangeRate} {state.outputToken.symbol}
              </Text>
            </div>
          )}

          {/* Error */}
          {state.error && <ErrorText>⚠️ {state.error}</ErrorText>}

          {/* Details */}
          <DetailsPanel visible={showDetails && !!state.outputAmount}>
            <DetailRow>
              <DetailLabel>
                Price Impact
                <Tooltip content="The difference between the market price and estimated price due to trade size.">
                  <span style={{ cursor: 'help', fontSize: 12 }}>ⓘ</span>
                </Tooltip>
              </DetailLabel>
              <DetailValue warning={impactWarning} danger={impactDanger}>
                {impactDanger ? '🔴' : impactWarning ? '🟡' : '🟢'} {state.priceImpact}%
              </DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>
                Min. Received
                <Tooltip content={`Minimum received after slippage (${state.slippage}%)`}>
                  <span style={{ cursor: 'help', fontSize: 12 }}>ⓘ</span>
                </Tooltip>
              </DetailLabel>
              <DetailValue>{state.minimumReceived} {state.outputToken.symbol}</DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>Trading Fee</DetailLabel>
              <DetailValue>{state.fee} {state.outputToken.symbol}</DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>Slippage</DetailLabel>
              <DetailValue>{state.slippage}%</DetailValue>
            </DetailRow>
            {state.route.length > 0 && (
              <DetailRow>
                <DetailLabel>Route</DetailLabel>
                <RouteWrap>
                  {state.route.map((s, i) => (
                    <React.Fragment key={s}>
                      {i > 0 && <RouteArrow>→</RouteArrow>}
                      <RouteStep>{s}</RouteStep>
                    </React.Fragment>
                  ))}
                </RouteWrap>
              </DetailRow>
            )}
          </DetailsPanel>

          {/* Action Button */}
          {!isConnected ? (
            <Button fullWidth scale="lg" onClick={connect} style={{ marginTop: 8 }}>
              🔓 Connect Wallet
            </Button>
          ) : !state.inputAmount ? (
            <Button fullWidth scale="lg" disabled style={{ marginTop: 8 }}>
              Enter an amount
            </Button>
          ) : impactDanger ? (
            <Button fullWidth scale="lg" variant="danger" onClick={handleSwap} isLoading={swapping} style={{ marginTop: 8 }}>
              {swapping ? 'Swapping…' : '⚠️ Swap Anyway (High Impact)'}
            </Button>
          ) : (
            <Button fullWidth scale="lg" onClick={handleSwap} isLoading={swapping} disabled={!canSwap} style={{ marginTop: 8 }}>
              {swapping ? 'Swapping…' : 'Swap'}
            </Button>
          )}
        </CardBody>
      </Card>

      {/* Modals */}
      {showInputModal && (
        <TokenSelectModal
          onDismiss={() => setShowInputModal(false)}
          onSelect={setInputToken}
          selectedToken={state.inputToken}
          otherToken={state.outputToken}
        />
      )}
      {showOutputModal && (
        <TokenSelectModal
          onDismiss={() => setShowOutputModal(false)}
          onSelect={setOutputToken}
          selectedToken={state.outputToken}
          otherToken={state.inputToken}
        />
      )}
      {showSettings && (
        <SettingsModal
          onDismiss={() => setShowSettings(false)}
          slippage={state.slippage}
          deadline={state.deadline}
          onSlippageChange={setSlippage}
          onDeadlineChange={setDeadline}
        />
      )}
    </>
  );
};

export default SwapCard;

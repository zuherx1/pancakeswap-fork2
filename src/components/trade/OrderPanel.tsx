import React from 'react';
import styled from 'styled-components';
import { Button } from '../ui/Button';
import { Text } from '../ui/Typography';
import { usePerps, OrderSide, OrderType } from '../../hooks/usePerps';
import { useWeb3 } from '../../context/Web3Context';

const Wrapper = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-top: 1px solid ${({ theme }) => theme.colors.cardBorder};
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SideRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
`;

const SideBtn = styled.button<{ side: OrderSide; active?: boolean }>`
  padding: 10px;
  font-size: 15px;
  font-weight: 700;
  font-family: 'Kanit', sans-serif;
  border: none;
  cursor: pointer;
  transition: all 0.15s;
  background: ${({ active, side, theme }) => {
    if (!active) return theme.colors.input;
    return side === 'long' ? theme.colors.success : theme.colors.danger;
  }};
  color: ${({ active, theme }) => active ? 'white' : theme.colors.textSubtle};
`;

const TypeRow = styled.div`
  display: flex;
  gap: 6px;
`;

const TypeBtn = styled.button<{ active?: boolean }>`
  padding: 6px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  font-family: 'Kanit', sans-serif;
  border: 1px solid ${({ active, theme }) => active ? theme.colors.primary : theme.colors.cardBorder};
  background: ${({ active, theme }) => active ? theme.colors.primary + '20' : 'transparent'};
  color: ${({ active, theme }) => active ? theme.colors.primary : theme.colors.textSubtle};
  cursor: pointer;
  transition: all 0.15s;
`;

const LabelRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
`;

const InputWrap = styled.div`
  background: ${({ theme }) => theme.colors.input};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 12px;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  &:focus-within { border-color: ${({ theme }) => theme.colors.primary}; }
`;

const StyledInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  font-family: 'Kanit', sans-serif;
  min-width: 0;
  &::placeholder { color: ${({ theme }) => theme.colors.textDisabled}; }
`;

const Unit = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSubtle};
  flex-shrink: 0;
`;

const LeverageWrap = styled.div``;

const LeverageTrack = styled.div`
  position: relative;
  margin: 8px 0 4px;
`;

const LeverageSlider = styled.input`
  width: 100%;
  accent-color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  height: 4px;
`;

const LeverageMarks = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
`;

const LevMark = styled.button<{ active?: boolean }>`
  font-size: 11px;
  font-weight: 600;
  font-family: 'Kanit', sans-serif;
  color: ${({ active, theme }) => active ? theme.colors.primary : theme.colors.textSubtle};
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
`;

const InfoGrid = styled.div`
  background: ${({ theme }) => theme.colors.input};
  border-radius: 12px;
  padding: 10px 14px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
`;

const InfoItem = styled.div``;

const ErrorBox = styled.div`
  background: ${({ theme }) => theme.colors.danger + '15'};
  border-radius: 10px;
  padding: 8px 12px;
  color: ${({ theme }) => theme.colors.danger};
  font-size: 13px;
`;

const LEV_MARKS = [1, 5, 10, 25, 50];

interface Props {
  perps: ReturnType<typeof usePerps>;
}

const OrderPanel: React.FC<Props> = ({ perps }) => {
  const { isConnected, connect } = useWeb3();
  const {
    activeMarket, orderSide, setOrderSide, orderType, setOrderType,
    leverage, setLeverage, margin, setMargin,
    limitPrice, setLimitPrice, stopPrice, setStopPrice,
    loading, error, placeOrder, positionSize,
  } = perps;

  const maxLev  = Math.min(activeMarket.maxLeverage, 125);
  const notional = margin && leverage ? (Number(margin) * leverage).toFixed(2) : '0.00';
  const liqPrice = margin && leverage
    ? orderSide === 'long'
      ? (activeMarket.markPrice * (1 - 0.9 / leverage)).toFixed(2)
      : (activeMarket.markPrice * (1 + 0.9 / leverage)).toFixed(2)
    : '—';

  return (
    <Wrapper>
      {/* Long / Short */}
      <SideRow>
        <SideBtn side="long"  active={orderSide === 'long'}  onClick={() => setOrderSide('long')}>Long ▲</SideBtn>
        <SideBtn side="short" active={orderSide === 'short'} onClick={() => setOrderSide('short')}>Short ▼</SideBtn>
      </SideRow>

      {/* Order type */}
      <TypeRow>
        {(['market','limit','stop'] as OrderType[]).map(t => (
          <TypeBtn key={t} active={orderType === t} onClick={() => setOrderType(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </TypeBtn>
        ))}
      </TypeRow>

      {/* Limit price */}
      {(orderType === 'limit' || orderType === 'stop') && (
        <div>
          <LabelRow>
            <Text small color="textSubtle">{orderType === 'stop' ? 'Stop Price' : 'Limit Price'}</Text>
          </LabelRow>
          <InputWrap>
            <StyledInput
              placeholder={String(activeMarket.markPrice.toFixed(2))}
              value={orderType === 'stop' ? stopPrice : limitPrice}
              onChange={e => orderType === 'stop' ? setStopPrice(e.target.value) : setLimitPrice(e.target.value)}
              type="number"
            />
            <Unit>USDT</Unit>
          </InputWrap>
        </div>
      )}

      {/* Margin */}
      <div>
        <LabelRow>
          <Text small color="textSubtle">Margin</Text>
          <Text small color="textSubtle">Avail: 0.00 USDT</Text>
        </LabelRow>
        <InputWrap>
          <StyledInput
            placeholder="0.00"
            value={margin}
            onChange={e => setMargin(e.target.value)}
            type="number"
            min="0"
          />
          <Unit>USDT</Unit>
        </InputWrap>
      </div>

      {/* Leverage */}
      <LeverageWrap>
        <LabelRow>
          <Text small color="textSubtle">Leverage</Text>
          <Text small bold color="primary">{leverage}×</Text>
        </LabelRow>
        <LeverageTrack>
          <LeverageSlider
            type="range"
            min={1}
            max={maxLev}
            value={leverage}
            onChange={e => setLeverage(Number(e.target.value))}
          />
        </LeverageTrack>
        <LeverageMarks>
          {LEV_MARKS.filter(m => m <= maxLev).concat(maxLev).filter((v,i,a) => a.indexOf(v)===i).map(m => (
            <LevMark key={m} active={leverage === m} onClick={() => setLeverage(m)}>{m}×</LevMark>
          ))}
        </LeverageMarks>
      </LeverageWrap>

      {/* Order info */}
      {margin && Number(margin) > 0 && (
        <InfoGrid>
          <InfoItem>
            <Text small color="textSubtle">Position Size</Text>
            <Text small bold>{positionSize} {activeMarket.baseAsset}</Text>
          </InfoItem>
          <InfoItem>
            <Text small color="textSubtle">Notional</Text>
            <Text small bold>{notional} USDT</Text>
          </InfoItem>
          <InfoItem>
            <Text small color="textSubtle">Entry Price</Text>
            <Text small bold>
              {orderType === 'limit' && limitPrice ? Number(limitPrice).toFixed(2) : activeMarket.markPrice.toFixed(2)} USDT
            </Text>
          </InfoItem>
          <InfoItem>
            <Text small color="textSubtle">Liq. Price</Text>
            <Text small bold color="failure">{liqPrice} USDT</Text>
          </InfoItem>
          <InfoItem>
            <Text small color="textSubtle">Funding</Text>
            <Text small bold>{(activeMarket.fundingRate * 100).toFixed(4)}%</Text>
          </InfoItem>
          <InfoItem>
            <Text small color="textSubtle">Fees</Text>
            <Text small bold>{(Number(notional) * 0.0002).toFixed(4)} USDT</Text>
          </InfoItem>
        </InfoGrid>
      )}

      {error && <ErrorBox>⚠️ {error}</ErrorBox>}

      {/* Action */}
      {!isConnected ? (
        <Button fullWidth onClick={connect}>🔓 Connect Wallet</Button>
      ) : (
        <Button
          fullWidth
          variant={orderSide === 'long' ? 'primary' : 'danger'}
          isLoading={loading}
          disabled={!margin || Number(margin) <= 0 || loading}
          onClick={placeOrder}
          style={{
            background: orderSide === 'long'
              ? 'linear-gradient(135deg,#31D0AA,#1FC7D4)'
              : 'linear-gradient(135deg,#ED4B9E,#FF6B6B)',
          }}
        >
          {loading ? 'Placing Order…' : `${orderSide === 'long' ? '▲ Long' : '▼ Short'} ${activeMarket.baseAsset}`}
        </Button>
      )}
    </Wrapper>
  );
};

export default OrderPanel;
